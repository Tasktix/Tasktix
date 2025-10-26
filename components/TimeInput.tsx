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

import { Input } from '@nextui-org/react';
import { useState } from 'react';

import { formatTime } from '@/lib/date';

export default function TimeInput({
  label,
  labelPlacement,
  variant,
  color,
  size,
  value,
  autoFocus,
  tabIndex,
  defaultValue,
  className,
  classNames,
  onValueChange
}: {
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
  value?: number;
  defaultValue?: number;
  autoFocus?: boolean;
  tabIndex?: number;
  className?: string;
  classNames?: { label?: string; inputWrapper?: string; input?: string };
  onValueChange?: (value: number) => unknown;
}) {
  const [time, setTime] = useState(formatTime(defaultValue || 0));

  function updateTime(value: string) {
    value = value.replaceAll(/[^0-9]/g, '');
    const hourStr = value.slice(0, -2);
    const minStr = value.slice(-2);

    setTime(hourStr + ':' + minStr);

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
