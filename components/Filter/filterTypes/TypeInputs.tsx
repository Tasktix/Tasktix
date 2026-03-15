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

import {
  DateFilterOperator,
  FilterInput,
  FilterOption,
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
  onChange: (data: FilterInput) => unknown;
}>) {
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
          operator={filterData.operator}
          options={filterData.options}
          value={filterData.value}
          onOperatorChange={operator => {
            let value = filterData.value;

            if (
              (filterData.operator &&
                filterData.operator in
                  [OptionFilterOperator.Equal, OptionFilterOperator.NotEqual] &&
                operator &&
                operator in
                  [OptionFilterOperator.In, OptionFilterOperator.NotIn]) ||
              (filterData.operator &&
                filterData.operator in
                  [OptionFilterOperator.In, OptionFilterOperator.NotIn] &&
                operator &&
                operator in
                  [OptionFilterOperator.Equal, OptionFilterOperator.NotEqual])
            )
              value = undefined;

            onChange({
              ...filterData,
              operator,
              value
            });
          }}
          onValueChange={value =>
            onChange({
              ...filterData,
              value
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
          operator={filterData.operator}
          value={filterData.value}
          onOperatorChange={operator => {
            let value = filterData.value;

            if (
              (filterData.operator &&
                !(
                  filterData.operator in
                  [
                    DateFilterOperator.DayOfWeek,
                    DateFilterOperator.NotDayOfWeek
                  ]
                ) &&
                operator &&
                operator in
                  [
                    DateFilterOperator.DayOfWeek,
                    DateFilterOperator.NotDayOfWeek
                  ]) ||
              (filterData.operator &&
                filterData.operator in
                  [
                    DateFilterOperator.DayOfWeek,
                    DateFilterOperator.NotDayOfWeek
                  ] &&
                operator &&
                !(
                  operator in
                  [
                    DateFilterOperator.DayOfWeek,
                    DateFilterOperator.NotDayOfWeek
                  ]
                ))
            )
              value = undefined;

            onChange({
              ...filterData,
              operator,
              value
            });
          }}
          onValueChange={value =>
            onChange({
              ...filterData,
              value
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
