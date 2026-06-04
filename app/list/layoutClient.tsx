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

/**
 * Renders the persistent sidebar for desktop-sized screens.
 * @param lists The lists available to the current user
 */
function DesktopSidebar({ lists }: Readonly<{ lists: List[] }>) {
  return (
    <div className='hidden w-48 p-4 pr-0 shadow-l-lg shadow-content4 md:flex'>
      <Sidebar lists={lists} />
    </div>
  );
}

/**
 * Renders the mobile navigation header and drawer trigger.
 * @param isDrawerOpen Whether the mobile navigation drawer is open
 * @param openDrawer Opens the mobile navigation drawer
 */
function MobileHeader({
  isDrawerOpen,
  openDrawer
}: Readonly<{
  isDrawerOpen: boolean;
  openDrawer: () => void;
}>) {
  return (
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
  );
}

/**
 * Renders the mobile sidebar drawer and closes it after navigation.
 * @param isDrawerOpen Whether the mobile navigation drawer is open
 * @param lists The lists available to the current user
 * @param closeDrawer Closes the mobile navigation drawer
 * @param onDrawerOpenChange Handles HeroUI drawer open-state changes
 */
function MobileSidebarDrawer({
  isDrawerOpen,
  lists,
  closeDrawer,
  onDrawerOpenChange
}: Readonly<{
  isDrawerOpen: boolean;
  lists: List[];
  closeDrawer: () => void;
  onDrawerOpenChange: (isOpen: boolean) => void;
}>) {
  return (
    <Drawer
      backdrop='transparent'
      isOpen={isDrawerOpen}
      placement='left'
      onOpenChange={onDrawerOpenChange}
    >
      <DrawerContent id='mobile-sidebar-drawer'>
        <DrawerHeader>Navigation</DrawerHeader>
        <DrawerBody>
          <Sidebar lists={lists} onNavigate={closeDrawer} />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

export default function LayoutClient({
  startingLists,
  children
}: Readonly<{
  startingLists: string;
  children: ReactNode;
}>) {
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
        <DesktopSidebar lists={lists} />
        <div className='flex min-w-0 grow flex-col'>
          <MobileHeader isDrawerOpen={isDrawerOpen} openDrawer={openDrawer} />
          {children}
        </div>
      </div>
      <MobileSidebarDrawer
        closeDrawer={closeDrawer}
        isDrawerOpen={isDrawerOpen}
        lists={lists}
        onDrawerOpenChange={onDrawerOpenChange}
      />
    </ListContext.Provider>
  );
}
