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

import { ReactNode, useEffect, useReducer, useRef, useState } from 'react';
import { List as ListIcon, X } from 'react-bootstrap-icons';

import Sidebar, { listReducer, ListContext } from '@/components/Sidebar';
import List from '@/lib/model/list';

export default function LayoutClient({
  startingLists,
  children
}: {
  startingLists: string;
  children: ReactNode;
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [lists, dispatchEvent] = useReducer(
    listReducer,
    JSON.parse(startingLists) as List[]
  );
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const wasDrawerOpenRef = useRef(false);

  function closeDrawer() {
    setIsDrawerOpen(false);
  }

  useEffect(() => {
    if (!isDrawerOpen) {
      if (wasDrawerOpenRef.current) hamburgerRef.current?.focus();
      wasDrawerOpenRef.current = false;

      return;
    }

    wasDrawerOpenRef.current = true;

    function onKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeDrawer();
    }

    const focusTarget =
      drawerRef.current?.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ) || drawerRef.current;

    focusTarget?.focus();
    document.addEventListener('keydown', onKeydown);

    return () => {
      document.removeEventListener('keydown', onKeydown);
    };
  }, [isDrawerOpen]);

  return (
    <ListContext.Provider value={dispatchEvent}>
      <div className='flex h-1/4 grow overflow-x-hidden'>
        <Sidebar className='hidden md:flex' lists={lists} />

        <div className='flex min-w-0 grow flex-col'>
          <header className='sticky top-0 z-20 flex items-center border-b border-content3 bg-content1/90 p-3 backdrop-blur md:hidden'>
            <button
              ref={hamburgerRef}
              aria-controls='mobile-sidebar-drawer'
              aria-expanded={isDrawerOpen}
              aria-label='Open navigation menu'
              className='inline-flex h-10 w-10 items-center justify-center rounded-md border border-content3'
              type='button'
              onClick={() => setIsDrawerOpen(true)}
            >
              <ListIcon size={20} />
            </button>
          </header>

          {children}
        </div>
      </div>

      <div
        aria-hidden={!isDrawerOpen}
        aria-modal={isDrawerOpen}
        className={`fixed inset-0 z-40 transition-opacity duration-200 md:hidden ${isDrawerOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        role='dialog'
        onClick={closeDrawer}
      >
        <div className='absolute inset-0 bg-black/50' />
        <div
          id='mobile-sidebar-drawer'
          ref={drawerRef}
          className={`absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col border-r border-content3 bg-content1 p-4 shadow-2xl transition-transform duration-200 ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
          tabIndex={-1}
          onClick={event => event.stopPropagation()}
        >
          <div className='mb-2 flex items-center justify-between'>
            <span className='text-sm font-semibold'>Navigation</span>
            <button
              aria-label='Close navigation menu'
              className='inline-flex h-10 w-10 items-center justify-center rounded-md border border-content3'
              type='button'
              onClick={closeDrawer}
            >
              <X size={20} />
            </button>
          </div>
          <Sidebar
            className='w-full flex-1 p-0 pr-0 shadow-none'
            lists={lists}
            onNavigate={closeDrawer}
          />
        </div>
      </div>
    </ListContext.Provider>
  );
}
