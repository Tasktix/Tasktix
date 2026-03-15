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

import { Input, Select, SelectItem } from '@heroui/react';

import { DayOfWeek } from '@/lib/types';

import {
  DateFilterInput,
  DateFilterOperator,
  FilterInput,
  FilterOption,
  isDayOfWeekOperator,
  isSingleSelectOperator,
  OptionFilterInput,
  OptionFilterOperator
} from '../types';

import { TextFilterInputs } from './text';
import { NumberFilterInputs } from './number';
import { OptionFilterInputs } from './option';
import { MultiOptionFilterInputs } from './multiOption';
import { ColorFilterInputs } from './color';
import { DateFilterInputs } from './date';
import { TimeFilterInputs } from './time';

/**
 *
 * @param filterData The current input state and the config data for the field. Merged
 *  into a single object so that TypeScript's type narrowing functions correctly in the
 *  `switch` statement.
 */
export default function TypeInput({
  filterData,
  onChange
}: Readonly<{
  filterData: (FilterInput & FilterOption) | { type: 'undefined' };
  onChange: (data: Exclude<FilterInput, { type: 'undefined' }>) => unknown;
}>) {
  function handleOptionOperatorChange(
    operator: OptionFilterOperator | undefined
  ) {
    if (filterData.type !== 'option')
      throw new Error('Handling option operator change when option not in use');

    let value = filterData.value;

    if (filterData.operator && operator) {
      if (
        (!isSingleSelectOperator(filterData.operator) &&
          isSingleSelectOperator(operator)) ||
        (isSingleSelectOperator(filterData.operator) &&
          !isSingleSelectOperator(operator))
      )
        value = undefined;
    }

    onChange({
      ...filterData,
      operator,
      value
    } as OptionFilterInput & { id: number; type: 'option' });
  }

  function handleDateOperatorChange(operator: DateFilterOperator | undefined) {
    if (filterData.type !== 'date')
      throw new Error('Handling date operator change when date not in use');

    let value = filterData.value;

    if (filterData.operator && operator) {
      if (
        (!isDayOfWeekOperator(filterData.operator) &&
          isDayOfWeekOperator(operator)) ||
        (isDayOfWeekOperator(filterData.operator) &&
          !isDayOfWeekOperator(operator))
      )
        value = undefined;
    }

    onChange({
      ...filterData,
      operator,
      value
    } as DateFilterInput & { id: number; type: 'date' });
  }

  switch (filterData.type) {
    case 'undefined':
      return (
        <>
          <Select isDisabled>
            <SelectItem>Child required</SelectItem>
          </Select>
          <Input isDisabled />
        </>
      );

    case 'text':
      return (
        <TextFilterInputs
          operator={filterData.operator}
          value={filterData.value}
          onOperatorChange={operator =>
            onChange({
              ...filterData,
              operator
            })
          }
          onValueChange={value =>
            onChange({
              ...filterData,
              value
            })
          }
        />
      );

    case 'number':
      return (
        <NumberFilterInputs
          operator={filterData.operator}
          value={filterData.value}
          onOperatorChange={operator =>
            onChange({
              ...filterData,
              operator
            })
          }
          onValueChange={value =>
            onChange({
              ...filterData,
              value
            })
          }
        />
      );

    case 'option':
      return (
        <OptionFilterInputs
          {...filterData} // Necessary to add `operator` and `value` this way for TS
          onOperatorChange={handleOptionOperatorChange}
          onValueChange={(value: string | string[] | undefined) =>
            onChange({ ...filterData, value } as OptionFilterInput & {
              id: number;
              type: 'option';
            })
          }
        />
      );

    case 'multi-option':
      return (
        <MultiOptionFilterInputs
          operator={filterData.operator}
          options={filterData.options}
          value={filterData.value}
          onOperatorChange={operator =>
            onChange({
              ...filterData,
              operator
            })
          }
          onValueChange={value =>
            onChange({
              ...filterData,
              value
            })
          }
        />
      );

    case 'color':
      return (
        <ColorFilterInputs
          operator={filterData.operator}
          value={filterData.value}
          onOperatorChange={operator =>
            onChange({
              ...filterData,
              operator
            })
          }
          onValueChange={value =>
            onChange({
              ...filterData,
              value
            })
          }
        />
      );

    case 'date':
      return (
        <DateFilterInputs
          {...filterData} // Necessary to add `operator` and `value` this way for TS
          onOperatorChange={handleDateOperatorChange}
          onValueChange={(value: Date | DayOfWeek | undefined) =>
            onChange({ ...filterData, value } as DateFilterInput & {
              id: number;
              type: 'date';
            })
          }
        />
      );

    case 'time':
      return (
        <TimeFilterInputs
          operator={filterData.operator}
          value={filterData.value}
          onOperatorChange={operator =>
            onChange({
              ...filterData,
              operator
            })
          }
          onValueChange={value =>
            onChange({
              ...filterData,
              value
            })
          }
        />
      );
  }
}
