import { useQuery } from '@tanstack/react-query';
import { getRecitations, QuranRecitation } from '@/api/quran';

const PREFERRED_SUBSTRINGS = ['Mishary', 'Al-Afasy', 'Alafasy', 'Husary', 'Sudais'];

export function useRecitations() {
  const query = useQuery({
    queryKey: ['quran', 'recitations'],
    queryFn: getRecitations,
    staleTime: Infinity,
  });

  const preferred: QuranRecitation[] = (query.data ?? []).filter((r) =>
    PREFERRED_SUBSTRINGS.some((s) => r.reciter_name.toLowerCase().includes(s.toLowerCase()))
  );

  return { ...query, preferred };
}
