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

import { DateInput, Select, Selection, SelectItem } from '@heroui/react';

import { DayOfWeek } from '@/lib/types';

import { SelectDateFilterOperator } from '../SelectOperator';
import { DateFilterOperator } from '../types';

export type DateFieldData = {
  label: string;
};

export type DateFieldState = {
  label: string;
} & (
  | {
      operator:
        | Exclude<
            DateFilterOperator,
            DateFilterOperator.DayOfWeek | DateFilterOperator.NotDayOfWeek
          >
        | undefined;
      value: Date | undefined;
    }
  | {
      operator: DateFilterOperator.DayOfWeek | DateFilterOperator.NotDayOfWeek;
      value: DayOfWeek | undefined;
    }
);

export function DateFilterInputs({
  value,
  operator,
  onOperatorChange,
  onValueChange
}: {
  onOperatorChange: (operator: DateFilterOperator | undefined) => unknown;
} & (
  | {
      operator: Exclude<
        DateFilterOperator,
        DateFilterOperator.DayOfWeek | DateFilterOperator.NotDayOfWeek
      >;
      value: Date | undefined;
      onValueChange: (value: Date | undefined) => unknown;
    }
  | {
      operator: DateFilterOperator.DayOfWeek | DateFilterOperator.NotDayOfWeek;
      value: DayOfWeek | undefined;
      onValueChange: (value: DayOfWeek | undefined) => unknown;
    }
)) {
  const isDow =
    operator === DateFilterOperator.DayOfWeek ||
    operator === DateFilterOperator.NotDayOfWeek;

  return (
    <>
      <SelectDateFilterOperator value={operator} onChange={onOperatorChange} />
      {isDow ? (
        <SelectDayOfWeek value={value} onValueChange={onValueChange} />
      ) : (
        <DateInput value={value} onValueChange={onValueChange} />
      )}
    </>
  );
}

function SelectDayOfWeek({
  value,
  onValueChange
}: {
  value: DayOfWeek | undefined;
  onValueChange: (day: DayOfWeek | undefined) => unknown;
}) {
  function handleValueChange(value: Selection) {
    if (value === 'all') return;
    onValueChange(value.values().next().value as DayOfWeek | undefined);
  }

  return (
    <Select
      selectedKeys={value ? [value] : []}
      onSelectionChange={handleValueChange}
    >
      <SelectItem key='Sunday'>Sunday</SelectItem>
      <SelectItem key='Monday'>Monday</SelectItem>
      <SelectItem key='Tuesday'>Tuesday</SelectItem>
      <SelectItem key='Wednesday'>Wednesday</SelectItem>
      <SelectItem key='Thursday'>Thursday</SelectItem>
      <SelectItem key='Friday'>Friday</SelectItem>
      <SelectItem key='Saturday'>Saturday</SelectItem>
    </Select>
  );
}
