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

  const Popover = (({
    children,
    isOpen
  }: {
    children: ReactNode;
    isOpen?: boolean;
  }) => {
    const [trigger, content] = React.Children.toArray(children);

    return (
      <div>
        {trigger}
        {isOpen ? content : null}
      </div>
    );
  }) as unknown as typeof originalModule.Popover;

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
    onAction,
    onPress
  }: {
    children: ReactNode;
    itemKey: string;
    onAction?: (key: string) => void;
    onPress?: () => void;
  }) => (
    <button
      aria-selected='false'
      role='option'
      type='button'
      onClick={() => {
        onAction?.(itemKey);
        onPress?.();
      }}
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

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }))
  });
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

    fireEvent.click(screen.getByLabelText('Switch to dark mode'));

    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  test('opens the theme menu on hover and allows selecting system theme on desktop', async () => {
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

    fireEvent.mouseEnter(
      screen.getByLabelText('Switch to light mode').parentElement!
    );
    await user.click(await screen.findByRole('option', { name: 'System' }));

    await waitFor(() => {
      expect(setTheme).toHaveBeenCalledWith('system');
    });
  });

  test('does not open the theme menu when clicked on desktop', () => {
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

    fireEvent.click(screen.getByLabelText('Switch to light mode'));

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(setTheme).toHaveBeenCalledWith('light');
  });

  test('toggles the theme menu on press for mobile', async () => {
    const user = userEvent.setup();
    const setTheme = vi.fn();

    vi.mocked(window.matchMedia).mockImplementation(() => ({
      matches: true,
      media: '',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(), // deprecated but required for type
      removeListener: vi.fn(), // deprecated but required for type
      dispatchEvent: vi.fn()
    }));

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

    const button = await screen.findByLabelText('Open theme menu');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await user.click(button);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await user.click(button);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(setTheme).not.toHaveBeenCalled();
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

    fireEvent.click(screen.getByLabelText('Switch to light mode'));

    expect(setTheme).toHaveBeenCalledWith('light');
  });
});
