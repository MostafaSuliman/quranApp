import { useQuery } from '@tanstack/react-query';
import { getJuzs } from '@/api/quran';

export function useJuzs() {
  return useQuery({
    queryKey: ['quran', 'juzs'],
    queryFn: getJuzs,
    staleTime: Infinity,
  });
}
