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

import { Color } from '@/lib/model/color';

export type FilterType =
  | {
      type: 'text';
      label: string;
    }
  | {
      type: 'number';
      label: string;
    }
  | {
      type: 'option';
      label: string;
      options: { name: string; color?: Color }[];
    }
  | {
      type: 'multi-option';
      label: string;
      options: { name: string; color?: Color }[];
    }
  | {
      type: 'color';
      label: string;
    }
  | {
      type: 'date';
      label: string;
    }
  | {
      type: 'time';
      label: string;
    };

export type FilterInputState =
  | { id: number; type: 'undefined' }
  | ({ id: number; label: string } & (
      | {
          type: 'text';
          operator: TextFilterOperator;
          value: string;
        }
      | {
          type: 'number';
          operator: ComparableFilterOperator;
          value: number;
        }
      | ({
          type: 'option';
        } & (
          | {
              operator:
                | OptionFilterOperator.Equal
                | OptionFilterOperator.NotEqual;
              value: string;
            }
          | {
              operator: OptionFilterOperator.In | OptionFilterOperator.NotIn;
              value: string[];
            }
        ))
      | {
          type: 'multi-option';
          operator: MultiOptionFilterOperator;
          value: string[];
        }
      | ({
          type: 'color';
          operator: OptionFilterOperator;
        } & (
          | {
              operator:
                | OptionFilterOperator.Equal
                | OptionFilterOperator.NotEqual;
              value: Color;
            }
          | {
              operator: OptionFilterOperator.In | OptionFilterOperator.NotIn;
              value: Color[];
            }
        ))
      | {
          type: 'date';
          operator: DateFilterOperator;
          value: Date;
        }
      | {
          type: 'time';
          operator: ComparableFilterOperator;
          value: number;
        }
    ));

export type FilterState = {
  id: number;
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
