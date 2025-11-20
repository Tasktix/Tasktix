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

import { clearTimeout, setTimeout } from 'node:timers';

import {
  Button,
  Listbox,
  ListboxItem,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@heroui/react';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import { Display, MoonFill, SunFill } from 'react-bootstrap-icons';

export default function ThemeSwitcher() {
  const systemTheme = window?.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

  const timer = useRef<NodeJS.Timeout>();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [themeIcon, setThemeIcon] = useState(
    theme === 'system' ? systemTheme : theme
  );

  useEffect(() => {
    setThemeIcon(theme === 'system' ? systemTheme : theme);
  }, [systemTheme, theme]);

  useEffect(() => setIsMounted(true), []);

  function handleMouse(isHovering: boolean) {
    if (isHovering) {
      clearTimeout(timer.current);
      setIsOpen(true);
    } else timer.current = setTimeout(() => setIsOpen(false), 100);
  }

  return (
    <Popover isOpen={isOpen}>
      <PopoverTrigger
        onMouseLeave={() => handleMouse(false)}
        onMouseOver={() => handleMouse(true)}
      >
        <Button
          isIconOnly
          aria-label={`Set ${themeIcon === 'dark' ? 'light' : 'dark'} theme`}
          variant='ghost'
          onClick={() => setTheme(themeIcon === 'dark' ? 'light' : 'dark')}
        >
          {isMounted && themeIcon === 'dark' ? <SunFill /> : <MoonFill />}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        onMouseLeave={() => handleMouse(false)}
        onMouseOver={() => handleMouse(true)}
      >
        <Listbox
          aria-label='Choose theme'
          selectedKeys={[theme || 'system']}
          selectionMode='single'
        >
          <ListboxItem
            key='light'
            startContent={<SunFill />}
            onPress={() => setTheme('light')}
          >
            Light
          </ListboxItem>
          <ListboxItem
            key='dark'
            startContent={<MoonFill />}
            onPress={() => setTheme('dark')}
          >
            Dark
          </ListboxItem>
          <ListboxItem
            key='system'
            startContent={<Display />}
            onPress={() => setTheme('system')}
          >
            System
          </ListboxItem>
        </Listbox>
      </PopoverContent>
    </Popover>
  );
}
