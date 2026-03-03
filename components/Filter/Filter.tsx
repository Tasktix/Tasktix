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
  Diagram2Fill as FilterModalIcon,
  Bookmarks as FilterSavedIcon
} from 'react-bootstrap-icons';
//import { Key, ReactElement, useReducer, useState } from 'react';
import {
  //Autocomplete,
  //AutocompleteItem,
  //AutocompleteSection,
  Button,
  Input,
  useDisclosure
} from '@heroui/react';
import { useState } from 'react';

import { FilterModal } from './FilterModal';
import { FilterType, FilterState } from './types';

// Props for the filter component
type FilterProps = {
  filterOptions: FilterType[];
};

// Filter bar implementation
export default function Filter({ filterOptions }: FilterProps) {
  // States
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [filterState, setFilterState] = useState<FilterState>({
    id: 0,
    operator: 'And',
    filters: []
  });

  // DOM structure for filter bar component
  return (
    <>
      <span className='grow rounded-md w-100 overflow-hidden p-4 h-16 flex items-center justify-center gap-4 border-2 border-content3 bg-content1 shadow-lg shadow-content2'>
        <Input
          isClearable
          placeholder='Filter...'
          type='text'
          variant='underlined'
        />
        <Button
          isIconOnly
          aria-label='Open filter modal'
          variant='ghost'
          onPress={onOpen}
        >
          <FilterModalIcon size={20} />
        </Button>
        <Button
          isIconOnly
          aria-label='Open saved filters'
          variant='ghost'
          onPress={() => {}}
        >
          <FilterSavedIcon size={20} />
        </Button>
      </span>
      {isOpen && (
        <FilterModal
          filterOptions={filterOptions}
          filters={filterState}
          isOpen={isOpen}
          onFilterSave={setFilterState}
          onOpenChange={onOpenChange}
        />
      )}
    </>
  );
}
