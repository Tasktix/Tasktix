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

//Imports
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from '@heroui/react';
import { useState } from 'react';

import FilterGroup from './FilterGroup';
import { FilterInputGroup, FilterConfig } from './types';

// Input type for the filter modal
type FilterModalProps = {
  filters: FilterInputGroup;
  filterConfig: FilterConfig[];
  isOpen: boolean;
  onFilterSave: (f: FilterInputGroup) => void;
  onOpenChange: (isOpen: boolean) => void;
};

// Filter modal implementation
export function FilterModal({
  filters,
  filterConfig,
  isOpen,
  onFilterSave,
  onOpenChange
}: FilterModalProps) {
  const [filterState, setFilterState] = useState<FilterInputGroup>(filters);

  return (
    <Modal isOpen={isOpen} size={'2xl'} onOpenChange={onOpenChange}>
      <ModalContent>
        {onClose => (
          <>
            <ModalHeader>
              <div className='flex flex-row w-full items-center'>
                <h2 className='flex-1'>Advanced Filters</h2>
                <Input
                  className='w-sm grow-0'
                  placeholder='Filter name...'
                  type='text'
                  variant='underlined'
                />
                <div className='flex-1' />
              </div>
            </ModalHeader>
            <ModalBody>
              <FilterGroup
                filterConfig={filterConfig}
                filters={filterState}
                ids={[]}
                onFilterChange={setFilterState}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                color='primary'
                onPress={() => {
                  onClose();
                  onFilterSave(filterState);
                }}
              >
                Save
              </Button>
              <Button
                onPress={() => {
                  onClose();
                }}
              >
                Cancel
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
