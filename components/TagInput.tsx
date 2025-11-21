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

import { FormEvent, useState } from 'react';
import { Check } from 'react-bootstrap-icons';
import { addToast, Button, Input } from '@heroui/react';

import { NamedColor } from '@/lib/model/color';

import ColorPicker from './ColorPicker';

export default function TagInput({
  className,
  classNames,
  addNewTag,
  linkNewTag
}: {
  className?: string;
  classNames?: { name: string };
  addNewTag: (name: string, color: NamedColor) => Promise<string>;
  linkNewTag?: (id: string, name: string, color: NamedColor) => unknown;
}) {
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState<NamedColor | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newTagColor) {
      addToast({
        title: 'Please specify a tag color',
        color: 'danger'
      });

      return;
    }
    if (!newTagName) {
      addToast({
        title: 'Please specify a tag name',
        color: 'danger'
      });

      return;
    }

    const id = await addNewTag(newTagName, newTagColor);

    if (linkNewTag) linkNewTag(id, newTagName, newTagColor);
    setNewTagName('');
    setNewTagColor(null);
  }

  return (
    <form
      key='add'
      className={`flex w-full gap-2 ${className}`}
      // void operator needed to ignore promise since `onSubmit` expects a non-async
      // function - skipcq: JS-0098
      onSubmit={e => void handleSubmit(e)}
    >
      <Input
        className={classNames?.name}
        placeholder='Add tag...'
        size='sm'
        value={newTagName}
        variant='underlined'
        onValueChange={setNewTagName}
      />
      <ColorPicker
        className='rounded-lg w-8 h-8 min-w-8 min-h-8'
        value={newTagColor}
        onValueChange={setNewTagColor}
      />
      <Button
        isIconOnly
        className='rounded-lg w-8 h-8 min-w-8 min-h-8'
        color='primary'
        type='submit'
        variant='flat'
      >
        <Check />
      </Button>
    </form>
  );
}
