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

import { Button, Popover, PopoverContent, PopoverTrigger } from '@heroui/react';
import { useState } from 'react';
import { PaletteFill, X } from 'react-bootstrap-icons';

import { namedColors, NamedColor } from '@/lib/model/color';
import { getBackgroundColor } from '@/lib/color';

export default function ColorPicker({
  value,
  onValueChange,
  className
}: {
  value: NamedColor | null;
  onValueChange: (color: NamedColor | null) => unknown;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  function pickColor(color: NamedColor | null) {
    onValueChange(color);
    setIsOpen(false);
  }

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <Button
          isIconOnly
          className={`${value ? getBackgroundColor(value) : ''} ${className}`}
          size='sm'
        >
          <PaletteFill />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='grid grid-cols-3 gap-1'>
        {namedColors.map(color => (
          <Button
            key={color}
            isIconOnly
            aria-label={color}
            className={`rounded-md w-6 h-6 min-w-6 min-h-6 ${getBackgroundColor(color)}`}
            onPress={pickColor.bind(null, color)}
          />
        ))}
        <Button
          key='clear'
          isIconOnly
          aria-label='clear'
          className={`rounded-md w-6 h-6 min-w-6 min-h-6`}
          onPress={pickColor.bind(null, null)}
        >
          <X />
        </Button>
      </PopoverContent>
    </Popover>
  );
}
