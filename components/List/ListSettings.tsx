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
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Switch,
  Tab,
  Tabs,
  useDisclosure
} from '@nextui-org/react';
import { useContext } from 'react';
import { TrashFill, GearWideConnected } from 'react-bootstrap-icons';
import { useRouter } from 'next/navigation';

import { default as api } from '@/lib/api';
import Tag from '@/lib/model/tag';
import { NamedColor } from '@/lib/model/color';
import ConfirmedTextInput from '@/components/ConfirmedTextInput';

import { ListContext } from '../Sidebar';
import ColorPicker from '../ColorPicker';
import { addSnackbar } from '../Snackbar';
import TagInput from '../TagInput';

export function ListSettings({
  listId,
  listName,
  listColor,
  tagsAvailable,
  hasTimeTracking,
  isAutoOrdered,
  hasDueDates,
  setListName,
  setListColor,
  setTagsAvailable,
  setHasTimeTracking,
  setHasDueDates,
  setIsAutoOrdered,
  addNewTag
}: {
  listId: string;
  listName: string;
  listColor: NamedColor;
  tagsAvailable: Tag[];
  hasTimeTracking: boolean;
  hasDueDates: boolean;
  isAutoOrdered: boolean;
  setListName: (name: string) => unknown;
  setListColor: (color: NamedColor) => unknown;
  setTagsAvailable: (value: Tag[]) => unknown;
  setHasTimeTracking: (value: boolean) => unknown;
  setHasDueDates: (value: boolean) => unknown;
  setIsAutoOrdered: (value: boolean) => unknown;
  addNewTag: (name: string, color: NamedColor) => Promise<string>;
}) {
  const router = useRouter();
  const dispatchEvent = useContext(ListContext);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  function updateHasTimeTracking(value: boolean) {
    if (value === hasTimeTracking) return;

    api
      .patch(`/list/${listId}`, { hasTimeTracking: value })
      .then(() => setHasTimeTracking(value))
      .catch(err => addSnackbar(err.message, 'error'));
  }

  function updateHasDueDates(value: boolean) {
    if (value === hasDueDates) return;

    api
      .patch(`/list/${listId}`, { hasDueDates: value })
      .then(() => setHasDueDates(value))
      .catch(err => addSnackbar(err.message, 'error'));
  }

  function updateIsAutoOrdered(value: boolean) {
    if (value === isAutoOrdered) return;

    api
      .patch(`/list/${listId}`, { isAutoOrdered: value })
      .then(() => setIsAutoOrdered(value))
      .catch(err => addSnackbar(err.message, 'error'));
  }

  function updateName(name: string) {
    api
      .patch(`/list/${listId}`, { name })
      .then(() => setListName(name))
      .catch(err => addSnackbar(err.message, 'error'));
  }

  function updateColor(color: NamedColor | null) {
    if (color === null) return;

    api
      .patch(`/list/${listId}`, { color })
      .then(() => setListColor(color))
      .catch(err => addSnackbar(err.message, 'error'));
  }

  function deleteList() {
    if (
      !confirm(
        'Are you sure you want to delete this list? This action is irreversible.'
      )
    )
      return;

    api
      .delete(`/list/${listId}`)
      .then(res => {
        addSnackbar(res.message, 'success');
        dispatchEvent({ type: 'remove', id: listId });
        router.replace('/list');
      })
      .catch(err => addSnackbar(err.message, 'error'));
  }

  function updateTagName(tag: Tag, name: string) {
    api
      .patch(`/list/${listId}/tag/${tag.id}`, { ...tag, name })
      .then(() => {
        setTagsAvailable(
          tagsAvailable.map(t =>
            t.id === tag.id ? new Tag(name, t.color, t.id) : t
          )
        );
      })
      .catch(err => addSnackbar(err.message, 'error'));
  }

  function updateTagColor(tag: Tag, color: NamedColor | null) {
    if (color)
      api
        .patch(`/list/${listId}/tag/${tag.id}`, { ...tag, color })
        .then(() => {
          setTagsAvailable(
            tagsAvailable.map(t =>
              t.id === tag.id ? new Tag(t.name, color, t.id) : t
            )
          );
        })
        .catch(err => addSnackbar(err.message, 'error'));
  }

  function deleteTag(id: string) {
    if (
      !confirm(
        'This tag will be deleted from all items that currently have it. Are you sure you want to delete the tag?'
      )
    )
      return;

    api
      .delete(`/list/${listId}/tag/${id}`)
      .then(() => {
        setTagsAvailable(tagsAvailable.filter(tag => tag.id !== id));
      })
      .catch(err => addSnackbar(err.message, 'error'));
  }

  return (
    <>
      <Button
        isIconOnly
        className='bg-content1 shadow-lg shadow-content2'
        size='lg'
        variant='ghost'
        onPress={onOpen}
      >
        <GearWideConnected aria-label='Settings' size={20} />
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent className='h-1/2'>
          <ModalHeader className='justify-center pb-0'>
            List Settings
          </ModalHeader>
          <ModalBody className='overflow-clip'>
            <Tabs aria-label='Options' variant='underlined'>
              <Tab
                className='flex flex-col gap-4 grow justify-between'
                title='General'
              >
                <span className='flex flex-col gap-4 overflow-y-auto'>
                  <span className='flex gap-4 mb-2'>
                    <ConfirmedTextInput
                      showUnderline
                      classNames={{ input: 'text-md' }}
                      name={listName}
                      updateName={updateName}
                      variant='underlined'
                    />
                    <ColorPicker
                      value={listColor}
                      onValueChange={updateColor}
                    />
                  </span>
                  <Switch
                    isSelected={hasTimeTracking}
                    size='sm'
                    onValueChange={updateHasTimeTracking}
                  >
                    Track completion time
                  </Switch>
                  <Switch
                    isSelected={hasDueDates}
                    size='sm'
                    onValueChange={updateHasDueDates}
                  >
                    Track due dates
                  </Switch>
                  <Switch
                    isSelected={isAutoOrdered}
                    size='sm'
                    onValueChange={updateIsAutoOrdered}
                  >
                    Auto-order list items
                  </Switch>
                </span>
                <span className='flex justify-end'>
                  <Button
                    color='danger'
                    startContent={<TrashFill />}
                    variant='ghost'
                    onPress={deleteList}
                  >
                    Delete list
                  </Button>
                </span>
              </Tab>
              <Tab
                className='flex flex-col gap-6 grow shrink justify-between overflow-clip'
                title='Tags'
              >
                <span className='flex flex-col gap-4 shrink overflow-y-auto'>
                  {tagsAvailable.map(tag => (
                    <span key={tag.id} className='flex gap-2 items-center'>
                      <ConfirmedTextInput
                        showUnderline
                        name={tag.name}
                        updateName={updateTagName.bind(null, tag)}
                        variant='underlined'
                      />
                      <ColorPicker
                        value={tag.color}
                        onValueChange={updateTagColor.bind(null, tag)}
                      />
                      <Button
                        isIconOnly
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
                <TagInput addNewTag={addNewTag} />
              </Tab>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
