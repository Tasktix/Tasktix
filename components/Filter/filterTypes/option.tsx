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

import { Select, Selection, SelectItem } from '@heroui/react';

import { Color } from '@/lib/model/color';
import { getTextColor } from '@/lib/color';

import { SelectOptionFilterOperator } from '../SelectOperator';
import { OptionFilterOperator } from '../types';

export type OptionFieldData = {
  type: 'option';
  label: string;
  options: { name: string; color?: Color }[];
};

export type OptionFieldState = {
  label: string;
} & (
  | {
      operator:
        | OptionFilterOperator.Equal
        | OptionFilterOperator.NotEqual
        | undefined;
      value: string | undefined;
    }
  | {
      operator:
        | OptionFilterOperator.In
        | OptionFilterOperator.NotIn
        | undefined;
      value: string[] | undefined;
    }
);

export function OptionFilterInputs({
  operator,
  options,
  value,
  onOperatorChange,
  onValueChange
}: {
  options: { name: string; color?: Color }[];
  onOperatorChange: (operator: OptionFilterOperator | undefined) => unknown;
} & (
  | {
      operator:
        | OptionFilterOperator.Equal
        | OptionFilterOperator.NotEqual
        | undefined;
      value: string | undefined;
      onValueChange: (value: string | undefined) => unknown;
    }
  | {
      operator: OptionFilterOperator.In | OptionFilterOperator.NotIn;
      value: string[] | undefined;
      onValueChange: (value: string[] | undefined) => unknown;
    }
)) {
  const multiSelectValue =
    operator === OptionFilterOperator.In ||
    operator === OptionFilterOperator.NotIn;

  function handleValueChange(value: Selection) {
    if (multiSelectValue) {
      if (value === 'all') onValueChange(options.map(o => o.name));
      else onValueChange(value.values().toArray() as string[]);
    } else {
      if (value === 'all') return;
      onValueChange(value.values().next().value as string | undefined);
    }
  }

  return (
    <>
      <SelectOptionFilterOperator
        value={operator}
        onChange={onOperatorChange}
      />
      <Select
        selectedKeys={value}
        selectionMode={multiSelectValue ? 'multiple' : 'single'}
        onSelectionChange={handleValueChange}
      >
        {options.map(o => (
          <SelectItem
            key={o.name}
            className={o.color ? `!${getTextColor(o.color)}` : ''}
          >
            {o.name}
          </SelectItem>
        ))}
      </Select>
    </>
  );
}
