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
  PaletteFill as ColorFilterIcon,
  Icon123 as NumberFilterIcon,
  NodeMinusFill as DeleteRowIcon,
  CalendarEventFill as DateFilterIcon,
  ChevronDown as OptionFilterInput,
  ChevronDoubleDown as MultiOptionFilterIcon,
  InputCursorText as TextFilterIcon,
  StopwatchFill as TimeFilterIcon
} from 'react-bootstrap-icons';
import { Button, Select, Selection, SelectItem } from '@heroui/react';
import { JSX } from 'react';

import { FilterInputState, FilterType } from './types';
import TypeInput from './TypeInput/TypeInput';

export type FilterRowProps = Readonly<{
  filterInput: FilterInputState;
  filterConfigs: FilterType[];
  onFilterChange: (f: FilterInputState) => unknown;
  onFilterDelete: () => unknown;
}>;

const iconMap: Record<FilterType['type'], JSX.Element> = {
  text: <TextFilterIcon />,
  number: <NumberFilterIcon />,
  option: <OptionFilterInput />,
  'multi-option': <MultiOptionFilterIcon />,
  color: <ColorFilterIcon />,
  date: <DateFilterIcon />,
  time: <TimeFilterIcon />
};

export default function FilterRow({
  filterInput,
  filterConfigs,
  onFilterChange,
  onFilterDelete
}: FilterRowProps) {
  const filterName = filterInput.type === 'undefined' ? '' : filterInput.label;
  const filterConfig = filterConfigs.find(
    option => option.label === filterName
  );

  function handleFieldChange(keys: Selection) {
    if (keys === 'all') throw new Error('Unexpected "all" key');

    const key = keys.values().next().value as string | undefined;

    if (!key) {
      onFilterChange({ id: filterInput.id, type: 'undefined' });

      return;
    }

    const value = filterConfigs.find(option => option.label === key)!;

    onFilterChange({
      id: filterInput.id,
      type: value.type,
      label: value.label
    });
  }

  function handleOtherChange(data: FilterInputState) {
    if (data.type === 'undefined') {
      return;
    }

    onFilterChange({
      id: filterInput.id,
      type: filterInput.type,
      label: filterInput.label,
      operator: data.operator,
      value: data.value
    });
  }

  return (
    <div className='flex flex-row justify-center gap-2'>
      <Select
        className='propertyInput'
        placeholder='Field'
        selectedKeys={[filterName]}
        onSelectionChange={handleFieldChange}
      >
        {filterConfigs.map(option => (
          <SelectItem key={option.label} startContent={iconMap[option.type]}>
            {option.label}
          </SelectItem>
        ))}
      </Select>
      <TypeInput
        filterData={{ ...filterInput, ...filterConfig }}
        onChange={handleOtherChange}
      />
      <Button
        isIconOnly
        aria-label='Delete filter row'
        className='text-content1-foreground'
        variant='light'
        onPress={onFilterDelete}
      >
        <DeleteRowIcon />
      </Button>
    </div>
  );
}
