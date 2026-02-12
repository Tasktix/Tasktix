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
  | undefined
  | {
      type: 'text';
      label: string;
      operator: TextFilterOperator;
      value: string;
    }
  | {
      type: 'number';
      label: string;
      operator: ComparableFilterOperator;
      value: number;
    }
  | ({
      type: 'option';
      label: string;
    } & (
      | {
          operator: OptionFilterOperator.Equal | OptionFilterOperator.NotEqual;
          value: string;
        }
      | {
          operator: OptionFilterOperator.In | OptionFilterOperator.NotIn;
          value: string[];
        }
    ))
  | {
      type: 'multi-option';
      label: string;
      operator: MultiOptionFilterOperator;
      value: string[];
    }
  | ({
      type: 'color';
      label: string;
      operator: OptionFilterOperator;
    } & (
      | {
          operator: OptionFilterOperator.Equal | OptionFilterOperator.NotEqual;
          value: Color;
        }
      | {
          operator: OptionFilterOperator.In | OptionFilterOperator.NotIn;
          value: Color[];
        }
    ))
  | {
      type: 'date';
      label: string;
      operator: DateFilterOperator;
      value: Date;
    }
  | {
      type: 'time';
      label: string;
      operator: ComparableFilterOperator;
      value: number;
    };

export type FilterState =
  | { operator: 'And'; filters: (FilterState | FilterInputState)[] }
  | { operator: 'Or'; filters: (FilterState | FilterInputState)[] };

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
