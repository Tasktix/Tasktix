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

import { addToast, Button, Input } from '@heroui/react';
import { FormEvent, useState } from 'react';

import api from '@/lib/api';
import ListSection from '@/lib/model/listSection';

/**
 * An input for creating a new section & assigning it a name, designed to match the style
 * of other components on the `/list/[id]` page.
 *
 * @param listId The list to add the section to
 * @param onSectionAdded A callback to handle the creation of a section (after the API
 *  call already succeeded; only state update needed)
 */
export default function AddListSection({
  listId,
  onSectionAdded
}: {
  listId: string;
  onSectionAdded: (_: ListSection) => unknown;
}) {
  const [name, setName] = useState('');

  function createSection(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    api
      .post(`/list/${listId}/section`, { name })
      .then(res => {
        const id = res.content?.split('/').at(-1);

        onSectionAdded(new ListSection(name, [], id));
        setName('');
      })
      .catch(err => addToast({ title: err.message, color: 'danger' }));
  }

  return (
    <form
      className='rounded-md w-full overfLow-hidden border-2 border-content3 bg-content1 p-4 h-18 flex items-center justify-center gap-4 shadow-lg shadow-content2'
      onSubmit={createSection}
    >
      <Input
        className='w-52'
        placeholder='Name'
        value={name}
        variant='underlined'
        onValueChange={setName}
      />
      <Button color='primary' tabIndex={0} type='submit' variant='flat'>
        Add Section
      </Button>
    </form>
  );
}
