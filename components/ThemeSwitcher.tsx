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

import { clearTimeout, setTimeout } from 'timers';

import {
  Button,
  Listbox,
  ListboxItem,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@heroui/react';
import { useTheme } from 'next-themes';
import { useRef, useState } from 'react';
import { Display, MoonFill, SunFill } from 'react-bootstrap-icons';

/**
 * Input for switching between light, dark, and system themes. Provides a button for
 * toggling between light/dark mode. When the toggle is hovered over, opens a menu that
 * allows system theme to be selected in addition to light/dark.
 */
export default function ThemeSwitcher() {
  const timer = useRef<NodeJS.Timeout>(undefined);
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const systemTheme =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  const themeIcon = theme === 'system' ? systemTheme : theme;

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
          onPress={() => setTheme(themeIcon === 'dark' ? 'light' : 'dark')}
        >
          {themeIcon === 'dark' ? <SunFill /> : <MoonFill />}
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
