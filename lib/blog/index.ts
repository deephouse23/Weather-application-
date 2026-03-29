import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

export interface BlogPost {
  slug: string
  title: string
  date: string
  author: string
  summary: string
  tags: string[]
  heroImage: string
  readTime: number
  content: string
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md') || f.endsWith('.mdx'))
  
  const posts = files.map(filename => {
    const filePath = path.join(BLOG_DIR, filename)
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContents)
    
    return {
      slug: data.slug || filename.replace(/\.mdx?$/, ''),
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString(),
      author: data.author || '16bitbot',
      summary: data.summary || '',
      tags: data.tags || [],
      heroImage: data.heroImage || '',
      readTime: data.readTime || Math.ceil(content.split(/\s+/).length / 200),
      content,
    } as BlogPost
  })
  
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string): BlogPost | null {
  const posts = getAllPosts()
  return posts.find(p => p.slug === slug) || null
}

export function getAllTags(): string[] {
  const posts = getAllPosts()
  const tagSet = new Set<string>()
  posts.forEach(p => p.tags.forEach(t => tagSet.add(t)))
  return Array.from(tagSet).sort()
}

export function getPostsByTag(tag: string): BlogPost[] {
  return getAllPosts().filter(p => p.tags.some(t => t.toLowerCase() === tag.toLowerCase()))
}

export function getRelatedPosts(currentSlug: string, limit = 3): BlogPost[] {
  const current = getPostBySlug(currentSlug)
  if (!current) return []
  
  const others = getAllPosts().filter(p => p.slug !== currentSlug)
  
  // Score by shared tags
  const scored = others.map(post => ({
    post,
    score: post.tags.filter(t => current.tags.includes(t)).length,
  }))
  
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map(s => s.post)
}
