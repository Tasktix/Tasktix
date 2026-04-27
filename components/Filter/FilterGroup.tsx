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
  NodePlusFill as AddRowIcon,
  Plus as AddGroupIcon
} from 'react-bootstrap-icons';
import { useRef } from 'react';
import { Button, Select, SelectItem } from '@heroui/react';

import FilterRow from './FilterRow';
import { FilterInputGroup, FilterInput, FilterConfig } from './types';

// Input type for the filter modal
type FilterGroupProps = {
  ids: number[];
  filters: FilterInputGroup;
  filterConfig: FilterConfig[];
  onFilterChange: (f: FilterInputGroup) => unknown;
};

// Filter group implementation
export default function FilterGroup({
  ids,
  filters,
  filterConfig,
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
    filter: FilterInputGroup | FilterInput,
    newFilter: FilterInputGroup | FilterInput
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
      {ids.length == 0 && <>Where:</>}
      <div className='flex'>
        <div
          className={`flex ${filters.filters.length > 1 ? 'pt-4 pb-5' : 'py-2'} relative`}
        >
          <div className='flex flex-row'>
            <div className='w-6' />
            <div
              className={`h-full w-6 border-content3-foreground border-r-0 rounded-l-lg ${filters.filters.length ? 'border-2' : ''}`}
            />
          </div>
        </div>
        <div className='w-full flex flex-col gap-2'>
          {filters.filters.length != 0 && (
            <Select
              isRequired
              className='w-24'
              classNames={{ mainWrapper: 'bg-content1' }}
              color='success'
              //disabledKeys={[filters.operator]}
              //selectedKeys={[filters.operator]}
              size='sm'
              //onSelectionChange={() => {}}
              variant='flat'
            >
              <SelectItem key='AND'>AND</SelectItem>
              <SelectItem key='OR'>OR</SelectItem>
            </Select>
          )}
          {filters.filters.map((filter, i) => {
            if ('filters' in filter) {
              // Render a filterGroup component
              return (
                <FilterGroup
                  key={[...ids, i].join('.')}
                  filterConfig={filterConfig}
                  filters={filter}
                  ids={[...ids, i]}
                  onFilterChange={handleChildChange.bind(null, filter)}
                />
              );
            } else {
              // Render a FilterRow component
              return (
                <FilterRow
                  key={[...ids, i].join('.')}
                  filterConfigs={filterConfig}
                  filterInput={filter}
                  onFilterChange={handleChildChange.bind(null, filter)}
                  onFilterDelete={() => alert('Deleting row')}
                />
              );
            }
          })}
          <div className='flex flex-row gap-2'>
            <Button onPress={addRow}>
              <AddRowIcon />
              Add Filter Row
            </Button>
            {ids.length < 3 && (
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
