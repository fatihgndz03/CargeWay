import { forwardRef } from 'react';
import { Link as RRLink, Navigate as RRNavigate, type LinkProps, type NavigateProps } from 'react-router-dom';
import { useYol } from '../i18n';

/**
 * react-router Link/Navigate/useNavigate'in dil önekli sürümleri: '/araclar' → EN'de '/en/araclar'.
 * Böylece sayfalar içindeki bağlantılar ziyaretçiyi seçtiği dilde tutar.
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function DilLink({ to, ...rest }, ref) {
  const lp = useYol();
  const hedef = typeof to === 'string' && to.startsWith('/') ? lp(to) : to;
  return <RRLink ref={ref} to={hedef} {...rest} />;
});

export function Navigate({ to, ...rest }: NavigateProps) {
  const lp = useYol();
  return <RRNavigate to={typeof to === 'string' && to.startsWith('/') ? lp(to) : to} {...rest} />;
}
