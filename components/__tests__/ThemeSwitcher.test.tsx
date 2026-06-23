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

import type { ReactNode, SetStateAction } from 'react';

import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { render, waitFor } from '@testing-library/react';
import { HeroUIProvider } from '@heroui/react';
import { useTheme } from 'next-themes';
import { renderToString } from 'react-dom/server';

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
        {React.isValidElement(trigger)
          ? React.cloneElement(
              trigger as React.ReactElement<{
                onOpenChange?: () => void;
              }>,
              { onOpenChange: () => onOpenChange?.(!isOpen) }
            )
          : trigger}
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

  const PopoverTrigger = (({
    children,
    onOpenChange
  }: {
    children: ReactNode;
    onOpenChange?: () => void;
  }) => {
    if (!React.isValidElement(children)) return <div>{children}</div>;

    const child = children as React.ReactElement<{
      onPress?: () => void;
    }>;

    return React.cloneElement(child, {
      onPress: () => {
        onOpenChange?.();
      }
    });
  }) as unknown as typeof originalModule.PopoverTrigger;

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

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(globalThis, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches,
      media: '',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  });
}

function waitForHoverCloseDelay() {
  return new Promise<void>(resolve => {
    setTimeout(resolve, 125);
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  mockMatchMedia(false);
  document.documentElement.classList.remove('dark', 'light');
});

describe('ThemeSwitcher', () => {
  test('toggles between light and dark themes on click', async () => {
    const user = userEvent.setup();
    const setTheme = vi.fn((theme: SetStateAction<string>) => {
      const themeKey = typeof theme === 'function' ? theme('light') : theme;

      document.documentElement.classList.toggle('dark', themeKey === 'dark');
    });

    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      themes: ['light', 'dark', 'system'],
      setTheme
    });

    const { getByLabelText } = render(
      <HeroUIProvider disableRipple>
        <ThemeSwitcher />
      </HeroUIProvider>
    );

    await user.click(getByLabelText('Switch to dark mode'));

    expect(setTheme).toHaveBeenCalledWith('dark');
    expect(document.documentElement).toHaveClass('dark');
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

    const { getByLabelText, findByRole } = render(
      <HeroUIProvider disableRipple>
        <ThemeSwitcher />
      </HeroUIProvider>
    );

    await user.hover(getByLabelText('Switch to light mode'));
    await user.selectOptions(
      await findByRole('listbox', { name: 'Theme options' }),
      'system'
    );

    await waitFor(() => {
      expect(setTheme).toHaveBeenCalledWith('system');
    });
  });

  test('does not open the theme menu when clicked on desktop', async () => {
    const user = userEvent.setup();
    const setTheme = vi.fn();

    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      resolvedTheme: 'dark',
      themes: ['light', 'dark', 'system'],
      setTheme
    });

    const { getByLabelText, queryByRole } = render(
      <HeroUIProvider disableRipple>
        <ThemeSwitcher />
      </HeroUIProvider>
    );

    await user.click(getByLabelText('Switch to light mode'));

    expect(queryByRole('listbox')).not.toBeInTheDocument();
    expect(setTheme).toHaveBeenCalledWith('light');
  });

  test('toggles the theme menu on press for mobile', async () => {
    const user = userEvent.setup();
    const setTheme = vi.fn();

    mockMatchMedia(true);

    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      themes: ['light', 'dark', 'system'],
      setTheme
    });

    const { findByLabelText, findByRole, queryByRole } = render(
      <HeroUIProvider disableRipple>
        <ThemeSwitcher />
      </HeroUIProvider>
    );

    const button = await findByLabelText('Open theme menu');

    expect(queryByRole('listbox')).not.toBeInTheDocument();

    await user.click(button);
    expect(await findByRole('listbox')).toBeInTheDocument();

    await user.click(button);
    expect(queryByRole('listbox')).not.toBeInTheDocument();
    expect(setTheme).not.toHaveBeenCalled();
  });

  test('uses the resolved system theme to determine the next toggle target', async () => {
    const user = userEvent.setup();
    const setTheme = vi.fn();

    vi.mocked(useTheme).mockReturnValue({
      theme: 'system',
      resolvedTheme: 'dark',
      themes: ['light', 'dark', 'system'],
      setTheme
    });

    const { getByLabelText } = render(
      <HeroUIProvider disableRipple>
        <ThemeSwitcher />
      </HeroUIProvider>
    );

    await user.click(getByLabelText('Switch to light mode'));

    expect(setTheme).toHaveBeenCalledWith('light');
  });

  test('opens and closes the menu from keyboard controls on desktop', async () => {
    const user = userEvent.setup();
    const setTheme = vi.fn();

    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      themes: ['light', 'dark', 'system'],
      setTheme
    });

    const { findByRole, getByLabelText, queryByRole } = render(
      <HeroUIProvider disableRipple>
        <ThemeSwitcher />
      </HeroUIProvider>
    );

    const button = getByLabelText('Switch to dark mode');

    await user.type(button, '{ArrowDown}');
    expect(await findByRole('listbox')).toBeInTheDocument();

    await user.type(button, '{Escape}');
    expect(queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('ignores HeroUI open requests on desktop but accepts close requests', async () => {
    const user = userEvent.setup();
    const setTheme = vi.fn();

    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      themes: ['light', 'dark', 'system'],
      setTheme
    });

    const { findByRole, getByLabelText, queryByRole } = render(
      <HeroUIProvider disableRipple>
        <ThemeSwitcher />
      </HeroUIProvider>
    );

    await user.click(getByLabelText('request-open-change'));
    expect(queryByRole('listbox')).not.toBeInTheDocument();

    const button = getByLabelText('Switch to dark mode');

    await user.type(button, '{ArrowDown}');
    expect(await findByRole('listbox')).toBeInTheDocument();

    await user.click(getByLabelText('request-close-change'));
    expect(queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('opens and closes on desktop hover transitions', async () => {
    const user = userEvent.setup();
    const setTheme = vi.fn();

    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      themes: ['light', 'dark', 'system'],
      setTheme
    });

    const { findByRole, getByLabelText, queryByRole } = render(
      <HeroUIProvider disableRipple>
        <ThemeSwitcher />
      </HeroUIProvider>
    );

    const button = getByLabelText('Switch to dark mode');

    await user.hover(button);
    expect(await findByRole('listbox')).toBeInTheDocument();

    const popoverContent = (await findByRole('listbox')).parentElement;

    expect(popoverContent).not.toBeNull();
    if (!popoverContent) throw new Error('Expected popover content wrapper');

    await user.hover(popoverContent);
    expect(await findByRole('listbox')).toBeInTheDocument();

    await user.unhover(popoverContent);
    await waitFor(() => {
      expect(queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  test('cancels a pending close when the trigger is hovered again', async () => {
    const user = userEvent.setup();
    const setTheme = vi.fn();
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      themes: ['light', 'dark', 'system'],
      setTheme
    });

    const { findByRole, getByLabelText } = render(
      <HeroUIProvider disableRipple>
        <ThemeSwitcher />
      </HeroUIProvider>
    );

    const button = getByLabelText('Switch to dark mode');

    await user.hover(button);
    expect(await findByRole('listbox')).toBeInTheDocument();

    await user.unhover(button);
    await user.hover(button);
    await waitForHoverCloseDelay();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    expect(await findByRole('listbox')).toBeInTheDocument();
  });

  test('clears a pending close timeout on unmount', async () => {
    const user = userEvent.setup();
    const setTheme = vi.fn();
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      themes: ['light', 'dark', 'system'],
      setTheme
    });

    const { getByLabelText, unmount } = render(
      <HeroUIProvider disableRipple>
        <ThemeSwitcher />
      </HeroUIProvider>
    );

    const button = getByLabelText('Switch to dark mode');

    await user.hover(button);
    await user.unhover(button);
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  test('uses desktop controls during server rendering', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      themes: ['light', 'dark', 'system'],
      setTheme: vi.fn()
    });

    const markup = renderToString(
      <HeroUIProvider disableRipple>
        <ThemeSwitcher />
      </HeroUIProvider>
    );

    expect(markup).toContain('Switch to dark mode');
  });
});
