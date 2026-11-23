import type { ReactNode } from 'react';
import { DilContext, type Dil } from '.';

export default function DilSaglayici({ dil, children }: { dil: Dil; children: ReactNode }) {
  return <DilContext.Provider value={dil}>{children}</DilContext.Provider>;
}
