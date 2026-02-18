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

import { Select, SelectItem } from "@heroui/react";

export default function ItemSection({
  currentSection,
  totalSections
}: {
  currentSection: string;
  totalSections: string[];
}) {
  const selectItems = totalSections.map(item => ({ id: item, label: item }))

  return (
    <div className={`-mt-2 -mb-2`}>
      <Select
        className={`w-28 grow-0 shrink-0`}
        items={selectItems}
        label={<span className='ml-2 text-foreground'>Section</span>}
        placeholder={currentSection} >
          {(selectItems) => <SelectItem>{selectItems.label}</SelectItem>}
      </Select>
    </div>
  );
}