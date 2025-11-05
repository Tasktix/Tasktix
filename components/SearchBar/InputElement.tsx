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
  Input,
  Select,
  SelectItem,
  SharedSelection,
  Switch
} from "@heroui/react";
import { ReactElement } from 'react';

import DateInput from '@/components/DateInput';
import TimeInput from '@/components/TimeInput';
import { getTextColor } from '@/lib/color';

import { Filters, InputAction, InputOption } from './types';

export default function InputElement({
  inputOption,
  value,
  dispatchFilters,
  onValueChange
}: {
  inputOption: InputOption;
  value: Filters;
  dispatchFilters: (action: InputAction) => unknown;
  onValueChange: (value: Filters) => unknown;
}): ReactElement {
  function handleInput(
    newValue: string | SharedSelection | Date | number | boolean
  ) {
    if (newValue instanceof Date) newValue.setHours(23, 59, 59, 0);

    dispatchFilters({
      type: 'Update',
      label: inputOption.label,
      value: newValue,
      callback: onValueChange
    });
  }

  switch (inputOption.type) {
    case 'String':
      return (
        <Input
          autoFocus
          className='flex items-center w-52 h-fit mt-1 shrink-0'
          label={`${inputOption.label}:`}
          labelPlacement='outside-left'
          size='sm'
          value={value[inputOption.label] as string}
          onValueChange={handleInput}
        />
      );

    case 'Select':
      return (
        <Select
          autoFocus
          className='flex items-center w-52 shrink-0'
          label={`${inputOption.label}:`}
          labelPlacement='outside-left'
          selectedKeys={value[inputOption.label] as SharedSelection}
          selectionMode='multiple'
          size='sm'
          onSelectionChange={handleInput}
        >
          {inputOption.type === 'Select'
            ? inputOption.selectOptions?.map(option => (
                <SelectItem
                  key={option.name}
                  className={
                    option.color ? `!${getTextColor(option.color)}` : ''
                  }
                  value={option.name}
                >
                  {option.name}
                </SelectItem>
              ))
            : null}
        </Select>
      );

    case 'Date':
      return (
        <DateInput
          autoFocus
          className='!mb-1 h-unit-8 rounded-small'
          label={`${inputOption.label}:`}
          value={value[inputOption.label] as Date}
          onValueChange={handleInput}
        />
      );

    case 'Time':
      return (
        <TimeInput
          className='shrink-0'
          classNames={{ input: 'w-12' }}
          label={`${inputOption.label}:`}
          labelPlacement='outside-left'
          size='sm'
          value={value[inputOption.label] as number}
          onValueChange={handleInput}
        />
      );

    case 'Toggle':
      return (
        <Switch
          autoFocus
          classNames={{
            base: 'flex-row-reverse gap-2 -mr-2',
            label: 'text-tiny'
          }}
          value={value[inputOption.label] ? 'true' : 'false'}
          onValueChange={handleInput}
        >{`${inputOption.label}:`}</Switch>
      );
  }
}
