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
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SlotsToClasses
} from '@heroui/react';
import { useEffect, useRef, useState } from 'react';

import { formatDate } from '@/lib/date';

import CalendarInput from './CalendarInput';

export default function DateInput2({
  label,
  placeholder,
  className,
  classNames,
  defaultValue,
  color = 'default',
  size,
  variant,
  disabled,
  value,
  onValueChange
}: {
  label?: string;
  placeholder?: string;
  className?: string;
  classNames?: SlotsToClasses<
    | 'label'
    | 'input'
    | 'base'
    | 'description'
    | 'errorMessage'
    | 'mainWrapper'
    | 'inputWrapper'
    | 'innerWrapper'
    | 'clearButton'
    | 'helperWrapper'
  >;
  defaultValue?: Date;
  color?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'warning'
    | 'success';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'flat' | 'faded' | 'bordered' | 'underlined';
  disabled?: boolean;
  value?: Date;
  onValueChange?: (date: Date) => unknown;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState(value || defaultValue || null);
  const input = useRef<HTMLInputElement | null>();
  const lastTrigger = useRef(new Date());

  // Respect the `value` prop if there is one
  useEffect(() => {
    if (value !== undefined) setDate(value);
  }, [value]);

  function handleInput(value: Date) {
    if (!value) setDate(value);
    else if (onValueChange) onValueChange(value);
    debounceOpenChange(false);
  }

  function debounceOpenChange(isOpen: boolean) {
    if (Date.now() - lastTrigger.current.getTime() < 250) {
      if (input.current) {
        input.current.blur();
        input.current.dataset.focusWithin = 'false';
        input.current.dataset.focus = 'false';
      }

      return;
    }
    lastTrigger.current = new Date();

    if (isOpen) {
      if (!disabled) {
        setIsOpen(true);
        if (input.current) {
          input.current.blur();
          input.current.dataset.focusWithin = 'true';
          input.current.dataset.focus = 'true';
        }
      }
    } else {
      setIsOpen(false);
      if (input.current) {
        input.current.blur();
        input.current.dataset.focusWithin = 'false';
        input.current.dataset.focus = 'false';
      }
    }

    input.current?.blur();
  }

  return (
    <Input
      className={`${className} ${disabled ? 'opacity-50' : ''}`}
      classNames={classNames}
      defaultValue={defaultValue ? formatDate(defaultValue) : undefined}
      disabled={disabled}
      label={label}
      placeholder={placeholder}
      size={size}
      startContent={
        <Popover
          isOpen={isOpen}
          placement='bottom-start'
          onOpenChange={debounceOpenChange}
        >
          <PopoverTrigger className='-ml-2 -mb-2 mt-1'>
            <div className='invisible' />
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
      }
      value={date ? formatDate(date, false) : undefined}
      variant={variant}
      onFocusChange={debounceOpenChange}
    />
  );
}
