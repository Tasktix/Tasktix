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

import { Select, SelectItem } from '@heroui/react';

/**
 * This is the component used for changing sections within an item's 'more' menu.
 *
 * @param currentSection The section this item is currently associated with
 * @param totalSections A total list of sections in the larger list
 * @param onUpdateSection The passed function that changes an item's section
 */
export default function ItemSection({
  currentSection,
  totalSections,
  onUpdateSection
}: {
  currentSection: [string, string];
  totalSections: Map<string, string>;
  onUpdateSection: (e: never) => unknown;
}) {
  const updatedTotalSections = totalSections
    .entries()
    .filter(([name]) => name !== currentSection[1]);
  const selectItems = updatedTotalSections.map(([id, label]) => ({
    id,
    label
  }));

  return (
    <div className={'-mt-2 -mb-2'}>
      <Select
        aria-label='item-section-select'
        className={'w-full grow-0 shrink-0'}
        items={selectItems}
        label={<span className='ml-2 text-foreground'>Section</span>}
        selectedKeys={[currentSection[0]]}
        variant='underlined'
        onChange={onUpdateSection}
      >
        {selectItems => (
          <SelectItem
            key={selectItems.id}
            aria-label={`${selectItems.label}-select-item`}
          >
            {selectItems.label}
          </SelectItem>
        )}
      </Select>
    </div>
  );
}
