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

import { formatTime } from '@/lib/date';

import {
  DateFilterOperator,
  FilterInputState,
  FilterState,
  OptionFilterOperator
} from './types';

const LABEL_COLOR = 'text-primary-600' as const;
const OPERATOR_COLOR = 'text-primary' as const;
const PRIMITIVE_COLOR = 'text-green-800 dark:text-green-200' as const;
const STRING_COLOR = 'text-warning-700 dark:text-warning-200' as const;

export default function FilterText({ filters }: { filters: FilterState }) {
  return (
    <span className='font-mono'>
      {filters.filters.map((f, i) => (
        <>
          {f && 'filters' in f ? (
            <>
              {'( '}
              <FilterText key={i} filters={f} />
              {' )'}
            </>
          ) : (
            <FilterInputText key={i} filter={f} />
          )}
          {i < filters.filters.length - 1 && (
            <>
              {' '}
              <span className={OPERATOR_COLOR}>
                {filters.operator.toUpperCase()}
              </span>{' '}
            </>
          )}
        </>
      ))}
    </span>
  );
}

export function FilterInputText({ filter }: { filter: FilterInputState }) {
  if (!filter) return <span />;

  const operator = filter.operator.replace('@dow', '=');
  let value = <span />;

  switch (filter.type) {
    case 'text':
      value = (
        <span className={STRING_COLOR}>
          &quot;{filter.value.replaceAll('"', '\\"')}&quot;
        </span>
      );
      break;

    case 'number':
      value = <span className={PRIMITIVE_COLOR}>{filter.value}</span>;
      break;

    case 'option':
    case 'color':
      if (
        filter.operator === OptionFilterOperator.Equal ||
        filter.operator === OptionFilterOperator.NotEqual
      )
        value = (
          <span className={STRING_COLOR}>
            &quot;{filter.value.replaceAll('"', '\\"')}&quot;
          </span>
        );
      if (
        filter.operator === OptionFilterOperator.In ||
        filter.operator === OptionFilterOperator.NotIn
      )
        value = (
          <span className={STRING_COLOR}>
            &#123;&quot;
            {filter.value.map(v => v.replaceAll('"', '\\"')).join('", "')}
            &quot;&#125;
          </span>
        );
      break;

    case 'multi-option':
      value = (
        <span className={STRING_COLOR}>
          &#123;&quot;
          {filter.value.map(v => v.replaceAll('"', '\\"')).join('", "')}
          &quot;&#125;
        </span>
      );
      break;

    case 'date':
      if (
        filter.operator === DateFilterOperator.DayOfWeek ||
        filter.operator === DateFilterOperator.NotDayOfWeek
      )
        value = (
          <span className={PRIMITIVE_COLOR}>
            {filter.value.toLocaleDateString(undefined, { weekday: 'long' })}
          </span>
        );
      else
        value = (
          <span className={PRIMITIVE_COLOR}>
            {filter.value.toLocaleDateString()}
          </span>
        );
      break;

    case 'time':
      value = (
        <span className={PRIMITIVE_COLOR}>
          {formatTime(filter.value * 1000)}
        </span>
      );
      break;
  }

  return (
    <span className='whitespace-nowrap'>
      <span className={LABEL_COLOR}>{filter.label}</span>{' '}
      <span className={OPERATOR_COLOR}>{operator}</span> {value}
    </span>
  );
}
