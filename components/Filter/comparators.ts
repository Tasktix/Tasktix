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

/**
 * Checks if a text filter matches the given string
 *
 * @param filter The filter to test
 * @param elementValue The string to test against
 *
 * Default case intentionally omitted to surface TS error if not all cases are explicitly
 * handled (e.g. because the TextFilterOperator type was expanded). All VALID code paths
 * (based on the TextFilterOperator type) do return
 */
export function compareText( // skipcq: JS-0045
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

/**
 * Checks if a numeric filter matches the given number
 *
 * @param filter The filter to test
 * @param elementValue The number to test against
 *
 * Default case intentionally omitted to surface TS error if not all cases are explicitly
 * handled (e.g. because the ComparableFilterOperator type was expanded). All VALID code paths
 * (based on the ComparableFilterOperator type) do return
 */
export function compareNumber( // skipcq: JS-0045
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

/**
 * Checks if an option filter matches the given string
 *
 * @param filter The filter to test
 * @param elementValue The string to test against
 *
 * Default case intentionally omitted to surface TS error if not all cases are explicitly
 * handled (e.g. because the OptionFilterOperator type was expanded). All VALID code paths
 * (based on the OptionFilterOperator type) do return
 */
export function compareOption( // skipcq: JS-0045
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

/**
 * Checks if a multi-option filter matches the given list of strings
 *
 * @param filter The filter to test
 * @param elementValue The strings to test against
 *
 * Default case intentionally omitted to surface TS error if not all cases are explicitly
 * handled (e.g. because the MultiOptionFilterOperator type was expanded). All VALID code
 * paths (based on the MultiOptionFilterOperator type) do return
 */
export function compareMultiOption( // skipcq: JS-0045
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

/**
 * Checks if a color filter matches the given color
 *
 * @param filter The filter to test
 * @param elementValue The color to test against
 *
 * Default case intentionally omitted to surface TS error if not all cases are explicitly
 * handled (e.g. because the ColorFilterOperator type was expanded). All VALID code paths
 * (based on the ColorFilterOperator type) do return
 */
export function compareColor( // skipcq: JS-0045
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

/**
 * Checks if a date filter matches the given date
 *
 * @param filter The filter to test
 * @param elementValue The date to test against
 *
 * Default case intentionally omitted to surface TS error if not all cases are explicitly
 * handled (e.g. because the DateFilterOperator type was expanded). All VALID code paths
 * (based on the DateFilterOperator type) do return
 */
export function compareDate( // skipcq: JS-0045
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
  /**
   * Gets a numeric offset for the given day of the week such that it matches JavaScript's
   * Date.prototype.getDay()
   *
   * @param day The day to get a numeric offset for
   */
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

/**
 * Checks if a time filter matches the given time
 *
 * @param filter The filter to test
 * @param elementValue The time (in ms) to test against
 *
 * Default case intentionally omitted to surface TS error if not all cases are explicitly
 * handled (e.g. because the ComparableFilterOperator type was expanded). All VALID code
 * paths (based on the ComparableFilterOperator type) do return
 */
export function compareTime( // skipcq: JS-0045
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
