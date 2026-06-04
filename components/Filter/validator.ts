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

import { FilterInput, FilterInputGroup } from './types';

export interface FilterInputError {
  affectedId: number;
  message: string;
}

/**
 * Validates that a FilterInputGroup is a valid FilterGroup, i.e. there are no invalid
 * `undefined`s present
 *
 * @param inputGroup The FilterInputGroup to validate
 */
export function validateFilterInputGroup(
  inputGroup: FilterInputGroup
): FilterInputError | null {
  /**
   * Selects the first error, if any, from a series of validation results
   *
   * @param results The results to check for errors in
   */
  function _mergeResults(
    results: (FilterInputError | null)[]
  ): FilterInputError | null {
    return results.reduce((prev, curr) => prev || curr, null);
  }

  /**
   * Validates a specific filter and, if it's a FilterInputGroup, all descendant filters,
   * returning an error if any invalid `undefined`s are found
   *
   * @param filter The filter to validate
   */
  function _validate(
    filter: FilterInputGroup | FilterInput
  ): FilterInputError | null {
    if ('type' in filter) {
      if (filter.type === 'undefined')
        return { affectedId: filter.id, message: 'Filter row cannot be empty' };
      if (filter.operator === undefined)
        return { affectedId: filter.id, message: 'Operator must be provided' };
      if (filter.value === undefined)
        return { affectedId: filter.id, message: 'Value must be provided' };

      return null;
    }

    return _mergeResults(filter.filters.map(_validate));
  }

  return _mergeResults(inputGroup.filters.map(_validate));
}
