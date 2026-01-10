/**
 * 16-Bit Weather Platform - RSS Parser Service
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Universal RSS/ATOM feed parser for news aggregation
 */

import { XMLParser } from 'fast-xml-parser';

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

// ============================================================================
// XML Parsing Types
// ============================================================================

/** Represents a text node or object with text content */
type XMLTextNode = string | { '#text'?: string; '@_term'?: string; term?: string };

/** Represents a link element in XML feeds */
interface XMLLinkElement {
  '@_rel'?: string;
  '@_href'?: string;
  '@_type'?: string;
  href?: string;
  type?: string;
}

/** Represents a media element in XML feeds */
interface XMLMediaElement {
  '@_url'?: string;
  '@_medium'?: string;
  url?: string;
  medium?: string;
}

/** Generic parsed XML element that can contain various properties */
interface XMLElement {
  [key: string]: XMLTextNode | XMLElement | XMLElement[] | string | number | undefined;
  '#text'?: string;
  '@_url'?: string;
  '@_href'?: string;
  '@_type'?: string;
  '@_rel'?: string;
  '@_term'?: string;
  '@_medium'?: string;
}

// Configure XML parser for RSS/ATOM feeds
const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  ignoreNameSpace: false,
  parseAttributeValue: true,
  parseTrueNumberOnly: false,
  arrayMode: false,
  trimValues: true,
};

const xmlParser = new XMLParser(parserOptions);

/**
 * Parse RSS 2.0 or ATOM feed from XML string
 */
export async function parseRSSFeed(xmlString: string): Promise<ParsedFeed> {
  try {
    // Parse XML string into JavaScript object
    const parsed = xmlParser.parse(xmlString);

    // Check for parsing errors
    if (parsed['?xml'] && parsed['?xml']['@_standalone'] === 'no') {
      // Check for parser errors
      if (parsed.parsererror) {
        throw new Error('Failed to parse RSS feed: Invalid XML');
      }
    }

    // Detect feed type (RSS or ATOM)
    const isAtom = parsed.feed !== undefined;

    if (isAtom) {
      return parseATOMFeed(parsed);
    } else {
      return parseRSS2Feed(parsed);
    }
  } catch (error) {
    throw new Error(`Failed to parse RSS feed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get text value from parsed XML object
 */
function getTextValue(obj: XMLElement | null | undefined, path: string | string[]): string | undefined {
  if (!obj) return undefined;

  const paths = Array.isArray(path) ? path : [path];

  for (const p of paths) {
    const value = obj[p];
    if (value !== undefined && value !== null) {
      if (typeof value === 'string') {
        return value.trim() || undefined;
      }
      if (typeof value === 'object' && !Array.isArray(value) && '#text' in value && typeof value['#text'] === 'string') {
        return value['#text'].trim() || undefined;
      }
    }
  }

  return undefined;
}

/**
 * Get array value from parsed XML object (handles single item vs array)
 */
function getArrayValue(obj: XMLElement | null | undefined, path: string): XMLElement[] {
  if (!obj) return [];
  const value = obj[path];
  if (!value) return [];
  if (Array.isArray(value)) return value as XMLElement[];
  return [value as XMLElement];
}

/**
 * Parse RSS 2.0 feed
 */
function parseRSS2Feed(parsed: Record<string, unknown>): ParsedFeed {
  const rss = parsed.rss as XMLElement | undefined;
  if (!rss || !rss.channel) {
    throw new Error('Invalid RSS feed: No channel element found');
  }

  const channel = rss.channel as XMLElement;
  const feed: ParsedFeed = {
    title: getTextValue(channel, 'title') || 'Unknown Feed',
    description: getTextValue(channel, 'description'),
    link: getTextValue(channel, 'link') || '',
    items: []
  };

  const items = getArrayValue(channel, 'item');

  items.forEach((item: XMLElement, index: number) => {
    const title = getTextValue(item, 'title');
    const link = getTextValue(item, 'link');
    const pubDateStr = getTextValue(item, ['pubDate', 'pubdate', 'dc:date']);

    if (!title || !link) {
      return; // Skip invalid items
    }

    const feedItem: ParsedFeedItem = {
      id: link + '-' + index,
      title: cleanText(title),
      description: cleanText(getTextValue(item, 'description') || ''),
      link: link,
      pubDate: pubDateStr ? new Date(pubDateStr) : new Date(),
      author: getTextValue(item, ['author', 'dc:creator', 'dc:author']),
      imageUrl: extractImageFromRSS(item),
      content: getTextValue(item, ['content:encoded', 'content', 'description']),
      categories: extractCategories(item)
    };

    feed.items.push(feedItem);
  });

  return feed;
}

/**
 * Parse ATOM feed
 */
function parseATOMFeed(parsed: Record<string, unknown>): ParsedFeed {
  const feedElement = parsed.feed as XMLElement | undefined;

  if (!feedElement) {
    throw new Error('Invalid ATOM feed: No feed element found');
  }

  const feed: ParsedFeed = {
    title: getTextValue(feedElement, 'title') || 'Unknown Feed',
    description: getTextValue(feedElement, 'subtitle'),
    link: getAtomLink(feedElement) || '',
    items: []
  };

  const entries = getArrayValue(feedElement, 'entry');

  entries.forEach((entry: XMLElement, index: number) => {
    const title = getTextValue(entry, 'title');
    const link = getAtomLink(entry);
    const publishedStr = getTextValue(entry, ['published', 'updated']);

    if (!title || !link) {
      return; // Skip invalid entries
    }

    const feedItem: ParsedFeedItem = {
      id: getTextValue(entry, 'id') || link + '-' + index,
      title: cleanText(title),
      description: cleanText(getTextValue(entry, 'summary') || ''),
      link: link,
      pubDate: publishedStr ? new Date(publishedStr) : new Date(),
      author: getTextValue(entry, ['author', 'author.name']),
      imageUrl: extractImageFromAtom(entry),
      content: getTextValue(entry, 'content'),
      categories: extractCategoriesAtom(entry)
    };

    feed.items.push(feedItem);
  });

  return feed;
}

/**
 * Get link from ATOM entry
 */
function getAtomLink(element: XMLElement): string | undefined {
  const links = getArrayValue(element, 'link');

  // Find alternate link first, then any link
  const alternateLink = links.find((link: XMLElement) =>
    (typeof link === 'object' && link['@_rel'] === 'alternate') ||
    (typeof link === 'object' && !link['@_rel'])
  );

  if (alternateLink) {
    if (typeof alternateLink === 'string') {
      return alternateLink;
    }
    return (alternateLink['@_href'] || alternateLink['href']) as string | undefined;
  }

  // Fallback to first link
  const firstLink = links[0];
  if (firstLink) {
    if (typeof firstLink === 'string') {
      return firstLink;
    }
    return (firstLink['@_href'] || firstLink['href']) as string | undefined;
  }

  return undefined;
}

/**
 * Extract image URL from RSS item
 */
function extractImageFromRSS(item: XMLElement): string | undefined {
  // 1. Media RSS (media:thumbnail or media:content)
  const mediaThumbnail = item['media:thumbnail'] || item.thumbnail;
  if (mediaThumbnail) {
    if (typeof mediaThumbnail === 'string') {
      return mediaThumbnail;
    }
    const thumb = mediaThumbnail as XMLElement;
    return (thumb['@_url'] || thumb.url) as string | undefined;
  }

  const mediaContent = item['media:content'] || item.content;
  if (mediaContent && typeof mediaContent === 'object') {
    const content = mediaContent as XMLElement;
    if (content['@_medium'] === 'image' || content.medium === 'image') {
      return (content['@_url'] || content.url) as string | undefined;
    }
  }

  // 2. Enclosure (typically for podcasts but sometimes images)
  const enclosure = item.enclosure;
  if (enclosure) {
    const enc = (Array.isArray(enclosure) ? enclosure[0] : enclosure) as XMLElement;
    const type = (enc['@_type'] || enc.type || '') as string;
    if (type.startsWith('image/')) {
      return (enc['@_url'] || enc.url) as string | undefined;
    }
  }

  // 3. Extract from description/content HTML
  const description = getTextValue(item, ['description', 'content:encoded', 'content']) || '';
  const imgMatch = description.match(/<img[^>]+src=["']([^"'>]+)["']/i);
  if (imgMatch) {
    return imgMatch[1];
  }

  return undefined;
}

/**
 * Extract image URL from ATOM entry
 */
function extractImageFromAtom(entry: XMLElement): string | undefined {
  // 1. Media thumbnail
  const mediaThumbnail = entry['media:thumbnail'] || entry.thumbnail;
  if (mediaThumbnail) {
    if (typeof mediaThumbnail === 'string') {
      return mediaThumbnail;
    }
    const thumb = mediaThumbnail as XMLElement;
    return (thumb['@_url'] || thumb.url) as string | undefined;
  }

  // 2. Link with type="image"
  const links = getArrayValue(entry, 'link');
  const imageLink = links.find((link: XMLElement) => {
    if (typeof link === 'string') return false;
    const type = (link['@_type'] || link.type || '') as string;
    return type.startsWith('image/');
  });

  if (imageLink) {
    return (imageLink['@_href'] || imageLink.href) as string | undefined;
  }

  // 3. Extract from content/summary HTML
  const content = getTextValue(entry, ['content', 'summary']) || '';
  const imgMatch = content.match(/<img[^>]+src=["']([^"'>]+)["']/i);
  if (imgMatch) {
    return imgMatch[1];
  }

  return undefined;
}

/**
 * Extract categories from RSS item
 */
function extractCategories(item: XMLElement): string[] {
  const categories: string[] = [];
  const categoryElements = getArrayValue(item, 'category');

  categoryElements.forEach((cat: XMLElement) => {
    const text = typeof cat === 'string' ? cat : (cat['#text'] || cat['@_term'] || cat.term);
    if (text && typeof text === 'string') {
      categories.push(text.trim());
    }
  });

  return categories;
}

/**
 * Extract categories from ATOM entry
 */
function extractCategoriesAtom(entry: XMLElement): string[] {
  const categories: string[] = [];
  const categoryElements = getArrayValue(entry, 'category');

  categoryElements.forEach((cat: XMLElement) => {
    const term = typeof cat === 'string' ? cat : (cat['@_term'] || cat.term);
    if (term && typeof term === 'string') {
      categories.push(term.trim());
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
    // Only log errors in development mode to reduce noise in tests/production
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error fetching RSS feed from ${url}:`, error);
    }
    throw error;
  }
}
