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
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react';
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
    isOpen,
    onOpenChange
  }: {
    children: ReactNode;
    isOpen?: boolean;
    onOpenChange?: (nextOpen: boolean) => void;
  }) => {
    const [trigger, content] = React.Children.toArray(children);

    return (
      <div>
        {trigger}
        <button
          aria-label='request-open-change'
          onClick={() => onOpenChange?.(true)}
        >
          Request open
        </button>
        <button
          aria-label='request-close-change'
          onClick={() => onOpenChange?.(false)}
        >
          Request close
        </button>
        {isOpen ? content : null}
      </div>
    );
  }) as unknown as typeof originalModule.Popover;

  const PopoverTrigger = (({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  )) as unknown as typeof originalModule.PopoverTrigger;

  const PopoverContent = (({
    children,
    onMouseEnter,
    onMouseLeave
  }: {
    children: ReactNode;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
  }) => (
    <dialog open onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {children}
    </dialog>
  )) as unknown as typeof originalModule.PopoverContent;

  const Listbox = (({
    children,
    onSelectionChange,
    selectedKeys,
    'aria-label': ariaLabel
  }: {
    children: ReactNode;
    onSelectionChange?: (keys: Set<string>) => void;
    selectedKeys?: Iterable<string>;
    'aria-label'?: string;
  }) => (
    <select
      aria-label={ariaLabel}
      size={3}
      value={String(selectedKeys?.[Symbol.iterator]().next().value ?? '')}
      onChange={event => onSelectionChange?.(new Set([event.target.value]))}
    >
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return child;

        const itemKey = String(child.key).replace(/^\.\$?/, '');

        return React.cloneElement(
          child as React.ReactElement<{
            itemKey: string;
          }>,
          { itemKey }
        );
      })}
    </select>
  )) as unknown as typeof originalModule.Listbox;

  const ListboxItem = (({
    children,
    itemKey
  }: {
    children: ReactNode;
    itemKey: string;
  }) => (
    <option value={itemKey}>{children}</option>
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

  Object.defineProperty(globalThis, 'matchMedia', {
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

    fireEvent.mouseEnter(screen.getByLabelText('Switch to light mode'));
    await user.selectOptions(
      await screen.findByRole('listbox', { name: 'Theme options' }),
      'system'
    );

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

    vi.mocked(globalThis.matchMedia).mockImplementation(() => ({
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

  test('opens and closes the menu from keyboard controls on desktop', () => {
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

    const button = screen.getByLabelText('Switch to dark mode');

    fireEvent.keyDown(button, { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(button, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('ignores HeroUI open requests on desktop but accepts close requests', () => {
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

    fireEvent.click(screen.getByLabelText('request-open-change'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    const button = screen.getByLabelText('Switch to dark mode');

    fireEvent.keyDown(button, { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('request-close-change'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('opens and closes on desktop hover transitions', () => {
    vi.useFakeTimers();
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

    const button = screen.getByLabelText('Switch to dark mode');

    fireEvent.mouseEnter(button);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    const popoverContent = screen.getByRole('listbox').parentElement;

    expect(popoverContent).not.toBeNull();
    if (!popoverContent) throw new Error('Expected popover content wrapper');

    fireEvent.mouseEnter(popoverContent);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.mouseLeave(popoverContent);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('cancels a pending close when the trigger is hovered again', () => {
    vi.useFakeTimers();
    const setTheme = vi.fn();
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

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

    const button = screen.getByLabelText('Switch to dark mode');

    fireEvent.mouseEnter(button);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.mouseLeave(button);
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(clearTimeoutSpy).toHaveBeenCalled();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  test('clears a pending close timeout on unmount', () => {
    vi.useFakeTimers();
    const setTheme = vi.fn();
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      themes: ['light', 'dark', 'system'],
      setTheme
    });

    const { unmount } = render(
      <HeroUIProvider disableRipple>
        <ThemeSwitcher />
      </HeroUIProvider>
    );

    const button = screen.getByLabelText('Switch to dark mode');

    fireEvent.mouseEnter(button);
    fireEvent.mouseLeave(button);
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
