import { useNavigate as useRRNavigate } from 'react-router-dom';
import { useYol } from '../i18n';

/** Dil önekli useNavigate: navigate('/sarj-haritasi') → EN'de '/en/sarj-haritasi'. */
export function useNavigate() {
  const nav = useRRNavigate();
  const lp = useYol();
  return (to: string, opts?: { replace?: boolean }) => nav(to.startsWith('/') ? lp(to) : to, opts);
}
