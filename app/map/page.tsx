import { redirect } from 'next/navigation';

type MapRedirectPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function MapRedirectPage({ searchParams }: MapRedirectPageProps) {
  const params = new URLSearchParams();

  Object.entries(searchParams || {}).forEach(([key, value]) => {
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
