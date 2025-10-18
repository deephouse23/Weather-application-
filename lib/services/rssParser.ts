/**
 * 16-Bit Weather Platform - RSS Parser Service
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Universal RSS/ATOM feed parser for news aggregation
 */

export interface ParsedFeedItem {
  id: string;
  title: string;
  description?: string;
  link: string;
  pubDate: Date;
  author?: string;
  imageUrl?: string;
  content?: string;
  categories?: string[];
}

export interface ParsedFeed {
  title: string;
  description?: string;
  link: string;
  items: ParsedFeedItem[];
}

/**
 * Parse RSS 2.0 or ATOM feed from XML string
 */
export async function parseRSSFeed(xmlString: string): Promise<ParsedFeed> {
  // Parse XML string
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');

  // Check for parsing errors
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Failed to parse RSS feed: Invalid XML');
  }

  // Detect feed type (RSS or ATOM)
  const isAtom = doc.querySelector('feed') !== null;

  if (isAtom) {
    return parseATOMFeed(doc);
  } else {
    return parseRSS2Feed(doc);
  }
}

/**
 * Parse RSS 2.0 feed
 */
function parseRSS2Feed(doc: Document): ParsedFeed {
  const channel = doc.querySelector('channel');

  if (!channel) {
    throw new Error('Invalid RSS feed: No channel element found');
  }

  const feed: ParsedFeed = {
    title: getElementText(channel, 'title') || 'Unknown Feed',
    description: getElementText(channel, 'description'),
    link: getElementText(channel, 'link') || '',
    items: []
  };

  const items = channel.querySelectorAll('item');

  items.forEach((item, index) => {
    const title = getElementText(item, 'title');
    const link = getElementText(item, 'link');
    const pubDateStr = getElementText(item, 'pubDate');

    if (!title || !link) {
      return; // Skip invalid items
    }

    const feedItem: ParsedFeedItem = {
      id: link + '-' + index,
      title: cleanText(title),
      description: cleanText(getElementText(item, 'description') || ''),
      link: link,
      pubDate: pubDateStr ? new Date(pubDateStr) : new Date(),
      author: getElementText(item, 'author') || getElementText(item, 'dc:creator'),
      imageUrl: extractImageFromRSS(item),
      content: getElementText(item, 'content:encoded') || getElementText(item, 'description'),
      categories: extractCategories(item)
    };

    feed.items.push(feedItem);
  });

  return feed;
}

/**
 * Parse ATOM feed
 */
function parseATOMFeed(doc: Document): ParsedFeed {
  const feedElement = doc.querySelector('feed');

  if (!feedElement) {
    throw new Error('Invalid ATOM feed: No feed element found');
  }

  const feed: ParsedFeed = {
    title: getElementText(feedElement, 'title') || 'Unknown Feed',
    description: getElementText(feedElement, 'subtitle'),
    link: getAtomLink(feedElement) || '',
    items: []
  };

  const entries = feedElement.querySelectorAll('entry');

  entries.forEach((entry, index) => {
    const title = getElementText(entry, 'title');
    const link = getAtomLink(entry);
    const publishedStr = getElementText(entry, 'published') || getElementText(entry, 'updated');

    if (!title || !link) {
      return; // Skip invalid entries
    }

    const feedItem: ParsedFeedItem = {
      id: getElementText(entry, 'id') || link + '-' + index,
      title: cleanText(title),
      description: cleanText(getElementText(entry, 'summary') || ''),
      link: link,
      pubDate: publishedStr ? new Date(publishedStr) : new Date(),
      author: getElementText(entry, 'author > name'),
      imageUrl: extractImageFromAtom(entry),
      content: getElementText(entry, 'content'),
      categories: extractCategoriesAtom(entry)
    };

    feed.items.push(feedItem);
  });

  return feed;
}

/**
 * Get text content from XML element
 */
function getElementText(parent: Element, selector: string): string | undefined {
  const element = parent.querySelector(selector);
  return element?.textContent?.trim() || undefined;
}

/**
 * Get link from ATOM entry
 */
function getAtomLink(element: Element): string | undefined {
  const link = element.querySelector('link[rel="alternate"]') || element.querySelector('link');
  return link?.getAttribute('href') || undefined;
}

/**
 * Extract image URL from RSS item
 */
function extractImageFromRSS(item: Element): string | undefined {
  // Try various image sources

  // 1. Media RSS (media:thumbnail or media:content)
  const mediaThumbnail = item.querySelector('media\\:thumbnail, thumbnail');
  if (mediaThumbnail) {
    return mediaThumbnail.getAttribute('url') || undefined;
  }

  const mediaContent = item.querySelector('media\\:content, content');
  if (mediaContent && mediaContent.getAttribute('medium') === 'image') {
    return mediaContent.getAttribute('url') || undefined;
  }

  // 2. Enclosure (typically for podcasts but sometimes images)
  const enclosure = item.querySelector('enclosure[type^="image"]');
  if (enclosure) {
    return enclosure.getAttribute('url') || undefined;
  }

  // 3. Extract from description/content HTML
  const description = getElementText(item, 'description') || getElementText(item, 'content:encoded') || '';
  const imgMatch = description.match(/<img[^>]+src="([^">]+)"/i);
  if (imgMatch) {
    return imgMatch[1];
  }

  return undefined;
}

/**
 * Extract image URL from ATOM entry
 */
function extractImageFromAtom(entry: Element): string | undefined {
  // 1. Media thumbnail
  const mediaThumbnail = entry.querySelector('media\\:thumbnail, thumbnail');
  if (mediaThumbnail) {
    return mediaThumbnail.getAttribute('url') || undefined;
  }

  // 2. Link with type="image"
  const imageLink = entry.querySelector('link[type^="image"]');
  if (imageLink) {
    return imageLink.getAttribute('href') || undefined;
  }

  // 3. Extract from content/summary HTML
  const content = getElementText(entry, 'content') || getElementText(entry, 'summary') || '';
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/i);
  if (imgMatch) {
    return imgMatch[1];
  }

  return undefined;
}

/**
 * Extract categories from RSS item
 */
function extractCategories(item: Element): string[] {
  const categories: string[] = [];
  const categoryElements = item.querySelectorAll('category');

  categoryElements.forEach(cat => {
    const text = cat.textContent?.trim();
    if (text) {
      categories.push(text);
    }
  });

  return categories;
}

/**
 * Extract categories from ATOM entry
 */
function extractCategoriesAtom(entry: Element): string[] {
  const categories: string[] = [];
  const categoryElements = entry.querySelectorAll('category');

  categoryElements.forEach(cat => {
    const term = cat.getAttribute('term');
    if (term) {
      categories.push(term);
    }
  });

  return categories;
}

/**
 * Clean text by removing HTML tags and extra whitespace
 */
function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#039;/g, "'") // Replace &#039; with '
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}

/**
 * Fetch and parse RSS feed from URL
 */
export async function fetchAndParseRSS(url: string): Promise<ParsedFeed> {
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml',
        'User-Agent': '16BitWeather/1.0'
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status} ${response.statusText}`);
    }

    const xmlText = await response.text();
    return parseRSSFeed(xmlText);
  } catch (error) {
    console.error(`Error fetching RSS feed from ${url}:`, error);
    throw error;
  }
}
