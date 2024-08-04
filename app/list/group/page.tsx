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

import { Button, Chip, Tab, Tabs } from '@nextui-org/react';

import SearchBar from '@/components/SearchBar/SearchBar';
import ListSection from '@/components/List/ListSection';
import { ListSettings } from '@/components/List/ListSettings';

export default function Page() {
  return (
    <main className='p-8 w-full flex flex-col gap-8 overflow-y-scroll'>
      <span className='flex flex-col gap-4'>
        <span className='flex gap-4 items-center'>
          <Chip color='primary' variant='shadow' onClose={() => undefined}>
            Tasktix
          </Chip>
          <Chip color='secondary' variant='shadow' onClose={() => undefined}>
            Personal
          </Chip>
          <Button color='success' size='sm' variant='flat'>
            Add...
          </Button>
        </span>
        <span className='flex gap-4 items-center'>
          <SearchBar inputOptions={[]} onValueChange={_ => _} />
          <ListSettings
            addNewTag={_ => Promise.resolve(_)}
            hasDueDates={true}
            hasTimeTracking={true}
            isAutoOrdered={true}
            listColor='Red'
            listId=''
            listName='group'
            setHasDueDates={_ => _}
            setHasTimeTracking={_ => _}
            setIsAutoOrdered={_ => _}
            setListColor={_ => Promise.resolve(_)}
            setListName={_ => Promise.resolve(_)}
            setTagsAvailable={_ => Promise.resolve(_)}
            tagsAvailable={[]}
          />
        </span>
        <Tabs variant='underlined'>
          <Tab title='All' />
          <Tab title='Saved filter 1' />
          <Tab title='Saved filter 2' />
        </Tabs>
      </span>

      {/*
       * Section options:
       *   - Mirror sections from lists (combine by name, not ID)
       *   - Custom sections
       *   - No sections
       *
       * Item adding options:
       *   - Automatic (if sections mirrored then into section, else into Uncategorized)
       *   - Manual (can add to each section using the "+" button; opens modal with all unadded items)
       */}
      <ListSection
        addNewTag={_ => Promise.resolve(_)}
        deleteSection={() => null}
        filters={[]}
        hasDueDates={true}
        hasTimeTracking={true}
        id=''
        isAutoOrdered={true}
        listId=''
        members={[]}
        name='Section'
        startingItems={[]}
        tagsAvailable={[]}
      />
    </main>
  );
}
