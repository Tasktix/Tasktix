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

import { TextFieldData, TextFieldState } from './filterTypes/text';
import { NumberFieldData, NumberFieldState } from './filterTypes/number';
import { OptionFieldData, OptionFieldState } from './filterTypes/option';
import {
  MultiOptionFieldData,
  MultiOptionFieldState
} from './filterTypes/multiOption';
import { ColorFieldData, ColorFieldState } from './filterTypes/color';
import { DateFieldData, DateFieldState } from './filterTypes/date';
import { TimeFieldData, TimeFieldState } from './filterTypes/time';

export type FilterType =
  | (TextFieldData & { type: 'text' })
  | (NumberFieldData & { type: 'number' })
  | (OptionFieldData & { type: 'option' })
  | (MultiOptionFieldData & { type: 'multi-option' })
  | (ColorFieldData & { type: 'color' })
  | (DateFieldData & { type: 'date' })
  | (TimeFieldData & { type: 'time' });

export type FilterInputState = { id: number } & (
  | (TextFieldState & { type: 'text' })
  | (NumberFieldState & { type: 'number' })
  | (OptionFieldState & { type: 'option' })
  | (MultiOptionFieldState & { type: 'multi-option' })
  | (ColorFieldState & { type: 'color' })
  | (DateFieldState & { type: 'date' })
  | (TimeFieldState & { type: 'time' })
);

export type FilterState = {
  filters: (FilterState | FilterInputState)[];
} & ({ operator: 'And' } | { operator: 'Or' });

export enum TextFilterOperator {
  Equal = '=',
  NotEqual = '!=',
  Includes = '=|',
  StartsWith = '^=',
  EndsWith = '$=',
  RegexMatches = '.*'
}

export enum OptionFilterOperator {
  Equal = '=',
  NotEqual = '!=',
  In = '|=',
  NotIn = '!|='
}

export enum MultiOptionFilterOperator {
  Equal = '=',
  NotEqual = '!=',
  Includes = '=|',
  NotIncludes = '!=|'
}

export enum ColorFilterOperator {
  Equal = '=',
  NotEqual = '!='
}

export enum ComparableFilterOperator {
  Equal = '=',
  NotEqual = '!=',
  LessThan = '<',
  LessThanEqual = '<=',
  GreaterThan = '>',
  GreaterThanEqual = '>='
}

export enum DateFilterOperator {
  Equal = '=',
  NotEqual = '!=',
  LessThan = '<',
  LessThanEqual = '<=',
  GreaterThan = '>',
  GreaterThanEqual = '>=',
  DayOfWeek = '@dow',
  NotDayOfWeek = '!@dow'
}
