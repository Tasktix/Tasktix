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

import { getTextColor } from '@/lib/color';

import { SelectMultiOptionFilterOperator } from '../SelectOperator';
import { MultiOptionFilterInput, MultiOptionFilterOption } from '../types';

export function MultiOptionFilterInputs({
  operator,
  options,
  value,
  onOperatorChange,
  onValueChange
}: {
  operator: MultiOptionFilterInput['operator'];
  options: MultiOptionFilterOption['options'];
  value: MultiOptionFilterInput['value'];
  onOperatorChange: (operator: MultiOptionFilterInput['operator']) => unknown;
  onValueChange: (value: MultiOptionFilterInput['value']) => unknown;
}) {
  function handleValueChange(value: Selection) {
    if (value === 'all') onValueChange(options.map(o => o.name));
    else onValueChange(value.values().toArray() as string[]);
  }

  return (
    <>
      <SelectMultiOptionFilterOperator
        value={operator}
        onChange={onOperatorChange}
      />
      <Select
        selectedKeys={value}
        selectionMode='multiple'
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
