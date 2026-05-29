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

import {
  NodePlusFill as AddRowIcon,
  Plus as AddGroupIcon
} from 'react-bootstrap-icons';
import { useRef } from 'react';
import { Button, Select, SelectItem, SharedSelection } from '@heroui/react';

import FilterRow from './FilterRow';
import { FilterInputGroup, FilterInput, FilterConfig } from './types';

type FilterGroupProps = {
  ids: number[];
  filters: FilterInputGroup;
  filterConfig: FilterConfig[];
  onFilterChange: (f: FilterInputGroup) => unknown;
  onDeleteGroup: () => unknown;
};

export default function FilterGroup({
  ids,
  filters,
  filterConfig,
  onFilterChange,
  onDeleteGroup
}: FilterGroupProps) {
  const reference = useRef(1);

  function shallowCloneFilter() {
    return { operator: filters.operator, filters: [...filters.filters] };
  }

  function addRow() {
    const newFilter = shallowCloneFilter();

    newFilter.filters.push({
      id: reference.current++,
      type: 'undefined'
    });
    onFilterChange(newFilter);
  }

  function addGroup() {
    const newFilter = shallowCloneFilter();

    newFilter.filters.push({
      id: reference.current++,
      operator: filters.operator === 'And' ? 'Or' : 'And',
      filters: []
    });
    onFilterChange(newFilter);
  }

  function handleOperatorChange(selection: SharedSelection) {
    const newFilter = { ...filters };

    const selectionKey =
      selection === 'all' ? 'And' : selection.keys().next().value;
    const selectionOperator = selectionKey === 'Or' ? 'Or' : 'And';

    newFilter.operator = selectionOperator;
    onFilterChange(newFilter);
  }

  function handleChildChange<T extends FilterInput | FilterInputGroup>(
    filter: T,
    newFilter: T
  ) {
    const tempFilters = shallowCloneFilter();

    for (let i = 0; i < filters.filters.length; i++) {
      if (filters.filters[i] == filter) {
        tempFilters.filters[i] = newFilter;
        break;
      }
    }
    onFilterChange(tempFilters);
  }

  function handleChildDelete(deleteFilter: FilterInputGroup | FilterInput) {
    if (filters.filters.length < 2) {
      // Last filter in this group was deleted; delete group too
      onDeleteGroup();

      return;
    }

    const tempFilters = shallowCloneFilter();

    for (let i = 0; i < filters.filters.length; i++) {
      if (filters.filters[i] == deleteFilter) {
        tempFilters.filters.splice(i, 1);
        break;
      }
    }
    onFilterChange(tempFilters);
  }

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
              aria-label={'Group operator'}
              className='w-24'
              classNames={{ mainWrapper: 'bg-content1' }}
              color={filters.operator == 'And' ? 'success' : 'secondary'}
              disabledKeys={[filters.operator]}
              selectedKeys={[filters.operator]}
              size='sm'
              variant='flat'
              onSelectionChange={handleOperatorChange}
            >
              <SelectItem key='And'>AND</SelectItem>
              <SelectItem key='Or'>OR</SelectItem>
            </Select>
          )}
          {filters.filters.map((filter, i) => {
            if ('filters' in filter) {
              // Only subgroups have 'filters'
              return (
                <FilterGroup
                  key={[...ids, i].join('.')}
                  filterConfig={filterConfig}
                  filters={filter}
                  ids={[...ids, i]}
                  onDeleteGroup={handleChildDelete.bind(null, filter)}
                  onFilterChange={handleChildChange.bind(null, filter)}
                />
              );
            } else {
              return (
                <FilterRow
                  key={[...ids, i].join('.')}
                  filterConfigs={filterConfig}
                  filterInput={filter}
                  onFilterChange={handleChildChange.bind(null, filter)}
                  onFilterDelete={handleChildDelete.bind(null, filter)}
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
