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

import { Button } from '@heroui/react';
import { TrashFill } from 'react-bootstrap-icons';

import ColorPicker from '@/components/ColorPicker';
import ConfirmedTextInput from '@/components/ConfirmedTextInput';
import TagInput from '@/components/TagInput';
import Tag from '@/lib/model/tag';
import api from '@/lib/api';
import { NamedColor } from '@/lib/model/color';
import { addToastForError } from '@/lib/error';

import { ListState, TagAction } from '../List/types';

/**
 * Displays all tags in the List and allows tags to be added, edited, and deleted
 *
 * @param listId The list the tags are for
 * @param tags All tags currently part of the list
 * @param addNewTag A callback for adding a tag to the list
 * @param onTagEvent A callback for updating React state with changes to a tag
 */
export default function TagSettings({
  tags,
  addNewTag,
  onTagEvent
}: Readonly<{
  tags: ListState['tags'];
  addNewTag: (name: string, color: NamedColor) => Promise<string>;
  onTagEvent: (event: TagAction) => unknown;
}>) {
  function updateTagName(tag: Tag, name: string) {
    api
      .patch(`/tag/${tag.id}`, { name })
      .then(() => onTagEvent({ type: 'UpdateTagName', id: tag.id, name }))
      .catch(addToastForError);
  }

  function updateTagColor(tag: Tag, color: NamedColor | null) {
    if (color)
      api
        .patch(`/tag/${tag.id}`, { color })
        .then(() => onTagEvent({ type: 'UpdateTagColor', id: tag.id, color }))
        .catch(addToastForError);
  }

  function deleteTag(id: string) {
    if (
      !confirm(
        'This tag will be deleted from all items that currently have it. Are you sure you want to delete the tag?'
      )
    )
      return;

    api
      .delete(`/tag/${id}`)
      .then(() => onTagEvent({ type: 'DeleteTag', id }))
      .catch(addToastForError);
  }

  return (
    <>
      <span className='flex flex-col gap-4 shrink overflow-y-auto'>
        {tags.values().map(tag => (
          <span key={tag.id} className='flex gap-2 items-center'>
            <ConfirmedTextInput
              showUnderline
              aria-label={`rename tag: ${tag.name}`}
              updateValue={updateTagName.bind(null, tag)}
              value={tag.name}
            />
            <ColorPicker
              label={`edit color: ${tag.name}`}
              value={tag.color}
              onValueChange={updateTagColor.bind(null, tag)}
            />
            <Button
              isIconOnly
              aria-label={`delete tag: ${tag.name}`}
              color='danger'
              size='sm'
              variant='ghost'
              onPress={deleteTag.bind(null, tag.id)}
            >
              <TrashFill />
            </Button>
          </span>
        ))}
      </span>
      <TagInput onTagCreated={addNewTag} />
    </>
  );
}
