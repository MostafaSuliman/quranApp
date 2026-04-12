import { useQuery } from '@tanstack/react-query';
import { getChapters } from '@/api/quran';

export function useChapters() {
  return useQuery({
    queryKey: ['quran', 'chapters'],
    queryFn: getChapters,
    staleTime: Infinity,
  });
}
