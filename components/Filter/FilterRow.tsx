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
  PaletteFill as ColorFilterIcon,
  Icon123 as NumberFilterIcon,
  NodeMinusFill as DeleteRowIcon,
  CalendarEventFill as DateFilterIcon,
  ChevronDown as OptionFilterInput,
  ChevronDoubleDown as MultiOptionFilterIcon,
  InputCursorText as TextFilterIcon,
  StopwatchFill as TimeFilterIcon
} from 'react-bootstrap-icons';
import { Button, Input, Select, SelectItem } from '@heroui/react';

import { FilterInputState, FilterType } from './types';

// Input type for filter row
export type FilterRowProps = {
  filterInput: FilterInputState;
  filterOptions: FilterType[];
  onFilterChange: (f: FilterInputState) => unknown;
};

// Filter row implementation
export default function FilterRow({
  filterInput,
  filterOptions,
  onFilterChange
}: FilterRowProps) {
  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        gap: '5px',
        flexDirection: 'row',
        paddingBottom: '5px'
      }}
    >
      <Select className='propertyInput' placeholder='Field'>
        {filterOptions.map(option => (
          <SelectItem
            key={option.label}
            startContent={getFilterIcon(option.type)}
          >
            {option.label}
          </SelectItem>
        ))}
      </Select>
      <Button
        isIconOnly
        aria-label='Delete filter row'
        variant='light'
        className='text-content1-foreground'
        onPress={() => {}}
      >
        <DeleteRowIcon />
      </Button>
    </div>
  );
}

// Function to hold all icons
function getFilterIcon(type: FilterType['type']) {
  switch (type) {
    case 'text':
      return <TextFilterIcon />;
    case 'number':
      return <NumberFilterIcon />;
    case 'option':
      return <OptionFilterInput />;
    case 'multi-option':
      return <MultiOptionFilterIcon />;
    case 'color':
      return <ColorFilterIcon />;
    case 'date':
      return <DateFilterIcon />;
    case 'time':
      return <TimeFilterIcon />;
  }
}
