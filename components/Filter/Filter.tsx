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
  Diagram2Fill as FilterModalIcon,
  Bookmarks as FilterSavedIcon
} from 'react-bootstrap-icons';
import { addToast, Button, useDisclosure } from '@heroui/react';

import { FilterModal } from './FilterModal';
import { FilterConfig, FilterGroup, FilterInputGroup } from './types';
import { validateFilterInputGroup } from './validator';
import FilterText from './FilterText';

type FilterProps = {
  filterConfig: FilterConfig[];
  currentFilters: FilterGroup;
  onFilterSave: (f: FilterGroup) => unknown;
};

export default function Filter({
  filterConfig,
  currentFilters,
  onFilterSave
}: FilterProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  function handleFilterSave(filters: FilterInputGroup) {
    const err = validateFilterInputGroup(filters);

    if (err === null) {
      onFilterSave(filters as FilterGroup);
      onOpenChange();

      return;
    }

    addToast({ title: err.message, color: 'danger' });
  }

  return (
    <>
      <span
        className='grow rounded-md w-100 overflow-hidden p-4 h-16 flex items-center justify-center gap-4 border-2 border-content3 bg-content1 shadow-lg shadow-content2'
        data-testid='filter-container'
      >
        {currentFilters.filters.length > 0 ? (
          <FilterText filters={currentFilters} />
        ) : (
          <p className='text-foreground/60 grow'>Filter...</p>
        )}
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
          filterConfig={filterConfig}
          filters={currentFilters}
          isOpen={isOpen}
          onFilterSave={handleFilterSave}
          onOpenChange={onOpenChange}
        />
      )}
    </>
  );
}
