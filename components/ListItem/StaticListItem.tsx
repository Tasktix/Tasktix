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

import { useEffect, useRef, useState } from 'react';
import { addToast, Checkbox, Chip } from '@heroui/react';
import { DragControls } from 'framer-motion';
import { CardChecklist, GripVertical } from 'react-bootstrap-icons';
import Link from 'next/link';

import { default as api } from '@/lib/api';
import { formatDate } from '@/lib/date';
import { NamedColor } from '@/lib/model/color';
import ListItemModel from '@/lib/model/listItem';
import ListMember from '@/lib/model/listMember';
import Tag from '@/lib/model/tag';
import List from '@/lib/model/list';
import { getBackgroundColor, getTextColor } from '@/lib/color';

import DateInput from '../DateInput';
import Name from '../Name';

import ExpectedInput from './ExpectedInput';
import ElapsedInput from './ElapsedInput';
import More from './More';
import Priority from './Priority';
import Tags from './Tags';
import TimeButton from './TimeButton';
import Users from './Users';

interface StaticListItemParams {
  item: ListItemModel;
  list?: List;
  members: ListMember[];
  tagsAvailable: Tag[];
  hasTimeTracking: boolean;
  hasDueDates: boolean;
  reorderControls?: DragControls;
  setStatus: (status: ListItemModel['status']) => unknown;
  updateDueDate: (date: Date) => unknown;
  updatePriority: (priority: ListItemModel['priority']) => unknown;
  deleteItem: () => unknown;
  setPaused: () => unknown;
  setCompleted: (date: ListItemModel['dateCompleted']) => unknown;
  updateExpectedMs: (ms: number) => unknown;
  addNewTag: (name: string, color: NamedColor) => Promise<string>;
}

interface SetItem {
  name: (name: string) => void;
  dueDate: (date: Date) => void;
  priority: (priority: ListItemModel['priority']) => void;
  complete: () => void;
  incomplete: () => void;
  expectedMs: (ms: number) => void;
  startedRunning: () => void;
  pausedRunning: () => void;
  resetTime: () => void;
  linkedTag: (id: string) => void;
  linkedNewTag: (id: string, name: string, color: NamedColor) => void;
  unlinkedTag: (id: string) => void;
  deleted: () => void;
}

export default function StaticListItem({
  item: item,
  list,
  members,
  tagsAvailable,
  hasTimeTracking,
  hasDueDates,
  reorderControls,
  setStatus,
  updateDueDate,
  updatePriority,
  deleteItem,
  setPaused,
  setCompleted,
  updateExpectedMs,
  addNewTag
}: StaticListItemParams) {
  const minute = 1000 * 60;
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const timer = useRef<NodeJS.Timeout>();
  const updateTime = useRef(() => {});
  const lastTime = useRef(new Date());
  const [elapsedLive, setElapsedLive] = useState(
    item.elapsedMs +
      (item.dateStarted ? Date.now() - item.dateStarted.getTime() : 0)
  );
  const [_item, _setItem] = useState(item);
  const [tags, setTags] = useState<Tag[]>(item.tags);

  /**
   * Functions that
   *    - Update the database
   *    - Update internal item state
   *    - Propagate changes to the parent
   */
  const set: SetItem = {
    name: (name: string): void => {
      api
        .patch(`/item/${_item.id}`, { name })
        .then(() => {
          // Update the internal state
          const newItem = structuredClone(_item);

          newItem.name = name;
          _setItem(newItem);
        })
        .catch(err => addToast({title: err.message, color: 'danger'}));
    },

    dueDate: (date: Date): void => {
      api
        .patch(`/item/${_item.id}`, { dateDue: date })
        .then(() => {
          // Update the internal state
          const newItem = structuredClone(_item);

          newItem.dateDue = date;
          _setItem(newItem);

          // Send parent the update for reordering items
          updateDueDate(date);
        })
        .catch(err => addToast({title: err.message, color: 'danger'}));
    },

    priority: (priority: ListItemModel['priority']): void => {
      api
        .patch(`/item/${_item.id}`, { priority })
        .then(() => {
          // Update the internal state
          const newItem = structuredClone(_item);

          newItem.priority = priority;
          _setItem(newItem);

          // Send parent the update for reordering items
          updatePriority(priority);
        })
        .catch(err => addToast({title: err.message, color: 'danger'}));
    },

    incomplete: () => {
      api
        .patch(`/item/${_item.id}`, { status: 'Paused', dateCompleted: null })
        .then(() => {
          // Update the internal state
          const newItem = structuredClone(_item);

          newItem.status = 'Paused';
          newItem.dateCompleted = null;
          _setItem(newItem);

          // Send parent the update for reordering items
          setPaused();
        })
        .catch(err => addToast({title: err.message, color: 'danger'}));
    },

    complete: () => {
      // Store time before starting POST request to ensure it's accurate
      const dateCompleted = new Date();
      const newElapsed = timer.current
        ? elapsedLive + (Date.now() - lastTime.current.getTime())
        : 0;

      api
        .patch(`/item/${_item.id}`, {
          status: 'Completed',
          dateCompleted,
          dateStarted: null,
          elapsedMs: newElapsed
        })
        .then(() => {
          _stopRunning();
          // Ensure time is accurate since user stopped time before POST request
          if (newElapsed) setElapsedLive(newElapsed);

          // Update the internal state
          const newItem = structuredClone(_item);

          newItem.status = 'Completed';
          newItem.dateCompleted = dateCompleted;
          _setItem(newItem);

          // Send parent the update for reordering items
          setCompleted(dateCompleted);
        })
        .catch(err => addToast({title: err.message, color: 'danger'));
    },

    expectedMs: (ms: number) => {
      api
        .patch(`/item/${item.id}`, { expectedMs: ms })
        .then(() => {
          // Update the internal state
          const newItem = structuredClone(_item);

          newItem.expectedMs = ms;
          _setItem(newItem);

          // Send parent the update for reordering items
          updateExpectedMs(ms);
        })
        .catch(err => addToast({title: err.message, color: 'danger'}));
    },

    startedRunning: () => {
      const startedDate = new Date();

      api
        .patch(`/item/${_item.id}`, {
          dateStarted: startedDate,
          status: 'In Progress'
        })
        .then(() => {
          // Update the timer
          lastTime.current = startedDate;
          clearTimeout(timer.current); // Just for safety
          timer.current = setTimeout(
            updateTime.current,
            minute - (elapsedLive % minute) + 5
          );

          // Update the internal state
          const newItem = structuredClone(_item);

          newItem.status = 'In Progress';
          _setItem(newItem);

          // Send parent the update for reordering items
          setStatus('In Progress');
        })
        .catch(err => addToast({title: err.message, color: 'danger'}));
    },

    pausedRunning: () => {
      const newElapsed =
        elapsedLive + (Date.now() - lastTime.current.getTime());

      api
        .patch(`/item/${_item.id}`, {
          dateStarted: null,
          elapsedMs: newElapsed,
          status: 'Paused'
        })
        .then(() => {
          _stopRunning();

          // Ensure time is accurate since user stopped time before POST request
          setElapsedLive(newElapsed);

          // Update the internal state
          const newItem = structuredClone(_item);

          newItem.status = 'Paused';
          _setItem(newItem);

          // Send parent the update for reordering items
          setStatus('Paused');
        })
        .catch(err => addToast({title: err.message, color: 'danger'}));
    },

    resetTime: () => {
      const status = _item.status === 'Completed' ? 'Completed' : 'Unstarted';

      api
        .patch(`/item/${_item.id}`, { dateStarted: null, status, elapsedMs: 0 })
        .then(() => {
          _stopRunning();

          // Clear timer
          setElapsedLive(0);

          // Update the internal state
          const newItem = structuredClone(_item);

          newItem.status = status;
          _setItem(newItem);

          // Send parent the update for reordering items
          setStatus(status);
        })
        .catch(err => addToast({title: err.message, color: 'danger'}));
    },

    linkedTag: (id: string) => {
      api
        .post(`/item/${_item.id}/tag/${id}`, {})
        .then(() => {
          // Update the internal state
          const newTags = structuredClone(tags);

          const tag = tagsAvailable?.find(tag => tag.id === id);

          if (!tag) throw new Error(`Could not find tag with id ${id}`);

          newTags.push(new Tag(tag.name, tag.color, id));

          setTags(newTags);
        })
        .catch(err => addToast({title: err.message, color: 'danger'}));
    },

    linkedNewTag: (id: string, name: string, color: NamedColor) => {
      const newTags = structuredClone(tags);

      newTags.push(new Tag(name, color, id));

      setTags(newTags);
    },

    unlinkedTag: (id: string) => {
      api
        .delete(`/item/${_item.id}/tag/${id}`)
        .then(() => {
          // Update the internal state
          const newTags = structuredClone(tags);

          for (let i = 0; i < newTags.length; i++)
            if (newTags[i].id === id) newTags.splice(i, 1);
          setTags(newTags);
        })
        .catch(err => addToast({title: err.message, color: 'danger'}));
    },

    deleted: () => {
      api
        .delete(`/item/${_item.id}`)
        .then(res => {
          // Send parent the update to remove this component
          deleteItem();

          // Let the user know we succeeded
          addSnackbar(res.message, 'success');
        })
        .catch(err => addToast({title: err.message, color: 'danger'}));
    }
  };

  // Use effect to keep track of the changing timer function
  useEffect(() => {
    updateTime.current = () => {
      timer.current = setTimeout(() => updateTime.current(), minute);
      setElapsedLive(elapsedLive + (Date.now() - lastTime.current.getTime()));
      lastTime.current = new Date();
    };
  });

  // Start the timer if it should be running when the component is first rendered
  useEffect(() => {
    if (_item.status === 'In Progress' && !timer.current)
      timer.current = setTimeout(
        updateTime.current,
        minute - (elapsedLive % minute) + 5
      );

    // Dependencies intentionally excluded to only trigger this when the component is first rendered
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function _stopRunning() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = undefined;
    }
  }

  return (
    <div
      className={`p-4 bg-content1 flex gap-4 items-center justify-between w-full ${reorderControls ? '' : 'border-b-1 border-content3 last:border-b-0'}`}
    >
      <span className='flex gap-4 items-center justify-between w-2/5'>
        {reorderControls ? (
          <div
            className={`px-1 py-2 -mx-3 rounded-lg ${_item.status === 'Completed' ? 'text-foreground/20' : 'text-foreground/50 cursor-grab'} text-lg`}
            onPointerDown={e => {
              e.preventDefault();
              if (_item.status !== 'Completed') reorderControls.start(e);
            }}
          >
            <GripVertical />
          </div>
        ) : null}

        <Checkbox
          className='-mr-3'
          isSelected={_item.status === 'Completed'}
          tabIndex={0}
          onChange={e => {
            if (e.target.checked) set.complete();
            else set.incomplete();
          }}
        />

        <span className='flex gap-4 items-center justify-start grow flex-wrap'>
          <div className='flex grow shrink-0 flex-col w-64 gap-0 -mt-3 -mb-1'>
            {_item.status === 'Completed' ? (
              <span className='text-sm line-through text-foreground/50 text-nowrap overflow-hidden'>
                {_item.name}
              </span>
            ) : (
              <span className={`-ml-1 flex ${hasDueDates || 'mt-1'}`}>
                <Name
                  className='shrink'
                  name={_item.name}
                  updateName={set.name}
                />
              </span>
            )}

            {_item.status === 'Completed' ? (
              <span className='text-xs text-secondary/75 relative top-3'>
                {_item.dateCompleted
                  ? `Completed ${formatDate(_item.dateCompleted)}`
                  : `Due ${_item.dateDue ? formatDate(_item.dateDue) : ''}`}
              </span>
            ) : hasDueDates ? (
              <DateInput
                className='h-fit'
                color={
                  _item.dateDue && _item.dateDue < today
                    ? 'danger'
                    : 'secondary'
                }
                displayContent={
                  _item.dateDue
                    ? `Due ${formatDate(_item.dateDue)}`
                    : 'Set due date'
                }
                value={_item.dateDue || new Date()}
                onValueChange={set.dueDate}
              />
            ) : null}
          </div>

          {list && (
            <Link href={`/list/${list.id}`}>
              <Chip
                className={`p-2 ${getBackgroundColor(list.color)}/20 ${getTextColor(list.color)}`}
                size='sm'
                startContent={<CardChecklist className='mx-1' />}
                variant='flat'
              >
                {list.name}
              </Chip>
            </Link>
          )}
        </span>
      </span>
      <span className='flex gap-4 items-center justify-between w-3/5'>
        <Priority
          isComplete={_item.status === 'Completed'}
          priority={_item.priority}
          setPriority={set.priority}
        />

        <Tags
          addNewTag={addNewTag}
          className='hidden lg:flex'
          isComplete={_item.status === 'Completed'}
          linkNewTag={set.linkedNewTag}
          linkTag={set.linkedTag}
          tags={tagsAvailable.filter(tag => tags.find(t => tag.id === t.id))}
          tagsAvailable={tagsAvailable}
          unlinkTag={set.unlinkedTag}
        />

        {members.length > 1 ? (
          <Users
            assignees={_item.assignees}
            isComplete={_item.status === 'Completed'}
            itemId={_item.id}
            members={members}
          />
        ) : null}

        <span className='flex gap-4 items-center justify-end grow md:grow-0 shrink-0 justify-self-end'>
          {hasTimeTracking ? (
            <span className='hidden xl:flex gap-4'>
              <span
                className={`flex gap-4 ${_item.status === 'Completed' ? 'opacity-50' : ''}`}
              >
                <ExpectedInput
                  disabled={_item.status === 'Completed'}
                  ms={_item.expectedMs}
                  updateMs={set.expectedMs}
                />
                <span className='border-r-1 border-content3' />
                <ElapsedInput
                  disabled={_item.status === 'Completed'}
                  ms={elapsedLive}
                  resetTime={set.resetTime}
                />
              </span>
              <TimeButton
                pauseRunning={set.pausedRunning}
                startRunning={set.startedRunning}
                status={_item.status}
              />
            </span>
          ) : null}

          <More
            addNewTag={addNewTag}
            elapsedLive={elapsedLive}
            hasDueDates={hasDueDates}
            hasTimeTracking={hasTimeTracking}
            item={_item}
            members={members}
            set={set}
            tags={tags}
            tagsAvailable={tagsAvailable}
          />
        </span>
      </span>
    </div>
  );
}
