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
import { fireEvent, render, screen } from '@testing-library/react';
import { HeroUIProvider } from '@heroui/react';
import { useTheme } from 'next-themes';

import ThemeSwitcher from '../ThemeSwitcher';

vi.mock(import('framer-motion'), async importOriginal => ({
  ...(await importOriginal()),
  LazyMotion: ({ children }) => <div>{children}</div>
}));

vi.mock(import('next-themes'), async importOriginal => {
  const originalModule = await importOriginal();

  return {
    ...originalModule,
    useTheme: vi.fn(() => ({
      theme: 'light',
      resolvedTheme: 'light',
      themes: ['light', 'dark', 'system'],
      setTheme: vi.fn()
    }))
  };
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe('ThemeSwitcher', () => {
  test('toggles between light and dark themes on click', () => {
    const setTheme = vi.fn();

    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      themes: ['light', 'dark', 'system'],
      setTheme
    });

    render(
      <HeroUIProvider disableRipple>
        <ThemeSwitcher />
      </HeroUIProvider>
    );

    fireEvent.click(screen.getByLabelText('Set dark theme'));

    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  test('opens the theme menu on click and allows selecting system theme', () => {
    const setTheme = vi.fn();

    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      resolvedTheme: 'dark',
      themes: ['light', 'dark', 'system'],
      setTheme
    });

    render(
      <HeroUIProvider disableRipple>
        <ThemeSwitcher />
      </HeroUIProvider>
    );

    fireEvent.click(screen.getByLabelText('Choose theme'));
    fireEvent.click(screen.getByText('System'));

    expect(setTheme).toHaveBeenCalledWith('system');
  });

  test('uses the resolved system theme to determine the next toggle target', () => {
    const setTheme = vi.fn();

    vi.mocked(useTheme).mockReturnValue({
      theme: 'system',
      resolvedTheme: 'dark',
      themes: ['light', 'dark', 'system'],
      setTheme
    });

    render(
      <HeroUIProvider disableRipple>
        <ThemeSwitcher />
      </HeroUIProvider>
    );

    fireEvent.click(screen.getByLabelText('Set light theme'));

    expect(setTheme).toHaveBeenCalledWith('light');
  });
});
