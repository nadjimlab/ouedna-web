'use client';

import type { ReactNode } from 'react';
import { LanguageProvider, type Lang } from '@/lib/i18n';

export default function AppProviders({ children, initialLang = 'ar' }: { children: ReactNode; initialLang?: Lang }) {
  return <LanguageProvider initialLang={initialLang}>{children}</LanguageProvider>;
}
