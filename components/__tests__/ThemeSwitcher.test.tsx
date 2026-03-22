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

import type { ReactNode } from 'react';

import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HeroUIProvider } from '@heroui/react';
import { useTheme } from 'next-themes';

import ThemeSwitcher from '../ThemeSwitcher';

vi.mock(import('framer-motion'), async importOriginal => ({
  ...(await importOriginal()),
  LazyMotion: ({ children }) => <div>{children}</div>
}));

vi.mock('@heroui/react', async importOriginal => {
  const originalModule = await importOriginal<typeof import('@heroui/react')>();
  const React = await import('react');

  const Popover = (({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  )) as unknown as typeof originalModule.Popover;

  const PopoverTrigger = (({ children }: { children: ReactNode }) => (
    <>{children}</>
  )) as unknown as typeof originalModule.PopoverTrigger;

  const PopoverContent = (({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  )) as unknown as typeof originalModule.PopoverContent;

  const Listbox = (({
    children,
    onAction,
    'aria-label': ariaLabel
  }: {
    children: ReactNode;
    onAction?: (key: string) => void;
    'aria-label'?: string;
  }) => (
    <div aria-label={ariaLabel} role='listbox'>
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return child;

        const itemKey = String(child.key).replace(/^\.\$?/, '');

        return React.cloneElement(
          child as React.ReactElement<{
            itemKey: string;
            onAction?: (key: string) => void;
          }>,
          { itemKey, onAction }
        );
      })}
    </div>
  )) as unknown as typeof originalModule.Listbox;

  const ListboxItem = (({
    children,
    itemKey,
    onAction
  }: {
    children: ReactNode;
    itemKey: string;
    onAction?: (key: string) => void;
  }) => (
    <button
      aria-selected='false'
      role='option'
      type='button'
      onClick={() => onAction?.(itemKey)}
    >
      {children}
    </button>
  )) as unknown as typeof originalModule.ListboxItem;

  return {
    ...originalModule,
    Popover,
    PopoverTrigger,
    PopoverContent,
    Listbox,
    ListboxItem
  };
});

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

  test('opens the theme menu on click and allows selecting system theme', async () => {
    const user = userEvent.setup();
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
    await user.click(await screen.findByRole('option', { name: 'System' }));

    await waitFor(() => {
      expect(setTheme).toHaveBeenCalledWith('system');
    });
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
