import { getAllPosts, getAllTags } from '@/lib/blog'
import { BlogIndex } from './blog-index'

export default function BlogPage() {
  const posts = getAllPosts()
  const tags = getAllTags()
  return <BlogIndex posts={posts} tags={tags} />
}
