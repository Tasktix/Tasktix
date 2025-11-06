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

import { FormEvent, useEffect, useState } from 'react';
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@heroui/react';
import { Check } from 'react-bootstrap-icons';

import TimeInput from '../TimeInput';

import Time from './Time';

export default function ExpectedInput({
  ms,
  disabled,
  updateMs
}: {
  ms: number | null;
  disabled: boolean;
  updateMs: (ms: number) => unknown;
}) {
  const [value, setValue] = useState(ms ?? 0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => setValue(ms ?? 0), [ms]);

  function _updateTime(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    updateMs(value);
    setIsOpen(false);
  }

  return (
    <Popover
      isOpen={isOpen}
      placement='bottom'
      onOpenChange={open => {
        if (!disabled) setIsOpen(open);
      }}
    >
      <PopoverTrigger className='-mr-2 -my-3 -px-2 relative top-3'>
        <Button
          isIconOnly
          className={`w-fit !px-2 bg-transparent p-0 ${disabled ? '' : 'hover:bg-foreground/10'}`}
          disabled={disabled}
          tabIndex={0}
        >
          <Time label='Expected' ms={ms || 0} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='p-3'>
        <form
          className='flex flex-row items-center gap-2'
          onSubmit={_updateTime}
        >
          <TimeInput
            className='w-12 grow-0'
            color='primary'
            size='sm'
            value={value || undefined}
            variant='underlined'
            onValueChange={setValue}
          />
          <Button
            isIconOnly
            className='rounded-lg w-8 h-8 min-w-8 min-h-8'
            color='primary'
            type='submit'
          >
            <Check />
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
