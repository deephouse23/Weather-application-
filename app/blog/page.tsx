import { getAllPosts, getAllTags } from '@/lib/blog'
import { BlogIndex } from './blog-index'

interface PageProps {
  searchParams: Promise<{ tag?: string }>
}

export default async function BlogPage({ searchParams }: PageProps) {
  const posts = getAllPosts()
  const tags = getAllTags()
  const { tag } = await searchParams
  return <BlogIndex posts={posts} tags={tags} initialTag={tag || null} />
}
