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

import { ReactNode, useReducer, useRef } from 'react';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  useDisclosure
} from '@heroui/react';
import { List as ListIcon } from 'react-bootstrap-icons';

import Sidebar, { listReducer, ListContext } from '@/components/Sidebar';
import List from '@/lib/model/list';

function MobileSidebarHeader() {
  return (
    <DrawerHeader className='px-0 pb-2 pt-0 text-sm font-semibold'>
      Navigation
    </DrawerHeader>
  );
}

function MobileSidebarDrawer({
  closeDrawer,
  isDrawerOpen,
  lists,
  onOpenChange
}: {
  closeDrawer: () => void;
  isDrawerOpen: boolean;
  lists: List[];
  onOpenChange: () => void;
}) {
  return (
    <Drawer
      hideCloseButton
      classNames={{
        backdrop: 'md:hidden',
        base: 'md:hidden',
        wrapper: 'md:hidden'
      }}
      isOpen={isDrawerOpen}
      placement='left'
      scrollBehavior='inside'
      onOpenChange={onOpenChange}
    >
      <DrawerContent
        className='w-72 max-w-[85vw] rounded-none border-r border-content3 p-4 shadow-2xl'
        id='mobile-sidebar-drawer'
      >
        <MobileSidebarHeader />
        <DrawerBody className='px-0 pb-0 pt-0'>
          <Sidebar
            className='w-full flex-1 p-0 pr-0 shadow-none'
            lists={lists}
            onNavigate={closeDrawer}
          />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

export default function LayoutClient({
  startingLists,
  children
}: {
  startingLists: string;
  children: ReactNode;
}) {
  const {
    isOpen: isDrawerOpen,
    onClose: closeDrawer,
    onOpen,
    onOpenChange
  } = useDisclosure();
  const [lists, dispatchEvent] = useReducer(
    listReducer,
    JSON.parse(startingLists) as List[]
  );
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  return (
    <ListContext.Provider value={dispatchEvent}>
      <div className='flex h-1/4 grow overflow-x-hidden'>
        <Sidebar className='hidden md:flex' lists={lists} />

        <div className='flex min-w-0 grow flex-col'>
          <header className='sticky top-0 z-20 flex items-center border-b border-content3 bg-content1/90 p-3 backdrop-blur md:hidden'>
            <Button
              ref={hamburgerRef}
              isIconOnly
              aria-controls='mobile-sidebar-drawer'
              aria-expanded={isDrawerOpen}
              aria-label='Open navigation menu'
              variant='ghost'
              onPress={onOpen}
            >
              <ListIcon size={20} />
            </Button>
          </header>

          {children}
        </div>
      </div>
      <MobileSidebarDrawer
        closeDrawer={closeDrawer}
        isDrawerOpen={isDrawerOpen}
        lists={lists}
        onOpenChange={onOpenChange}
      />
    </ListContext.Provider>
  );
}
