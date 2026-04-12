import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getVersesByPage } from '@/api/quran';
import { useEffect } from 'react';

export const pageQueryKey = (pageNumber: number) => ['quran', 'page', pageNumber] as const;

export function usePage(pageNumber: number) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: pageQueryKey(pageNumber),
    queryFn: () => getVersesByPage(pageNumber),
    staleTime: 1000 * 60 * 60, // verses never change
    enabled: pageNumber >= 1 && pageNumber <= 604,
  });

  // Prefetch neighbors for smooth page flips.
  useEffect(() => {
    for (const offset of [-2, -1, 1, 2]) {
      const neighbor = pageNumber + offset;
      if (neighbor >= 1 && neighbor <= 604) {
        qc.prefetchQuery({
          queryKey: pageQueryKey(neighbor),
          queryFn: () => getVersesByPage(neighbor),
          staleTime: 1000 * 60 * 60,
        });
      }
    }
  }, [pageNumber, qc]);

  return query;
}
