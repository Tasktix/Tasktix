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

'use client';

import { useState } from 'react';
import { Card } from '@heroui/react';

import { FilterOption } from '@/components/Filter';
import FilterRow from '@/components/Filter/FilterRow';
import { FilterInput } from '@/components/Filter/types';

export default function Page() {
  const filterOptions: FilterOption[] = [
    { type: 'text', label: 'name' },
    {
      type: 'option',
      label: 'priority',
      options: [
        { name: 'High', color: 'danger' },
        { name: 'Medium', color: 'warning' },
        { name: 'Low', color: 'success' }
      ]
    },
    {
      type: 'option',
      label: 'tag',
      options: [
        { name: 'Bug', color: 'Red' },
        { name: 'Feature', color: 'Blue' }
      ]
    }
  ];
  const [state, setState] = useState<FilterInput>({
    id: 0,
    type: 'undefined'
  });

  return (
    <Card className='p-4 w-2xl self-center m-12'>
      <FilterRow
        filterConfigs={filterOptions}
        filterInput={state}
        onFilterChange={setState}
        onFilterDelete={() => {}}
      />
    </Card>
  );
}
