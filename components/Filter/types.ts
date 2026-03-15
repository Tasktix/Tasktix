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

import { Color, NamedColor } from '@/lib/model/color';
import { DayOfWeek, WithUndefined } from '@/lib/types';

export type ColorFilterOption = {
  label: string;
};

export type ColorFilter = {
  label: string;
  operator: ColorFilterOperator;
  value: NamedColor;
};

export type ColorFilterInput = WithUndefined<ColorFilter, 'operator' | 'value'>;

export type DateFilterOption = {
  label: string;
};

export type DateFilter = {
  label: string;
} & (
  | {
      operator: Exclude<
        DateFilterOperator,
        DateFilterOperator.DayOfWeek | DateFilterOperator.NotDayOfWeek
      >;
      value: Date;
    }
  | {
      operator: DateFilterOperator.DayOfWeek | DateFilterOperator.NotDayOfWeek;
      value: DayOfWeek;
    }
);

export type DateFilterInput = {
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

export type MultiOptionFilterOption = {
  label: string;
  options: { name: string; color?: Color }[];
};

export type MultiOptionFilter = {
  label: string;
  operator: MultiOptionFilterOperator;
  value: string[];
};

export type MultiOptionFilterInput = WithUndefined<
  MultiOptionFilter,
  'operator' | 'value'
>;

export type NumberFilterOption = {
  type: 'number';
  label: string;
};

export type NumberFilter = {
  label: string;
  operator: ComparableFilterOperator;
  value: number;
};

export type NumberFilterInput = WithUndefined<
  NumberFilter,
  'operator' | 'value'
>;

export type OptionFilterOption = {
  type: 'option';
  label: string;
  options: { name: string; color?: Color }[];
};

export type OptionFilter = {
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
);

export type OptionFilterInput = {
  label: string;
} & (
  | {
      operator:
        | OptionFilterOperator.Equal
        | OptionFilterOperator.NotEqual
        | undefined;
      value: string | undefined;
    }
  | {
      operator: OptionFilterOperator.In | OptionFilterOperator.NotIn;
      value: string[];
    }
);

export type TextFilterOption = {
  type: 'text';
  label: string;
};

export type TextFilter = {
  label: string;
  operator: TextFilterOperator;
  value: string;
};

export type TextFilterInput = WithUndefined<TextFilter, 'operator' | 'value'>;

export type TimeFilterOption = {
  label: string;
};

export type TimeFilter = {
  label: string;
  operator: ComparableFilterOperator;
  value: number;
};

export type TimeFilterInput = WithUndefined<TimeFilter, 'operator' | 'value'>;

export type FilterOption =
  | (TextFilterOption & { type: 'text' })
  | (NumberFilterOption & { type: 'number' })
  | (OptionFilterOption & { type: 'option' })
  | (MultiOptionFilterOption & { type: 'multi-option' })
  | (ColorFilterOption & { type: 'color' })
  | (DateFilterOption & { type: 'date' })
  | (TimeFilterOption & { type: 'time' });

export type Filter = { id: number } & (
  | (TextFilter & { type: 'text' })
  | (NumberFilter & { type: 'number' })
  | (OptionFilter & { type: 'option' })
  | (MultiOptionFilter & { type: 'multi-option' })
  | (ColorFilter & { type: 'color' })
  | (DateFilter & { type: 'date' })
  | (TimeFilter & { type: 'time' })
);

export type FilterInput = { id: number } & (
  | (TextFilterInput & { type: 'text' })
  | (NumberFilterInput & { type: 'number' })
  | (OptionFilterInput & { type: 'option' })
  | (MultiOptionFilterInput & { type: 'multi-option' })
  | (ColorFilterInput & { type: 'color' })
  | (DateFilterInput & { type: 'date' })
  | (TimeFilterInput & { type: 'time' })
  | { type: 'undefined' }
);

export type FilterGroup = {
  filters: (FilterGroup | Filter)[];
} & ({ operator: 'And' } | { operator: 'Or' });

export type FilterInputGroup = {
  filters: (FilterGroup | FilterInput)[];
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

export function isSingleSelectOperator(
  operator: OptionFilterOperator
): boolean {
  return [OptionFilterOperator.Equal, OptionFilterOperator.NotEqual].includes(
    operator
  );
}

export function isDayOfWeekOperator(operator: DateFilterOperator): boolean {
  return [
    DateFilterOperator.DayOfWeek,
    DateFilterOperator.NotDayOfWeek
  ].includes(operator);
}
