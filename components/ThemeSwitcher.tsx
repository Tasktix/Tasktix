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

import {
  Button,
  Listbox,
  ListboxItem,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@heroui/react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { ChevronDown, Display, MoonFill, SunFill } from 'react-bootstrap-icons';

/**
 * Input for switching between light, dark, and system themes. Provides a button for
 * toggling between light/dark mode plus a separate button that opens a click-driven
 * menu for choosing light, dark, or system mode.
 */
export default function ThemeSwitcher() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const selectedTheme = theme || 'system';
  const activeTheme =
    selectedTheme === 'system' ? (resolvedTheme ?? 'light') : selectedTheme;
  const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';

  function chooseTheme(themeKey: string) {
    setTheme(themeKey);
    setIsOpen(false);
  }

  return (
    <div className='flex items-center gap-1'>
      <Button
        isIconOnly
        aria-label={`Set ${nextTheme} theme`}
        variant='ghost'
        onPress={() => setTheme(nextTheme)}
      >
        {activeTheme === 'dark' ? <SunFill /> : <MoonFill />}
      </Button>

      <Popover isOpen={isOpen} placement='bottom-end' onOpenChange={setIsOpen}>
        <PopoverTrigger>
          <Button
            isIconOnly
            aria-expanded={isOpen}
            aria-haspopup='menu'
            aria-label='Choose theme'
            variant='ghost'
          >
            <ChevronDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='p-0'>
          <Listbox
            aria-label='Theme options'
            selectedKeys={[selectedTheme]}
            selectionMode='single'
            onAction={key => chooseTheme(String(key))}
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
      </Popover>
    </div>
  );
}
