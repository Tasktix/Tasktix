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
 *
 * @vitest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { HeroUIProvider } from '@heroui/react';
import { usePathname, useRouter } from 'next/navigation';

import Sidebar from '@/components/Sidebar/Sidebar';
import { ListContext } from '@/components/Sidebar/listContext';
import List from '@/lib/model/list';

vi.mock(import('next/navigation'), async importOriginal => ({
  ...(await importOriginal()),
  usePathname: vi.fn(),
  useRouter: vi.fn()
}));

function renderSidebar({
  className,
  onNavigate = vi.fn()
}: {
  className?: string;
  onNavigate?: () => void;
} = {}) {
  vi.mocked(usePathname).mockReturnValue('/list');
  vi.mocked(useRouter).mockReturnValue({
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn()
  });

  render(
    <HeroUIProvider disableRipple>
      <ListContext.Provider value={vi.fn()}>
        <Sidebar
          className={className}
          lists={[
            new List(
              'Alpha',
              'Amber',
              [],
              [],
              [],
              false,
              false,
              false,
              'a-list-id'
            )
          ]}
          onNavigate={onNavigate}
        />
      </ListContext.Provider>
    </HeroUIProvider>
  );

  return { onNavigate };
}

describe('Sidebar', () => {
  it('merges the optional className onto the sidebar container', () => {
    renderSidebar({ className: 'hidden md:flex shadow-none' });

    expect(screen.getByRole('complementary')).toHaveClass(
      'hidden',
      'md:flex',
      'shadow-none'
    );
  });
});
