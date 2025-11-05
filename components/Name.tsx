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

import { Button, Input } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { Check } from 'react-bootstrap-icons';

export default function Name({
  name,
  showLabel,
  showUnderline,
  disabled,
  className,
  classNames,
  updateName
}: {
  name: string;
  showLabel?: boolean;
  showUnderline?: boolean;
  disabled?: boolean;
  className?: string;
  classNames?: { input?: string; button?: string };
  updateName: (name: string) => unknown;
}) {
  const [newName, setNewName] = useState(name);
  const [prevName, setPrevName] = useState(name);

  useEffect(() => setPrevName(name), [name]);

  return (
    <form
      className='flex grow shrink w-full'
      onSubmit={e => {
        e.preventDefault();
        updateName(newName);
      }}
    >
      <Input
        className={`${disabled && 'opacity-50'} ${className}`}
        classNames={{
          inputWrapper: `${showLabel || showUnderline || 'border-transparent'}`,
          input: `${showLabel || showUnderline || '-mb-2'} ${classNames?.input}`
        }}
        disabled={disabled}
        label={showLabel && 'Name'}
        size='sm'
        value={newName}
        variant='underlined'
        onValueChange={setNewName}
      />
      <Button
        isIconOnly
        className={`rounded-lg w-8 h-8 min-w-8 min-h-8 ${newName === prevName ? 'hidden' : ''} ${showLabel ? 'mt-4' : ''} ${classNames?.button}`}
        color='primary'
        type='submit'
      >
        <Check />
      </Button>
    </form>
  );
}
