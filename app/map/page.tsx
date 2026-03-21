import { redirect } from 'next/navigation';

type MapRedirectPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MapRedirectPage({ searchParams }: MapRedirectPageProps) {
  const params = new URLSearchParams();
  const resolved = searchParams ? await searchParams : {};

  Object.entries(resolved).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry !== undefined) {
          params.append(key, entry);
        }
      });
    } else if (value !== undefined) {
      params.set(key, value);
    }
  });

  const queryString = params.toString();
  redirect(queryString ? `/radar?${queryString}` : '/radar');
}
