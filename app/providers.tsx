/**
 * Tasktix: A powerful and flexible task-tracking tool for all.
 * Copyright (C) 2025 Nate Baird & other Tasktix contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

'use client';

import { ThemeProvider } from 'next-themes';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

import AuthProvider from '@/components/AuthProvider';

export function Providers({
  children,
  isLoggedInAtStart
}: {
  children: React.ReactNode;
  isLoggedInAtStart: boolean;
}) {
  const router = useRouter();

  // Defer importing HeroUIProvider to client
  // The HeroUI library is extremely finicky and even importing it on server (not just server side rendering)
  // causes 500 error. Root layout (which implements providers) needs to be server side for async functions.
  const HeroUIProvider = dynamic(
    () => import('@heroui/react').then(mod => mod.HeroUIProvider),
    { ssr: false }
  );

  return (
    <HeroUIProvider navigate={router.push.bind(router)}>
      <ThemeProvider attribute='class' defaultTheme='system'>
        <AuthProvider isLoggedInAtStart={isLoggedInAtStart}>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </HeroUIProvider>
  );
}
