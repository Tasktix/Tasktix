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

import {
  Button,
  Chip,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@heroui/react';
import { useState } from 'react';
import { X, Plus, Tags as TagsIcon } from 'react-bootstrap-icons';

import TagModel from '@/lib/model/tag';
import { getBackgroundColor, getTextColor } from '@/lib/color';
import { NamedColor } from '@/lib/model/color';

import TagInput from '../TagInput';

export default function Tags({
  tags,
  isComplete,
  tagsAvailable,
  className,
  addNewTag,
  linkTag,
  linkNewTag,
  unlinkTag
}: {
  tags: TagModel[];
  isComplete: boolean;
  tagsAvailable?: TagModel[];
  className?: string;
  addNewTag: (name: string, color: NamedColor) => Promise<string>;
  linkTag: (id: string) => unknown;
  linkNewTag?: (
    id: string,
    name: string,
    color: NamedColor
  ) => Promise<unknown>;
  unlinkTag: (id: string) => unknown;
}) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <Popover
      isOpen={isPopoverOpen}
      placement='bottom'
      shouldCloseOnBlur={false} // Prevent closing popover when tag color selection opens nested popover
      onOpenChange={open => {
        if (!isComplete) setIsPopoverOpen(open);
      }}
    >
      <PopoverTrigger>
        <Button
          aria-label='Update tags'
          className={`px-4 basis-1/6 grow shrink flex flex-row items-center justify-start overflow-hidden flex-nowrap h-10 shadow-none cursor-pointer bg-transparent ${isComplete ? 'opacity-50 cursor-default' : 'hover:bg-foreground/10 focus:z-10 focus:outline-2 focus:outline-focus focus:outline-offset-2'} ${className}`}
          isDisabled={isComplete}
          tabIndex={isComplete ? 1 : 0}
        >
          <TagsIcon className='shrink-0' />
          <span className='ml-2 flex flex-row items-center justify-start overflow-hidden flex-nowrap'>
            {tags
              .sort((a, b) => (a.name > b.name ? 1 : -1))
              .map(tag => (
                <Chip
                  key={tag.id}
                  classNames={{
                    dot: getBackgroundColor(tag.color),
                    base: 'border-0',
                    content: getTextColor(tag.color)
                  }}
                  size='sm'
                  variant='dot'
                >
                  {tag.name}
                </Chip>
              ))}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        {tags
          .sort((a, b) => (a.name > b.name ? 1 : -1))
          .map(tag => (
            <div
              key={tag.id}
              className={`${getTextColor(tag.color)} flex justify-between items-center w-full p-1.5`}
            >
              {tag.name}
              <Button
                isIconOnly
                aria-label={`Remove ${tag.name} from item`}
                className='rounded-lg w-8 h-8 min-w-8 min-h-8'
                color='danger'
                variant='flat'
                onPress={unlinkTag.bind(null, tag.id)}
              >
                <X />
              </Button>
            </div>
          ))}
        {tagsAvailable
          ? tagsAvailable
              .sort((a, b) => (a.name > b.name ? 1 : -1))
              .map(tag => {
                if (tags.some(usedTag => usedTag.id === tag.id)) return null;
                else
                  return (
                    <div
                      key={tag.id}
                      className={`${getTextColor(tag.color)} flex justify-between items-center w-full p-1.5`}
                    >
                      {tag.name}
                      <Button
                        isIconOnly
                        aria-label={`Add ${tag.name} to item`}
                        className='rounded-lg w-8 h-8 min-w-8 min-h-8'
                        color='primary'
                        variant='flat'
                        onPress={linkTag.bind(null, tag.id)}
                      >
                        <Plus />
                      </Button>
                    </div>
                  );
              })
          : null}
        <TagInput
          addNewTag={addNewTag}
          className='p-1.5 pl-1'
          classNames={{ name: 'w-24' }}
          linkNewTag={linkNewTag}
        />
      </PopoverContent>
    </Popover>
  );
}
