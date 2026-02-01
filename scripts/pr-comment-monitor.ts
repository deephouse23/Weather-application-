#!/usr/bin/env tsx
/**
 * PR Comment Monitor
 * Reads CodeRabbit and Cursor BugBot comments on a PR and extracts actionable issues
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface Issue {
  file: string;
  line?: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  fix?: string;
  tool: 'coderabbit' | 'cursor';
}

interface PRReview {
  tool: string;
  issues: Issue[];
  summary: string;
}

function runCommand(cmd: string): string {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
  } catch (error) {
    console.error(`Command failed: ${cmd}`);
    return '';
  }
}

function fetchPRComments(prNumber: string): PRReview[] {
  console.log(`🔍 Fetching PR #${prNumber} comments...\n`);
  
  const reviews = runCommand(`gh pr view ${prNumber} --json reviews`);
  const comments = runCommand(`gh pr view ${prNumber} --json comments`);
  
  const reviewsData = JSON.parse(reviews || '{}');
  const commentsData = JSON.parse(comments || '{}');
  
  const results: PRReview[] = [];
  
  // Parse CodeRabbit reviews
  if (reviewsData.reviews) {
    const coderabbitReview = reviewsData.reviews.find((r: any) => 
      r.author?.login === 'coderabbitai'
    );
    
    if (coderabbitReview) {
      results.push(parseCodeRabbitReview(coderabbitReview));
    }
  }
  
  // Parse Cursor BugBot reviews
  if (reviewsData.reviews) {
    const cursorReview = reviewsData.reviews.find((r: any) => 
      r.author?.login === 'cursor'
    );
    
    if (cursorReview) {
      results.push(parseCursorReview(cursorReview));
    }
  }
  
  return results;
}

function parseCodeRabbitReview(review: any): PRReview {
  const body = review.body || '';
  const issues: Issue[] = [];
  
  // Parse actionable issues with fix instructions
  const fixSection = body.match(/🤖 Fix all issues with AI agents[\s\S]*?(?=🧹|$)/);
  if (fixSection) {
    const fixText = fixSection[0];
    
    // Extract file-specific issues with fix instructions
    const fileMatches = fixText.matchAll(/In `@([^`]+)`:([\s\S]*?)(?=In `@|$)/g);
    for (const match of fileMatches) {
      const file = match[1];
      const details = match[2].trim();
      
      // Look for specific fixes
      if (details.includes('reset the module cache')) {
        issues.push({
          file,
          message: 'Test environment variable handling - need to reset module cache',
          severity: 'error',
          fix: 'reset-modules',
          tool: 'coderabbit'
        });
      }
      
      if (details.includes('Update the "Identifier" bullet')) {
        issues.push({
          file,
          message: 'Documentation inconsistency - identifier fallback chain',
          severity: 'warning',
          fix: 'update-docs',
          tool: 'coderabbit'
        });
      }
      
      if (details.includes('validate the parsed integer')) {
        issues.push({
          file,
          message: 'Environment variable parsing can produce NaN',
          severity: 'error',
          fix: 'validate-env-parsing',
          tool: 'coderabbit'
        });
      }
    }
  }
  
  // Parse outside diff comments
  const outsideDiffMatch = body.match(/Outside diff range comments[\s\S]*?<\/details>/);
  if (outsideDiffMatch) {
    const outsideText = outsideDiffMatch[0];
    
    // Check for onecall route issue
    if (outsideText.includes('onecall/route.ts') && outsideText.includes('error logging')) {
      issues.push({
        file: 'app/api/weather/onecall/route.ts',
        line: 79,
        message: 'Missing error logging in catch block',
        severity: 'warning',
        fix: 'add-error-logging',
        tool: 'coderabbit'
      });
    }
    
    // Check for pollen route issue
    if (outsideText.includes('pollen/route.ts') && outsideText.includes('rate limit headers')) {
      issues.push({
        file: 'app/api/weather/pollen/route.ts',
        line: 165,
        message: 'Missing rate limit headers on fallback failure',
        severity: 'warning',
        fix: 'add-rate-limit-headers',
        tool: 'coderabbit'
      });
    }
  }
  
  return {
    tool: 'CodeRabbit',
    issues,
    summary: `Found ${issues.length} actionable issues`
  };
}

function parseCursorReview(review: any): PRReview {
  const body = review.body || '';
  
  // Cursor BugBot provides high-level summaries
  const issues: Issue[] = [];
  
  // Extract issue count
  const issueMatch = body.match(/found (\d+) potential issues?/);
  const issueCount = issueMatch ? parseInt(issueMatch[1]) : 0;
  
  return {
    tool: 'Cursor BugBot',
    issues,
    summary: `Found ${issueCount} potential issues (check PR for details)`
  };
}

function generateFixScript(reviews: PRReview[]): void {
  const allIssues = reviews.flatMap(r => r.issues);
  
  if (allIssues.length === 0) {
    console.log('✅ No actionable issues found!');
    return;
  }
  
  console.log(`\n📋 Found ${allIssues.length} actionable issues:\n`);
  
  const fixScript: string[] = [];
  
  allIssues.forEach((issue, index) => {
    console.log(`${index + 1}. [${issue.severity.toUpperCase()}] ${issue.file}`);
    console.log(`   ${issue.message}`);
    console.log(`   Fix type: ${issue.fix}\n`);
    
    fixScript.push(`// Fix ${index + 1}: ${issue.file}`);
    fixScript.push(`// ${issue.message}`);
    fixScript.push(`// Action: ${issue.fix}`);
    fixScript.push('');
  });
  
  // Write issues to JSON for the fix script
  const issuesPath = path.join(process.cwd(), '.opencode', 'skills', 'pr-issues.json');
  fs.mkdirSync(path.dirname(issuesPath), { recursive: true });
  fs.writeFileSync(issuesPath, JSON.stringify(allIssues, null, 2));
  
  console.log(`💾 Issues saved to: ${issuesPath}`);
  console.log('\n🚀 Run: npm run fix:pr-issues  to auto-fix these issues');
}

function main() {
  const prNumber = process.argv[2] || process.env.PR_NUMBER;
  
  if (!prNumber) {
    console.error('❌ Please provide a PR number: tsx scripts/pr-comment-monitor.ts <PR_NUMBER>');
    process.exit(1);
  }
  
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     PR Comment Monitor - CodeRabbit & Cursor          ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  const reviews = fetchPRComments(prNumber);
  
  reviews.forEach(review => {
    console.log(`\n🤖 ${review.tool}:`);
    console.log(`   ${review.summary}`);
    if (review.issues.length > 0) {
      console.log(`   Issues: ${review.issues.length}`);
    }
  });
  
  generateFixScript(reviews);
}

main();
