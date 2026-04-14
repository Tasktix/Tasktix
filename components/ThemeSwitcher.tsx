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

import {
  Button,
  Listbox,
  ListboxItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Selection
} from '@heroui/react';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import { Display, MoonFill, SunFill } from 'react-bootstrap-icons';

/**
 * Input for switching between light, dark, and system themes. Uses a single icon
 * button that toggles light/dark on desktop while revealing the full theme menu on
 * hover, and toggles the theme menu directly on mobile.
 */
export default function ThemeSwitcher() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [portalEl, setPortalEl] = useState<HTMLDivElement | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedTheme = theme ?? 'system';
  const selectedThemeKeys = new Set([selectedTheme]);
  const activeTheme = resolvedTheme ?? 'light';
  const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';

  /**
   * Keeps the local portal target in sync with the container element so the
   * popover stays anchored within this component subtree.
   */
  function setContainer(node: HTMLDivElement | null) {
    containerRef.current = node;
    setPortalEl(node);
  }

  useEffect(() => {
    const mediaQuery = globalThis.matchMedia(
      '(hover: none), (pointer: coarse)'
    );

    // Keep hover-only behavior disabled on touch-oriented devices.
    function updateIsMobile(event?: MediaQueryListEvent) {
      setIsMobile(event?.matches ?? mediaQuery.matches);
      setIsOpen(false);
    }

    updateIsMobile();
    mediaQuery.addEventListener('change', updateIsMobile);

    return () => {
      mediaQuery.removeEventListener('change', updateIsMobile);

      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Apply the selected theme and close the menu after a choice is made.
  function chooseTheme(themeKey: string) {
    setTheme(themeKey);
    setIsOpen(false);
  }

  // Clear any pending delayed close so hover interactions stay responsive.
  function cancelPendingClose() {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }

  // Delay closing slightly so pointer movement between trigger and menu feels stable.
  function scheduleClose() {
    cancelPendingClose();
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      closeTimeoutRef.current = null;
    }, 100);
  }

  // Toggle the menu on mobile, but keep desktop click behavior as a quick theme swap.
  function handlePress() {
    if (isMobile) {
      setIsOpen(open => !open);

      return;
    }

    setTheme(nextTheme);
  }

  // Let HeroUI close the popover, while only allowing it to open itself on mobile.
  function handleOpenChange(nextOpen: boolean) {
    if (isMobile || !nextOpen) {
      setIsOpen(nextOpen);
    }
  }

  const triggerButton = (
    <Button
      isIconOnly
      aria-expanded={isOpen}
      aria-haspopup='menu'
      aria-label={isMobile ? 'Open theme menu' : `Switch to ${nextTheme} mode`}
      variant='ghost'
      onKeyDown={event => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          setIsOpen(true);
        }

        if (event.key === 'Escape') {
          setIsOpen(false);
        }
      }}
      onMouseEnter={() => {
        if (!isMobile) {
          cancelPendingClose();
          setIsOpen(true);
        }
      }}
      onMouseLeave={() => {
        if (!isMobile) {
          scheduleClose();
        }
      }}
      onPress={handlePress}
    >
      {activeTheme === 'dark' ? <SunFill /> : <MoonFill />}
    </Button>
  );

  const themeOptions = (
    <PopoverContent
      className='p-0'
      onMouseEnter={() => {
        if (!isMobile) {
          cancelPendingClose();
          setIsOpen(true);
        }
      }}
      onMouseLeave={() => {
        if (!isMobile) {
          scheduleClose();
        }
      }}
    >
      <Listbox
        aria-label='Theme options'
        selectedKeys={selectedThemeKeys}
        selectionMode='single'
        onSelectionChange={(keys: Selection) => {
          if (keys === 'all') return;

          const selectedKey = keys.keys().next().value;

          if (selectedKey) chooseTheme(String(selectedKey));
        }}
      >
        <ListboxItem key='light' startContent={<SunFill />}>
          Light
        </ListboxItem>
        <ListboxItem key='dark' startContent={<MoonFill />}>
          Dark
        </ListboxItem>
        <ListboxItem key='system' startContent={<Display />}>
          System
        </ListboxItem>
      </Listbox>
    </PopoverContent>
  );

  return (
    <div ref={setContainer} className='flex items-center'>
      <Popover
        isOpen={isOpen}
        placement='bottom-end'
        portalContainer={portalEl ?? undefined}
        onOpenChange={handleOpenChange}
      >
        <PopoverTrigger>{triggerButton}</PopoverTrigger>
        {themeOptions}
      </Popover>
    </div>
  );
}
