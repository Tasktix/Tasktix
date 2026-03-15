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

import { Button, useDisclosure } from '@heroui/react';
import { TrashFill } from 'react-bootstrap-icons';

import ColorPicker from '@/components/ColorPicker';
import ConfirmedTextInput from '@/components/ConfirmedTextInput';
import TagInput from '@/components/TagInput';
import Tag from '@/lib/model/tag';
import api from '@/lib/api';
import { NamedColor } from '@/lib/model/color';
import { addToastForError } from '@/lib/error';

import ConfirmModal from '../ConfirmModal';

/**
 * Displays all tags in the List and allows tags to be added, edited, and deleted
 *
 * @param listId The list the tags are for
 * @param tagsAvailable All tags currently part of the list
 * @param addNewTag A callback for adding a tag to the list
 * @param setTagsAvailable A callback for updating React state with changes to the tags
 */
export default function TagSettings({
  tagsAvailable,
  addNewTag,
  setTagsAvailable
}: Readonly<{
  tagsAvailable: Tag[];
  addNewTag: (name: string, color: NamedColor) => Promise<string>;
  setTagsAvailable: (value: Tag[]) => unknown;
}>) {
  return (
    <>
      <span className='flex flex-col gap-4 shrink overflow-y-auto'>
        {tagsAvailable.map(tag => (
          <TagDetails
            key={tag.id}
            setTagsAvailable={setTagsAvailable}
            tag={tag}
            tagsAvailable={tagsAvailable}
          />
        ))}
      </span>
      <TagInput onTagCreated={addNewTag} />
    </>
  );
}

function TagDetails({
  tag,
  tagsAvailable,
  setTagsAvailable
}: {
  tag: Tag;
  tagsAvailable: Tag[];
  setTagsAvailable: (value: Tag[]) => unknown;
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  function updateTagName(name: string) {
    api
      .patch(`/tag/${tag.id}`, { name })
      .then(() => {
        setTagsAvailable(
          tagsAvailable.map(t =>
            t.id === tag.id ? new Tag(name, t.color, t.id) : t
          )
        );
      })
      .catch(addToastForError);
  }

  function updateTagColor(color: NamedColor | null) {
    if (color)
      api
        .patch(`/tag/${tag.id}`, { color })
        .then(() => {
          setTagsAvailable(
            tagsAvailable.map(t =>
              t.id === tag.id ? new Tag(t.name, color, t.id) : t
            )
          );
        })
        .catch(addToastForError);
  }

  function deleteTag() {
    api
      .delete(`/tag/${tag.id}`)
      .then(() => {
        setTagsAvailable(tagsAvailable.filter(t => t.id !== tag.id));
      })
      .catch(addToastForError);
  }

  return (
    <>
      <span key={tag.id} className='flex gap-2 items-center'>
        <ConfirmedTextInput
          showUnderline
          aria-label={`rename tag: ${tag.name}`}
          updateValue={updateTagName}
          value={tag.name}
        />
        <ColorPicker
          label={`edit color: ${tag.name}`}
          value={tag.color}
          onValueChange={updateTagColor}
        />
        <Button
          isIconOnly
          aria-label={`delete tag: ${tag.name}`}
          color='danger'
          size='sm'
          variant='ghost'
          onPress={onOpen}
        >
          <TrashFill />
        </Button>
      </span>
      <ConfirmModal
        description='This will also remove this tag from all items that currently have it.'
        isOpen={isOpen}
        title='Permanently delete tag?'
        onConfirm={deleteTag}
        onOpenChange={onOpenChange}
      />
    </>
  );
}
