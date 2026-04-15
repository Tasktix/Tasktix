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

import { FormEvent, ReactNode, useContext, useState } from 'react';
import {
  addToast,
  Button,
  Form,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure
} from '@heroui/react';
import { Plus } from 'react-bootstrap-icons';
import { usePathname, useRouter } from 'next/navigation';

import { default as api } from '@/lib/api';
import List from '@/lib/model/list';
import { randomNamedColor } from '@/lib/color';
import { addToastForError } from '@/lib/error';

import { ListContext } from './listContext';

/**
 * Displays a sidebar with an entry for the "Today" view and an entry for each list the
 * user has access to
 *
 * @param lists The lists the user has access to
 */
export default function Sidebar({ lists }: { lists: List[] }) {
  const router = useRouter();
  const dispatchEvent = useContext(ListContext);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  function submitNewList(name: string) {
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
      .catch(addToastForError);
  }

  return (
    <aside className='w-48 bg-transparent shadow-l-lg shadow-content4 p-4 pr-0 flex flex-col gap-4 overflow-auto'>
      <NavItem link='/list' name='Today' />
      <NavSection endContent={<AddList openListDialog={onOpen} />} name='Lists'>
        {lists
          .sort((a, b) => (a.name > b.name ? 1 : 0))
          .map(list => (
            <NavItem key={list.id} link={`/list/${list.id}`} name={list.name} />
          ))}
      </NavSection>
      <CreateListModal
        isOpen={isOpen}
        submitList={submitNewList}
        onOpenChange={onOpenChange}
      />
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

function AddList({ openListDialog }: { openListDialog: () => unknown }) {
  return (
    <Button
      isIconOnly
      aria-label='Create new list'
      className='border-0 text-foreground rounded-lg w-8 h-8 min-w-8 min-h-8'
      color='primary'
      variant='ghost'
      onPress={openListDialog}
    >
      <Plus size={'1.25em'} />
    </Button>
  );
}

/**
 * Renders a modal providing the capability to create a new List with a given
 * name and optionally link it to a specified github repository (if configured)
 * @param isOpen The `isOpen` parameter from HeroUI's `useDisclosure`
 * @param onOpenChange The `onOpenChange` parameter from HeroUI's `useDisclosure`
 * @param submitList A handler function used to submit the list to the API
 * @returns
 */
function CreateListModal({
  isOpen,
  submitList,
  onOpenChange
}: Readonly<{
  isOpen: boolean;
  submitList: (name: string) => void;
  onOpenChange: (isOpen: boolean) => unknown;
}>) {
  const [listName, setListName] = useState('');

  const handleSubmitList = (
    e: FormEvent<HTMLFormElement>,
    onClose: () => void
  ) => {
    e.preventDefault();

    if (listName.trim()) {
      submitList(listName);
      setListName('');
      onClose();
    } else {
      addToast({ title: 'Please provide a list name', color: 'warning' });
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {onClose => (
          <>
            <ModalHeader className='flex gap-2 items-center'>
              Create New List
            </ModalHeader>
            <ModalBody className='text-sm text-default-500'>
              <Form onSubmit={e => handleSubmitList(e, onClose)}>
                <Input
                  color='primary'
                  placeholder='List name'
                  size='sm'
                  value={listName}
                  variant='underlined'
                  onValueChange={setListName}
                />
                <div className='flex p-4 justify-end w-full gap-6'>
                  <Button variant='light' onPress={onClose}>
                    Cancel
                  </Button>
                  <Button color='primary' type='submit' aria-label='Submit list'>
                    Confirm
                  </Button>
                </div>
              </Form>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
