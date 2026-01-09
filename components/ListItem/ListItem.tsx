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

import { useEffect, useReducer, useRef, useState } from 'react';
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
import ConfirmedTextInput from '../ConfirmedTextInput';

import itemReducer from './itemReducer';
import ExpectedInput from './ExpectedInput';
import ElapsedInput from './ElapsedInput';
import More from './More';
import Priority from './Priority';
import Tags from './Tags';
import TimeButton from './TimeButton';
import Users from './Users';
import { itemHandlerFactory } from './handlerFactory';
import { SetItem } from './types';

interface StaticListItemParams {
  item: ListItemModel;
  list?: List;
  members: ListMember[];
  tagsAvailable: Tag[];
  hasTimeTracking: boolean;
  hasDueDates: boolean;
  reorderControls?: DragControls;
  updateDueDate: (date: ListItemModel['dateDue']) => unknown;
  updatePriority: (priority: ListItemModel['priority']) => unknown;
  deleteItem: () => unknown;
  setRunning: () => unknown;
  setPaused: () => unknown;
  resetTime: (
    status: Extract<ListItemModel['status'], 'Unstarted' | 'Completed'>
  ) => unknown;
  setCompleted: (date: ListItemModel['dateCompleted']) => unknown;
  updateExpectedMs: (ms: number) => unknown;
  addNewTag: (name: string, color: NamedColor) => Promise<string>;
}

/**
 * The UI for interacting with a single list item's data, such as the name, priority,
 * assignees, etc.
 *
 * @param item The list item this component represents
 * @param list The list the item belongs to. If provided, a chip with the list name &
 *  color is displayed. Intended for use on pages with many lists' items to differentiate
 *  which ones they come from
 * @param members The members who have access to the list (used to provide options for
 *  assigning people to tasks)
 * @param tagsAvailable The tags associated with the list that could be added to this item
 * @param hasTimeTracking Whether the list settings enable tracking the time it takes to
 *  complete list items. Start/pause buttons, a timer, and expected time-to-complete are
 *  shown if so
 * @param hasDueDates Whether the list settings enable due dates for items
 * @param reorderControls Controller for Framer Motion's reordering feature. Used to
 *  trigger reordering when the user grabs the drag icon in the list item
 * @param updateDueDate Callback to propagate state changes for the item's due date
 * @param updatePriority Callback to propagate state changes for the item's priority
 * @param deleteItem Callback to propagate state changes to delete the item
 * @param setRunning Callback to propagate state changes for the item's status
 * @param setPaused Callback to propagate state changes for the item's status
 * @param resetTime Callback to propagate state changes for the item's status
 * @param setCompleted Callback to propagate state changes for the item's status
 * @param updateExpectedMs Callback to propagate state changes for the item's expected
 *  completion time
 * @param addNewTag Callback to propagate state changes when a new tag is created from the
 *  "add tag" menu
 */
export default function ListItem({
  item,
  list,
  members,
  tagsAvailable,
  hasTimeTracking,
  hasDueDates,
  reorderControls,
  updateDueDate,
  updatePriority,
  deleteItem,
  setRunning,
  setPaused,
  resetTime,
  setCompleted,
  updateExpectedMs,
  addNewTag
}: StaticListItemParams) {
  const minute = 1000 * 60;
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const timer = useRef<NodeJS.Timeout>(undefined);
  const updateTime = useRef(() => {});
  const lastTime = useRef(new Date());
  const [elapsedLive, setElapsedLive] = useState(
    item.elapsedMs +
      (item.dateStarted ? Date.now() - item.dateStarted.getTime() : 0)
  );

  const [_item, dispatchItem] = useReducer(itemReducer, item);

  const itemHandlers = itemHandlerFactory(
    item.id,
    {
      timer,
      lastTime,
      setElapsedLive,
      stopRunning: _stopRunning
    },
    tagsAvailable,
    dispatchItem,
    updateDueDate,
    updatePriority,
    setPaused,
    setCompleted,
    updateExpectedMs,
    deleteItem
  );

  /**
   * Functions for updating the list item timer
   */
  const set: SetItem = {
    startedRunning: () => {
      const startedDate = new Date();

      api
        .patch(`/item/${_item.id}`, {
          dateStarted: startedDate,
          status: 'In_Progress'
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
          dispatchItem({ type: 'StartTime' });

          // Send parent the update for reordering items
          setRunning();
        })
        .catch(err => addToast({ title: err.message, color: 'danger' }));
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
          dispatchItem({ type: 'PauseTime' });

          // Send parent the update for reordering items
          setPaused();
        })
        .catch(err => addToast({ title: err.message, color: 'danger' }));
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
          dispatchItem({ type: 'ResetTime', status });

          // Send parent the update for reordering items
          resetTime(status);
        })
        .catch(err => addToast({ title: err.message, color: 'danger' }));
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
    if (_item.status === 'In_Progress' && !timer.current)
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
            if (e.target.checked) itemHandlers.setComplete(elapsedLive);
            else itemHandlers.setIncomplete();
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
                <ConfirmedTextInput
                  className='shrink'
                  updateValue={itemHandlers.setName}
                  value={_item.name}
                  variant='underlined'
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
                onValueChange={itemHandlers.setDueDate}
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
          setPriority={itemHandlers.setPriority}
        />

        <Tags
          addNewTag={addNewTag}
          className='hidden lg:flex'
          isComplete={_item.status === 'Completed'}
          linkNewTag={(id, name, color) =>
            dispatchItem({ type: 'LinkNewTag', id, name, color })
          }
          linkTag={itemHandlers.linkTag}
          tags={tagsAvailable.filter(tag =>
            _item.tags.find(t => tag.id === t.id)
          )}
          tagsAvailable={tagsAvailable}
          unlinkTag={itemHandlers.unlinkTag}
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
                  updateMs={itemHandlers.setExpectedMs}
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
            itemHandlers={itemHandlers}
            members={members}
            set={set}
            tags={_item.tags}
            tagsAvailable={tagsAvailable}
          />
        </span>
      </span>
    </div>
  );
}
