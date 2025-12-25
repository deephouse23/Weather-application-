import { NewsItem } from '@/components/NewsTicker/NewsTicker';

export async function fetchAllFOXWeatherNews(maxItems: number = 20): Promise<NewsItem[]> {
    console.warn('FOX Weather service is currently disabled.');
    return [];
}
