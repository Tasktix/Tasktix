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

// Imports
import {
  NodePlusFill as AddGroupIcon,
  Plus as AddRowIcon
} from 'react-bootstrap-icons';
import { useRef } from 'react';
import { Button } from '@heroui/react';

import FilterRow from './FilterRow';
import { FilterState, FilterInputState, FilterType } from './types';

// Input type for the filter modal
type FilterGroupProps = {
  key: number;
  index: number;
  filters: FilterState;
  filterOptions: FilterType[];
  onFilterChange: (f: FilterState) => unknown;
};

// Filter group implementation
export default function FilterGroup({
  index,
  filters,
  filterOptions,
  onFilterChange
}: FilterGroupProps) {
  // Set a reference
  const reference = useRef(1);

  // Function to add a row
  function addRow() {
    const newFilter = structuredClone(filters);

    newFilter.filters.push({
      id: reference.current++,
      type: 'undefined'
    });
    onFilterChange(newFilter);
  }

  // Function to add a group
  function addGroup() {
    const newFilter = structuredClone(filters);

    newFilter.filters.push({
      id: reference.current++,
      operator: filters.operator === 'And' ? 'Or' : 'And',
      filters: []
    });
    onFilterChange(newFilter);
  }

  // Function for child change
  function handleChildChange(
    filter: FilterState | FilterInputState,
    newFilter: FilterState | FilterInputState
  ) {
    const tempFilters = structuredClone(filters);

    for (let i = 0; i < filters.filters.length; i++) {
      if (filters.filters[i] == filter) {
        tempFilters.filters[i] = newFilter;
        break;
      }
    }
    onFilterChange(tempFilters);
  }

  // DOM structure for filter group component
  return (
    <>
      {index == 0 && <>Where:</>}
      <div className='flex'>
        <div className={`flex ${filters.filters.length > 1 ? 'py-5' : 'py-2'}`}>
          <div className='w-6'></div>
          <div className={`w-6 border-content3-foreground border-r-0 rounded-l-lg ${filters.filters.length ? 'border-2' : ''}`}></div>
        </div>
        <div className='w-full'>
          {filters.filters.map(filter => {
            if ('filters' in filter) {
              // Render a filterGroup component
              return (
                <FilterGroup
                  key={filter.id}
                  filterOptions={filterOptions}
                  filters={filter}
                  index={index + 1}
                  onFilterChange={handleChildChange.bind(null, filter)}
                />
              );
            } else {
              // Render a FilterRow component
              return (
                <FilterRow
                  key={filter.id}
                  filterInput={filter}
                  filterOptions={filterOptions}
                  onFilterChange={handleChildChange.bind(null, filter)}
                />
              );
            }
          })}
      <div style={{ display: 'flex', flexDirection: 'row', gap: '5px' }}>
        <Button onPress={addRow}>
          <AddRowIcon />
          Add Filter Row
        </Button>
        {index < 3 && (
          <Button onPress={addGroup}>
            <AddGroupIcon />
            Add Filter Group
          </Button>
        )}
      </div>
        </div>
      </div>
    </>
  );
}
