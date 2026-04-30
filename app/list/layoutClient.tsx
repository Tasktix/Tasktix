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

import { ReactNode, useReducer } from 'react';
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
    onOpen: openDrawer,
    onOpenChange: onDrawerOpenChange
  } = useDisclosure();
  const [lists, dispatchEvent] = useReducer(
    listReducer,
    JSON.parse(startingLists) as List[]
  );

  return (
    <ListContext.Provider value={dispatchEvent}>
      <div className='flex h-1/4 grow overflow-x-hidden'>
        <Sidebar lists={lists} />

        <div className='flex min-w-0 grow flex-col'>
          <header className='sticky top-0 z-20 flex items-center border-b border-content3 bg-content1/90 p-3 backdrop-blur md:hidden'>
            <Button
              isIconOnly
              aria-controls='mobile-sidebar-drawer'
              aria-expanded={isDrawerOpen}
              aria-label='Open navigation menu'
              variant='ghost'
              onPress={openDrawer}
            >
              <ListIcon size={20} />
            </Button>
          </header>
          {children}
        </div>
      </div>
      <Drawer
        backdrop='transparent'
        isOpen={isDrawerOpen}
        placement='left'
        onOpenChange={onDrawerOpenChange}
      >
        <DrawerContent id='mobile-sidebar-drawer'>
          <DrawerHeader>Navigation</DrawerHeader>
          <DrawerBody>
            <Sidebar inDrawer lists={lists} onNavigate={closeDrawer} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </ListContext.Provider>
  );
}
