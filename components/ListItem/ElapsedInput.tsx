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

import { useState } from 'react';
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@heroui/react';
import { ArrowCounterclockwise } from 'react-bootstrap-icons';

import Time from './Time';

export default function ElapsedInput({
  disabled,
  ms,
  resetTime
}: {
  disabled: boolean;
  ms: number;
  resetTime: () => unknown;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover
      isOpen={isOpen}
      placement='bottom'
      onOpenChange={open => {
        if (!disabled) setIsOpen(open);
      }}
    >
      <PopoverTrigger className='-mx-2 -px-2'>
        <Button
          isIconOnly
          className={`w-fit !px-2 bg-transparent p-0 ${disabled ? '' : 'hover:bg-foreground/10'}`}
          disabled={disabled}
          tabIndex={0}
        >
          <Time label='Elapsed' ms={ms} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='p-2'>
        <Button
          color='warning'
          variant='light'
          onPress={() => {
            resetTime();
            setIsOpen(false);
          }}
        >
          <ArrowCounterclockwise />
          Reset
        </Button>
      </PopoverContent>
    </Popover>
  );
}
