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
import { useEffect, useState } from 'react';

import { formatDate } from '@/lib/date';

import CalendarInput from './CalendarInput';

export default function DateInput({
  autoFocus,
  label,
  placeholder,
  defaultValue,
  displayContent,
  color = 'default',
  className,
  value,
  onValueChange
}: {
  autoFocus?: boolean;
  label?: string;
  placeholder?: string;
  defaultValue?: Date;
  displayContent?: string;
  color?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'warning'
    | 'success';
  className?: string;
  value?: Date;
  onValueChange?: (date: Date) => unknown;
}) {
  const [isOpen, setIsOpen] = useState(autoFocus);
  const [date, setDate] = useState(value || defaultValue || null);

  const displayedDate = date ? formatDate(date) : placeholder || 'Choose date';

  // Respect the `value` prop if there is one
  useEffect(() => {
    if (value !== undefined) setDate(value);
  }, [value]);

  function handleInput(value: Date) {
    if (onValueChange) onValueChange(value);
    else setDate(value);
    setIsOpen(false);
  }

  return (
    <Popover isOpen={isOpen} placement='bottom' onOpenChange={setIsOpen}>
      <PopoverTrigger className='-ml-2 -mb-2 mt-1'>
        <Button
          className={`w-fit min-w-0 px-2 py-1 text-xs justify-start ${className}`}
          color={color}
          variant='light'
        >
          {displayContent
            ? `${label || ''} ${displayContent}`
            : `${label || ''} ${displayedDate}`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='p-0 overflow-hidden'>
        <CalendarInput
          color={color}
          defaultValue={defaultValue}
          value={value}
          onValueChange={handleInput}
        />
      </PopoverContent>
    </Popover>
  );
}
