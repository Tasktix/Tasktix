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

import FilterText, {
  ComparableFilterOperator,
  DateFilterOperator,
  OptionFilterOperator,
  TextFilterOperator
} from '@/components/Filter';

export default function Page() {
  return (
    <span className='p-20'>
      <FilterText
        filters={{
          operator: 'Or',
          filters: [
            {
              id: 1,
              type: 'text',
              label: 'theLabel',
              operator: TextFilterOperator.Equal,
              value: 'theValue'
            },
            {
              operator: 'And',
              filters: [
                {
                  id: 1,
                  type: 'color',
                  label: 'theColor',
                  operator: OptionFilterOperator.NotEqual,
                  value: 'Cyan'
                },
                {
                  id: 2,
                  type: 'number',
                  label: 'theNumber',
                  operator: ComparableFilterOperator.LessThan,
                  value: 15
                }
              ]
            },
            {
              id: 2,
              type: 'date',
              label: 'theDate',
              operator: DateFilterOperator.Equal,
              value: new Date()
            },
            {
              id: 3,
              type: 'date',
              label: 'theDate',
              operator: DateFilterOperator.DayOfWeek,
              value: new Date()
            }
          ]
        }}
      />
    </span>
  );
}
