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

import { setTimeout } from 'timers';

import { ReactNode, useContext, useState } from 'react';
import { addToast, Button, Input, Link } from '@heroui/react';
import { Check, Plus } from 'react-bootstrap-icons';
import { usePathname, useRouter } from 'next/navigation';

import api from '@/lib/api';
import { validateListName } from '@/lib/validate';
import List from '@/lib/model/list';
import { randomNamedColor } from '@/lib/color';

import { ListContext } from './listContext';

export default function Sidebar({ lists }: { lists: List[] }) {
  const [addingList, setAddingList] = useState(false);
  const router = useRouter();
  const dispatchEvent = useContext(ListContext);

  function finalizeNew(name: string) {
    const color = randomNamedColor();

    api
      .post('/list', { name, color })
      .then(res => {
        const id = res.content?.split('/').at(-1);

        if (!id) {
          addToast({ title: 'No list ID returned', color: 'danger' });

          return;
        }
        router.push(`${res.content}`);
        dispatchEvent({ type: 'add', id, name, color });
      })
      .catch(err => addToast({ title: err.message, color: 'danger' }));
  }

  async function removeNew() {
    function delay(ms: number) {
      return new Promise(res => setTimeout(res, ms));
    }

    await delay(100);
    setAddingList(false);
  }

  return (
    <aside className='w-48 bg-transparent shadow-l-lg shadow-content4 p-4 pr-0 flex flex-col gap-4 overflow-auto'>
      <NavItem link='/list' name='Today' />
      <NavSection
        endContent={<AddList addList={() => setAddingList(true)} />}
        name='Lists'
      >
        {lists
          .sort((a, b) => (a.name > b.name ? 1 : 0))
          .map(list => (
            <NavItem key={list.id} link={`/list/${list.id}`} name={list.name} />
          ))}
        {addingList ? (
          <NewItem finalize={finalizeNew} remove={removeNew} />
        ) : null}
      </NavSection>
    </aside>
  );
}

function NavSection({
  name,
  endContent,
  children
}: {
  name: string;
  endContent?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className='flex flex-col'>
      <div className='flex justify-between items-center text-xs'>
        {name} {endContent}
      </div>
      <div className='pl-2 flex flex-col'>{children}</div>
    </div>
  );
}

export function NavItem({
  name,
  link,
  endContent
}: {
  name: string;
  link: string;
  endContent?: ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === link;

  return (
    <span
      className={`pl-2 my-1 flex items-center justify-between border-l-2 ${isActive ? 'border-primary' : 'border-transparent'} text-sm`}
    >
      <Link color='foreground' href={link}>
        {name}
      </Link>
      {endContent}
    </span>
  );
}

function AddList({ addList }: { addList: () => unknown }) {
  return (
    <Button
      isIconOnly
      className='border-0 text-foreground rounded-lg w-8 h-8 min-w-8 min-h-8'
      color='primary'
      variant='ghost'
      onPress={addList}
    >
      <Plus size={'1.25em'} />
    </Button>
  );
}

function NewItem({
  finalize,
  remove
}: {
  finalize: (name: string) => unknown;
  remove: () => unknown;
}) {
  const [name, setName] = useState('');

  function updateName(name: string) {
    setName(validateListName(name)[1]);
  }

  return (
    <form
      className='pl-1 flex items-center justify-between gap-2 text-sm'
      onSubmit={e => {
        e.preventDefault();
        finalize(name);
      }}
    >
      <Input
        autoFocus
        color='primary'
        placeholder='List name'
        size='sm'
        value={name}
        variant='underlined'
        onBlur={remove}
        onValueChange={updateName}
      />
      <Button
        isIconOnly
        className='rounded-lg w-8 h-8 min-w-8 min-h-8'
        color='primary'
        type='submit'
        variant='ghost'
      >
        <Check />
      </Button>
    </form>
  );
}
