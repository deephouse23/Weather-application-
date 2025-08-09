# Claude CLI Deployment Instructions for v0.3.2 - Planet Extremes

## 🚀 Deployment Guide for PR Review

### Prerequisites
- Ensure you have Vercel CLI installed: `npm i -g vercel`
- Make sure you're logged into Vercel: `vercel login`

---

## Step 1: Create Feature Branch
```bash
# Create and checkout new feature branch
git checkout -b feature/planet-extremes-v0.3.2

# Check status to see all new files
git status
```

## Step 2: Stage and Commit Changes
```bash
# Add all new extremes feature files
git add app/extremes/
git add lib/extremes/
git add app/api/extremes/
git add components/navigation.tsx
git add package.json
git add README.md
git add RELEASE_v0.3.2.md
git add CLAUDE_CLI_DEPLOYMENT.md

# Or add all changes at once
git add .

# Commit with descriptive message
git commit -m "feat: Add Planet Extremes feature v0.3.2

- Add global temperature extremes tracking page
- Monitor 30 locations (15 hot, 15 cold)
- Implement temperature leaderboards
- Add animated thermometer visualizations
- Include user location ranking
- Add educational facts about extreme locations
- Implement 30-minute caching strategy
- Update navigation with Extremes link"
```

## Step 3: Push to GitHub
```bash
# Push the feature branch to GitHub
git push origin feature/planet-extremes-v0.3.2
```

## Step 4: Deploy Preview to Vercel
```bash
# Deploy preview build for this branch
vercel

# Vercel will prompt you:
# ? Set up and deploy "~/Desktop/Weather-application--main"? [Y/n] Y
# ? Which scope do you want to deploy to? (select your account)
# ? Link to existing project? [y/N] y
# ? What's the name of your existing project? 16-bit-weather (or your project name)

# The deployment will generate a preview URL like:
# https://16-bit-weather-abc123-yourusername.vercel.app
```

## Step 5: Create Pull Request on GitHub

### Option A: Using GitHub CLI
```bash
# If you have GitHub CLI installed
gh pr create \
  --title "feat: Planet Extremes - Global Temperature Tracker v0.3.2" \
  --body "## 🌡️ Planet Extremes Feature

### Summary
Adds real-time global temperature extremes tracking with retro 16-bit visualizations.

### Features Added
- 🔥 Hottest place on Earth monitoring
- 🧊 Coldest place on Earth tracking  
- 📊 Temperature leaderboards (Top 5 hot/cold)
- 📍 User location global ranking
- 🎮 Animated retro thermometer visualizations
- 💡 Educational facts about extreme locations

### Technical Details
- Monitors 30 global locations for temperature extremes
- Implements 30-minute caching to reduce API calls
- Fully responsive with theme support (Dark/Miami/Tron)
- Batch API processing for efficiency

### Preview Deployment
🔗 [Preview URL](paste-your-vercel-preview-url-here)

### Testing Checklist
- [ ] Extremes page loads correctly
- [ ] Thermometer animations work
- [ ] User location ranking displays (if permitted)
- [ ] Auto-refresh toggle functions
- [ ] All themes display properly
- [ ] Mobile responsive design works

Closes #issue-number" \
  --head feature/planet-extremes-v0.3.2 \
  --base main
```

### Option B: Manual GitHub PR
1. Go to your repository on GitHub
2. Click "Pull requests" → "New pull request"
3. Select base: `main` ← compare: `feature/planet-extremes-v0.3.2`
4. Use the PR template above

## Step 6: Add Preview Link to PR
```bash
# After Vercel deployment completes, get the preview URL
vercel ls

# Copy the preview URL and add it to your PR description
# Edit the PR to include the preview link
```

## Step 7: Automated Vercel + GitHub Integration

If you have Vercel GitHub integration enabled:
1. Vercel automatically builds preview for each push
2. Vercel bot comments on PR with preview links
3. Status checks show deployment status

To enable:
```bash
# Link your GitHub repo to Vercel project
vercel link

# Enable GitHub integration in Vercel dashboard
# Go to: https://vercel.com/[your-username]/[project]/settings/git
```

---

## 🔧 Useful Commands for Claude CLI

### Check deployment status
```bash
# List all deployments
vercel ls

# Get deployment URL
vercel inspect [deployment-url]

# View logs
vercel logs [deployment-url]
```

### Environment variables (if needed)
```bash
# Pull production env vars
vercel env pull

# Add env var to preview
vercel env add NEXT_PUBLIC_OPENWEATHER_API_KEY
```

### Rollback if needed
```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback [deployment-url]
```

---

## 📝 PR Description Template

```markdown
## 🌡️ Planet Extremes - Global Temperature Tracker v0.3.2

### 🎯 Overview
This PR introduces the Planet Extremes feature, allowing users to track Earth's hottest and coldest places in real-time with retro 16-bit visualizations.

### ✨ Features
- **Hottest Place on Earth**: Live monitoring with temperature, conditions, and facts
- **Coldest Place on Earth**: Real-time data from polar regions
- **Temperature Leaderboards**: Top 5 hottest/coldest locations
- **User Location Ranking**: Personal temperature ranking
- **Retro Visualizations**: Animated pixel-art thermometers
- **Smart Caching**: 30-minute cache to optimize API usage

### 🔗 Preview
- **Preview Deployment**: [View Live](PASTE_VERCEL_PREVIEW_URL)
- **Extremes Page**: `/extremes`

### 📸 Screenshots
![Extremes Page](add-screenshot-url)

### 🧪 Testing
- [x] Local development tested
- [x] Production build successful
- [x] API endpoints working
- [x] Caching implemented
- [x] Responsive design verified
- [x] Theme compatibility checked

### 📊 Performance
- API calls: 30 locations batch processed
- Cache duration: 30 minutes
- Page load: < 2 seconds

### 🔄 Changes
- Added `/app/extremes/page.tsx`
- Added `/lib/extremes/` data services
- Added `/app/api/extremes/` endpoint
- Updated navigation with Extremes link
- Updated package.json to v0.3.2

### 📝 Documentation
- Updated README with v0.3.2 features
- Added RELEASE_v0.3.2.md notes
- Added deployment instructions

### 🚀 Deployment
After merge, deploy to production:
\`\`\`bash
vercel --prod
\`\`\`
```

---

## 🎯 Quick Deploy Script

Create a file `deploy-preview.sh`:
```bash
#!/bin/bash
echo "🚀 Deploying Planet Extremes v0.3.2 Preview..."

# Ensure on correct branch
git checkout feature/planet-extremes-v0.3.2

# Build locally first
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Vercel
    echo "☁️ Deploying to Vercel..."
    vercel --yes
    
    echo "🎉 Preview deployment complete!"
    echo "📝 Don't forget to add the preview URL to your PR!"
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi
```

Make it executable:
```bash
chmod +x deploy-preview.sh
./deploy-preview.sh
```

---

## 🤖 For Claude CLI in Cursor

When using Claude CLI in Cursor, you can run:
```bash
# One-liner to stage, commit, push, and deploy
git add . && git commit -m "feat: Planet Extremes v0.3.2" && git push origin feature/planet-extremes-v0.3.2 && vercel
```

---

## ✅ Deployment Checklist
- [ ] Feature branch created
- [ ] All changes committed
- [ ] Branch pushed to GitHub
- [ ] Preview deployed to Vercel
- [ ] PR created with preview link
- [ ] Tests pass on preview
- [ ] Ready for review

---

**Note**: After PR approval and merge, deploy to production with `vercel --prod`
