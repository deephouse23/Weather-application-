import type { Metadata } from 'next'
import { getAllPosts, getAllTags } from '@/lib/blog'
import { BlogIndex } from './blog-index'

const BASE_URL = 'https://www.16bitweather.co'

interface PageProps {
  searchParams: Promise<{ tag?: string }>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { tag } = await searchParams

  const baseTitle = '16 Bit Weather Blog | Weekly Dispatches from 16bitbot'
  const baseDescription =
    'Weekly dispatches from 16bitbot. Space weather, severe storms, weather phenomena, and climate records.'

  // Tag-filtered URLs are near-duplicates of the index — keep them out of the index
  // so crawl budget concentrates on canonical /blog and individual posts.
  if (tag) {
    return {
      title: `${tag} | ${baseTitle}`,
      description: `${tag} posts — ${baseDescription}`,
      robots: { index: false, follow: true },
      alternates: { canonical: `${BASE_URL}/blog` },
    }
  }

  return {
    title: baseTitle,
    description: baseDescription,
    alternates: { canonical: `${BASE_URL}/blog` },
  }
}

export default async function BlogPage({ searchParams }: PageProps) {
  const posts = getAllPosts()
  const tags = getAllTags()
  const { tag } = await searchParams
  return <BlogIndex posts={posts} tags={tags} initialTag={tag || null} />
}
