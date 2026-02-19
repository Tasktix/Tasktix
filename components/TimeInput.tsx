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

import { Input } from '@heroui/react';
import { useState } from 'react';

import { formatTime } from '@/lib/date';

/**
 * A time picker that allows for arbitrary time input in HHH:MM format (i.e. there is no
 * upper bound on times that can be selected; this input gathers total time, not time of
 * day). Built on a HeroUI <Input /> component
 *
 * @param value If specified, value to display in input (making it controlled)
 * @param defaultValue The initial value to use if uncontrolled
 * @param onValueChange If specified, callback to control the input
 * @param label The <Input /> component's label
 * @param labelPlacement The <Input /> component's label position
 * @param variant  The <Input /> component variant to use
 * @param color The <Input /> component's color
 * @param size The <Input /> component's size
 * @param autoFocus Whether the <Input /> component should be auto-focused
 * @param tabIndex The <Input /> component's tab index
 * @param className Classes to apply to the <Input /> component
 * @param classNames Classes to apply to slots in the <Input /> component
 */
export default function TimeInput({
  value,
  defaultValue,
  onValueChange,
  label,
  labelPlacement,
  variant,
  color,
  size,
  autoFocus,
  tabIndex,
  className,
  classNames
}: {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => unknown;
  label?: string;
  labelPlacement?: 'outside' | 'outside-left' | 'inside';
  variant?: 'flat' | 'faded' | 'bordered' | 'underlined';
  color?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger';
  size?: 'sm' | 'md' | 'lg';
  autoFocus?: boolean;
  tabIndex?: number;
  className?: string;
  classNames?: { label?: string; inputWrapper?: string; input?: string };
}) {
  const [time, setTime] = useState(formatTime(defaultValue || 0));

  function updateTime(value: string) {
    value = value.replaceAll(/[^0-9]/g, '');
    const hourStr = value.slice(0, -2);
    const minStr = value.slice(-2);

    setTime(`${hourStr}:${minStr}`);

    const ms = (Number(hourStr) * 60 + Number(minStr)) * 60 * 1000;

    if (onValueChange) onValueChange(ms);
  }

  return (
    <Input
      autoFocus={autoFocus ?? true}
      className={className}
      classNames={classNames}
      color={color}
      label={label}
      labelPlacement={labelPlacement}
      size={size}
      tabIndex={tabIndex}
      value={value !== undefined ? formatTime(value) : time}
      variant={variant}
      onValueChange={updateTime}
    />
  );
}
