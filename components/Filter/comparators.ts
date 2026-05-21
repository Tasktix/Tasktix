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

import { NamedColor } from '@/lib/model/color';
import { DayOfWeek } from '@/lib/types';

import {
  ColorFilterOperator,
  ComparableFilterOperator,
  DateFilterOperator,
  MultiOptionFilterOperator,
  OptionFilterOperator,
  TextFilterOperator
} from './types';

export function compareText(
  filter: { operator: TextFilterOperator; value: string },
  elementValue: string
): boolean {
  switch (filter.operator) {
    case TextFilterOperator.Equal:
      return filter.value === elementValue;

    case TextFilterOperator.NotEqual:
      return filter.value !== elementValue;

    case TextFilterOperator.StartsWith:
      return elementValue.startsWith(filter.value);

    case TextFilterOperator.EndsWith:
      return elementValue.endsWith(filter.value);

    case TextFilterOperator.Includes:
      return elementValue
        .toLocaleLowerCase()
        .includes(filter.value.toLocaleLowerCase());

    case TextFilterOperator.RegexMatches:
      return elementValue.match(filter.value) !== null;
  }
}

export function compareNumber(
  filter: { operator: ComparableFilterOperator; value: number },
  elementValue: number
): boolean {
  switch (filter.operator) {
    case ComparableFilterOperator.Equal:
      return filter.value === elementValue;

    case ComparableFilterOperator.NotEqual:
      return filter.value !== elementValue;

    case ComparableFilterOperator.GreaterThan:
      return filter.value > elementValue;

    case ComparableFilterOperator.GreaterThanEqual:
      return filter.value >= elementValue;

    case ComparableFilterOperator.LessThan:
      return filter.value < elementValue;

    case ComparableFilterOperator.LessThanEqual:
      return filter.value <= elementValue;
  }
}

export function compareOption(
  filter:
    | {
        operator: OptionFilterOperator.Equal | OptionFilterOperator.NotEqual;
        value: string;
      }
    | {
        operator: OptionFilterOperator.In | OptionFilterOperator.NotIn;
        value: string[];
      },
  elementValue: string
): boolean {
  switch (filter.operator) {
    case OptionFilterOperator.Equal:
      return filter.value === elementValue;

    case OptionFilterOperator.NotEqual:
      return filter.value !== elementValue;

    case OptionFilterOperator.In:
      return filter.value.includes(elementValue);

    case OptionFilterOperator.NotIn:
      return filter.value.includes(elementValue);
  }
}

export function compareMultiOption(
  filter: { operator: MultiOptionFilterOperator; value: string[] },
  elementValue: string[]
): boolean {
  switch (filter.operator) {
    case MultiOptionFilterOperator.Equal:
      return (
        filter.value.every(v => elementValue.includes(v)) &&
        filter.value.length === elementValue.length
      );

    case MultiOptionFilterOperator.NotEqual:
      return (
        filter.value.some(v => !elementValue.includes(v)) ||
        filter.value.length !== elementValue.length
      );

    case MultiOptionFilterOperator.Includes:
      return filter.value.every(v => elementValue.includes(v));

    case MultiOptionFilterOperator.NotIncludes:
      return filter.value.some(v => !elementValue.includes(v));
  }
}

export function compareColor(
  filter: { operator: ColorFilterOperator; value: NamedColor },
  elementValue: NamedColor
): boolean {
  switch (filter.operator) {
    case ColorFilterOperator.Equal:
      return filter.value === elementValue;

    case ColorFilterOperator.NotEqual:
      return filter.value !== elementValue;
  }
}

export function compareDate(
  filter:
    | {
        operator: Exclude<
          DateFilterOperator,
          DateFilterOperator.DayOfWeek | DateFilterOperator.NotDayOfWeek
        >;
        value: Date;
      }
    | {
        operator:
          | DateFilterOperator.DayOfWeek
          | DateFilterOperator.NotDayOfWeek;
        value: DayOfWeek;
      },
  elementValue: Date | null
): boolean {
  function getDay(day: DayOfWeek): number {
    return [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ].indexOf(day);
  }

  switch (filter.operator) {
    case DateFilterOperator.Equal:
      return filter.value.getTime() === elementValue?.getTime();

    case DateFilterOperator.NotEqual:
      return filter.value.getTime() === elementValue?.getTime();

    case DateFilterOperator.GreaterThan:
      return elementValue !== null && filter.value < elementValue;

    case DateFilterOperator.GreaterThanEqual:
      return elementValue !== null && filter.value <= elementValue;

    case DateFilterOperator.LessThan:
      return elementValue !== null && filter.value > elementValue;

    case DateFilterOperator.LessThanEqual:
      return elementValue !== null && filter.value >= elementValue;

    case DateFilterOperator.DayOfWeek:
      return getDay(filter.value) === elementValue?.getDay();

    case DateFilterOperator.NotDayOfWeek:
      return getDay(filter.value) !== elementValue?.getDay();
  }
}

export function compareTime(
  filter: { operator: ComparableFilterOperator; value: number },
  elementValue: number | null
): boolean {
  switch (filter.operator) {
    case ComparableFilterOperator.Equal:
      return filter.value === elementValue;

    case ComparableFilterOperator.NotEqual:
      return filter.value !== elementValue;

    case ComparableFilterOperator.GreaterThan:
      return elementValue !== null && filter.value > elementValue;

    case ComparableFilterOperator.GreaterThanEqual:
      return elementValue !== null && filter.value >= elementValue;

    case ComparableFilterOperator.LessThan:
      return elementValue !== null && filter.value < elementValue;

    case ComparableFilterOperator.LessThanEqual:
      return elementValue !== null && filter.value <= elementValue;
  }
}
