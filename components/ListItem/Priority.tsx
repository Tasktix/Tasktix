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
  Select,
  SelectItem,
  Selection,
  SlotsToClasses
} from "@heroui/react";

import ListItem from '@/lib/model/listItem';

export default function Priority({
  isComplete,
  priority,
  className,
  wrapperClassName,
  classNames,
  setPriority
}: {
  isComplete: boolean;
  priority: ListItem['priority'];
  className?: string;
  wrapperClassName?: string;
  classNames?: SlotsToClasses<
    | 'description'
    | 'errorMessage'
    | 'label'
    | 'base'
    | 'value'
    | 'mainWrapper'
    | 'trigger'
    | 'innerWrapper'
    | 'selectorIcon'
    | 'spinner'
    | 'listboxWrapper'
    | 'listbox'
    | 'popoverContent'
    | 'helperWrapper'
  >;
  setPriority: (priority: ListItem['priority']) => unknown;
}) {
  const _priority = new Set([priority]);

  return (
    <div className={`-mt-2 -mb-2 ${wrapperClassName}`}>
      <Select
        className={`w-28 grow-0 shrink-0 ${className || ''}`}
        classNames={classNames}
        color={`${priority === 'High' ? 'danger' : priority === 'Medium' ? 'warning' : 'success'}`}
        isDisabled={isComplete}
        label={<span className='ml-2 text-foreground'>Priority</span>}
        labelPlacement='outside'
        placeholder='Select...'
        selectedKeys={_priority}
        size='sm'
        variant='flat'
        onSelectionChange={(keys: Selection) => {
          const priorityKey = keys !== 'all' ? keys.keys().next().value : 'Low';

          setPriority(
            priorityKey === 'High'
              ? 'High'
              : priorityKey === 'Medium'
                ? 'Medium'
                : 'Low'
          );
        }}
      >
        <SelectItem key='High' color='danger' value='High'>
          High
        </SelectItem>
        <SelectItem key='Medium' color='warning' value='Medium'>
          Medium
        </SelectItem>
        <SelectItem key='Low' color='success' value='Low'>
          Low
        </SelectItem>
      </Select>
    </div>
  );
}
