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

import { Button } from '@heroui/react';
import { ReactNode, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'react-bootstrap-icons';

export default function CalendarInput({
  defaultValue,
  color = 'default',
  value,
  onValueChange
}: {
  placeholder?: string;
  defaultValue?: Date;
  displayContent?: ReactNode;
  color?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'warning'
    | 'success';
  value?: Date;
  onValueChange?: (date: Date) => unknown;
}) {
  const [date, setDate] = useState(value || defaultValue || null);
  const [currentRange, setCurrentRange] = useState(defaultValue || new Date());

  // Respect the `value` prop if there is one
  useEffect(() => {
    if (value !== undefined) {
      // This component is about to be replaced with HeroUI anyway;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDate(value);
      setCurrentRange(value);
    }
  }, [value]);

  function handleSelect(date: number) {
    const newDate = new Date(currentRange.getTime());

    newDate.setDate(date);

    if (onValueChange) onValueChange(newDate);
    else setDate(newDate);
  }

  // Update the month on the display
  function updateCurrentRange(monthOffset: number) {
    const newDate = new Date(currentRange);

    newDate.setMonth(newDate.getMonth() + monthOffset);
    setCurrentRange(newDate);
  }

  return (
    <>
      <div className='flex flex-col bg-content2 w-full p-1'>
        <span className='flex justify-between items-center gap-2'>
          <Button
            isIconOnly
            className='bg-transparent hover:bg-foreground/10'
            onPress={() => updateCurrentRange(-1)}
          >
            <ChevronLeft />
          </Button>
          {currentRange.toLocaleString('default', {
            month: 'short',
            year: 'numeric'
          })}
          <Button
            isIconOnly
            className='bg-transparent hover:bg-foreground/10'
            onPress={() => updateCurrentRange(1)}
          >
            <ChevronRight />
          </Button>
        </span>
        <span className='flex justify-between px-2'>
          <span className='text-foreground/65'>S</span>
          <span>M</span>
          <span>T</span>
          <span>W</span>
          <span>T</span>
          <span>F</span>
          <span className='text-foreground/65'>S</span>
        </span>
      </div>
      <CalendarInputBody
        color={color}
        current={date}
        month={currentRange}
        onSelect={handleSelect}
      />
    </>
  );
}

function CalendarInputBody({
  color,
  current,
  month,
  onSelect
}: {
  color: 'default' | 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
  current: Date | null;
  month: Date;
  onSelect: (value: number) => unknown;
}) {
  const isCurrentMonth =
    current &&
    current.getFullYear() === month.getFullYear() &&
    current.getMonth() === month.getMonth();
  const monthNum = month.getMonth();

  const monthStart = new Date(month.getTime());

  monthStart.setDate(1);
  const monthEnd = new Date(month.getTime());

  monthEnd.setMonth(monthEnd.getMonth() + 1);
  monthEnd.setDate(0);

  const before = monthStart.getDay();
  const blanks = [];

  for (let i = 0; i < before; i++)
    blanks.push(<div key={`blank${i}`} className='w-6 min-w-6 h-6 min-h-6' />);

  let hoverColor = 'data-[hover=true]:text-default';

  switch (color) {
    case 'primary':
      hoverColor = 'data-[hover=true]:text-primary';
      break;
    case 'secondary':
      hoverColor = 'data-[hover=true]:text-secondary';
      break;
    case 'danger':
      hoverColor = 'data-[hover=true]:text-danger';
      break;
    case 'warning':
      hoverColor = 'data-[hover=true]:text-warning';
      break;
    case 'success':
      hoverColor = 'data-[hover=true]:text-success';
      break;
    case 'default':
      hoverColor = 'data-[hover=true]:text-default';
      break;
  }

  const days = [];

  for (let i = 1; i <= monthEnd.getDate(); i++)
    if (isCurrentMonth && current.getDate() === i)
      days.push(
        <Button
          key={`${monthNum}:${i}`}
          isIconOnly
          className='w-6 min-w-6 h-6 min-h-6 rounded-md'
          color={color}
          variant='solid'
          onPress={() => onSelect(i)}
        >
          {i}
        </Button>
      );
    else
      days.push(
        <Button
          key={`${monthNum}:${i}`}
          isIconOnly
          className={`w-6 min-w-6 h-6 min-h-6 rounded-md ${[0, 6].includes((before + i - 1) % 7) ? 'text-foreground/65' : 'text-foreground'} ${hoverColor}`}
          color={color}
          variant='light'
          onPress={() => onSelect(i)}
        >
          {i}
        </Button>
      );

  return (
    <div className='grid grid-cols-7 w-full gap-1 p-1'>
      {blanks}
      {days}
    </div>
  );
}
