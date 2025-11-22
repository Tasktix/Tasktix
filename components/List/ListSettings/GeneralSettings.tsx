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

import { addToast, Button, Switch } from '@heroui/react';
import { TrashFill } from 'react-bootstrap-icons';
import { useContext } from 'react';
import { useRouter } from 'next/navigation';

import ColorPicker from '@/components/ColorPicker';
import ConfirmedTextInput from '@/components/ConfirmedTextInput';
import { NamedColor } from '@/lib/model/color';
import api from '@/lib/api';
import { ListContext } from '@/components/Sidebar';

export default function GeneralSettings({
  listId,
  listName,
  listColor,
  hasDueDates,
  hasTimeTracking,
  isAutoOrdered,
  setListName,
  setListColor,
  setHasTimeTracking,
  setHasDueDates,
  setIsAutoOrdered
}: {
  listId: string;
  listName: string;
  listColor: NamedColor;
  isAutoOrdered: boolean;
  hasDueDates: boolean;
  hasTimeTracking: boolean;
  setListName: (name: string) => unknown;
  setListColor: (color: NamedColor) => unknown;
  setHasTimeTracking: (value: boolean) => unknown;
  setHasDueDates: (value: boolean) => unknown;
  setIsAutoOrdered: (value: boolean) => unknown;
}) {
  const router = useRouter();
  const dispatchEvent = useContext(ListContext);

  function updateHasTimeTracking(value: boolean) {
    if (value === hasTimeTracking) return;

    api
      .patch(`/list/${listId}`, { hasTimeTracking: value })
      .then(() => setHasTimeTracking(value))
      .catch(err => addToast({ title: err.message, color: 'danger' }));
  }

  function updateHasDueDates(value: boolean) {
    if (value === hasDueDates) return;

    api
      .patch(`/list/${listId}`, { hasDueDates: value })
      .then(() => setHasDueDates(value))
      .catch(err => addToast({ title: err.message, color: 'danger' }));
  }

  function updateIsAutoOrdered(value: boolean) {
    if (value === isAutoOrdered) return;

    api
      .patch(`/list/${listId}`, { isAutoOrdered: value })
      .then(() => setIsAutoOrdered(value))
      .catch(err => addToast({ title: err.message, color: 'danger' }));
  }

  function updateName(name: string) {
    api
      .patch(`/list/${listId}`, { name })
      .then(() => setListName(name))
      .catch(err => addToast({ title: err.message, color: 'danger' }));
  }

  function updateColor(color: NamedColor | null) {
    if (color === null) return;

    api
      .patch(`/list/${listId}`, { color })
      .then(() => setListColor(color))
      .catch(err => addToast({ title: err.message, color: 'danger' }));
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
        addToast({ title: res.message, color: 'success' });
        dispatchEvent({ type: 'remove', id: listId });
        router.replace('/list');
      })
      .catch(err => addToast({ title: err.message, color: 'danger' }));
  }

  return (
    <>
      <span className='flex flex-col gap-4 overflow-y-auto'>
        <span className='flex gap-4 mb-2'>
          <ConfirmedTextInput
            showUnderline
            classNames={{ input: 'text-md' }}
            updateValue={updateName}
            value={listName}
          />
          <ColorPicker value={listColor} onValueChange={updateColor} />
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
    </>
  );
}
