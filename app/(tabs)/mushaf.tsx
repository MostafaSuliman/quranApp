import { Redirect } from 'expo-router';
import { useSettings } from '@/store/settings';

/** Tab entry point — immediately jumps to the user's last page. */
export default function MushafTab() {
  const lastPage = useSettings((s) => s.lastPage);
  return <Redirect href={`/mushaf/${lastPage}` as never} />;
}
