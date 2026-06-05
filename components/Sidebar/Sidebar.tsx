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

import { ReactNode } from 'react';
import { Button, Link, useDisclosure } from '@heroui/react';
import { Plus } from 'react-bootstrap-icons';
import { usePathname } from 'next/navigation';

import List from '@/lib/model/list';

import CreateListModal from './CreateListModal';

/**
 * Displays a sidebar with an entry for the "Today" view and an entry for each list the
 * user has access to
 *
 * @param lists The lists the user has access to
 * @param onNavigate Called after a navigation link is pressed
 */
export default function Sidebar({
  lists,
  onNavigate
}: Readonly<{
  lists: List[];
  onNavigate?: () => void;
}>) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <aside className='bg-transparent flex flex-col gap-4 overflow-auto w-full'>
      <NavItem link='/list' name='Today' onNavigate={onNavigate} />
      <NavSection
        endContent={<AddList onListModalOpen={onOpen} />}
        name='Lists'
      >
        {lists
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(list => (
            <NavItem
              key={list.id}
              link={`/list/${list.id}`}
              name={list.name}
              onNavigate={onNavigate}
            />
          ))}
      </NavSection>
      <CreateListModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </aside>
  );
}

function NavSection({
  name,
  endContent,
  children
}: Readonly<{
  name: string;
  endContent?: ReactNode;
  children: ReactNode;
}>) {
  return (
    <div className='flex flex-col'>
      <div className='flex justify-between items-center text-xs'>
        {name} {endContent}
      </div>
      <div className='pl-2 flex flex-col'>{children}</div>
    </div>
  );
}

function NavItem({
  name,
  link,
  endContent,
  onNavigate
}: Readonly<{
  name: string;
  link: string;
  endContent?: ReactNode;
  onNavigate?: () => void;
}>) {
  const pathname = usePathname();
  const isActive = pathname === link;

  return (
    <span
      className={`pl-2 my-1 flex items-center justify-between border-l-2 ${isActive ? 'border-primary' : 'border-transparent'} text-sm`}
    >
      <Link color='foreground' href={link} onPress={onNavigate}>
        {name}
      </Link>
      {endContent}
    </span>
  );
}

function AddList({
  onListModalOpen
}: Readonly<{ onListModalOpen: () => unknown }>) {
  return (
    <Button
      isIconOnly
      aria-label='Create new list'
      className='border-0 text-foreground rounded-lg w-8 h-8 min-w-8 min-h-8'
      color='primary'
      variant='ghost'
      onPress={onListModalOpen}
    >
      <Plus size={'1.25em'} />
    </Button>
  );
}
