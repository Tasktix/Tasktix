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

import { NumberInput } from '@heroui/react';

import { SelectComparableFilterOperator } from '../SelectOperator';
import { NumberFilterInput } from '../types';

export function NumberFilterInputs({
  operator,
  value,
  onOperatorChange,
  onValueChange
}: Readonly<{
  operator: NumberFilterInput['operator'];
  value: NumberFilterInput['value'];
  onOperatorChange: (operator: NumberFilterInput['operator']) => unknown;
  onValueChange: (value: NumberFilterInput['value']) => unknown;
}>) {
  return (
    <>
      <SelectComparableFilterOperator
        value={operator}
        onChange={onOperatorChange}
      />
      <NumberInput type='number' value={value} onValueChange={onValueChange} />
    </>
  );
}
