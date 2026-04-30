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

import { FormEvent, useContext, useEffect, useState } from 'react';
import {
  Accordion,
  AccordionItem,
  addToast,
  Button,
  Chip,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem
} from '@heroui/react';
import { useRouter } from 'next/navigation';

import { randomNamedColor } from '@/lib/color';
import api from '@/lib/api';
import { addToastForError } from '@/lib/error';
import { SimplifiedRepo } from '@/lib/integration/github/types';

import { useAuth } from '../AuthProvider';

import { ListContext } from './listContext';

/**
 * Renders a modal providing the capability to create a new List with a given
 * name and optionally link it to a specified github repository (if configured)
 * @param isOpen The `isOpen` parameter from HeroUI's `useDisclosure`
 * @param onOpenChange The `onOpenChange` parameter from HeroUI's `useDisclosure`
 */
export default function CreateListModal({
  isOpen,
  onOpenChange
}: Readonly<{
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => unknown;
}>) {
  const [listName, setListName] = useState('');
  const [selectedRepoId, setSelectedRepoId] = useState<number | undefined>();
  const { oauthConfig } = useAuth();
  const dispatchEvent = useContext(ListContext);
  const router = useRouter();

  /**
   * Submits a list name and repoId for creation, handles client side error
   * notification if a user submit's the form with empty input
   * @param e Form Event Data
   * @param onClose Modal closing handle function from useDisclosure
   */
  const handleSubmitList = (
    e: FormEvent<HTMLFormElement>,
    onClose: () => void
  ) => {
    e.preventDefault();

    if (listName.trim()) {
      const color = randomNamedColor();

      api
        .post('/list', { name: listName, color, repoId: selectedRepoId })
        .then(res => {
          const id = res.content?.split('/').at(-1);

          if (!id) {
            addToast({ title: 'No list ID returned', color: 'danger' });

            return;
          }
          router.push(`${res.content}`);
          dispatchEvent({ type: 'add', id, name: listName, color });
        })
        .catch(addToastForError);
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
          // JSX depth already abstracted to reasonable level skipcq: JS-0415
          <>
            <ModalHeader className='flex gap-2 items-center'>
              Create New List
            </ModalHeader>
            <form onSubmit={e => handleSubmitList(e, onClose)}>
              <ModalBody className='text-sm text-default-500'>
                <Input
                  color='primary'
                  label='List name'
                  size='sm'
                  value={listName}
                  variant='underlined'
                  onValueChange={setListName}
                />
                {oauthConfig.githubEnabled && (
                  <GithubListConfig
                    onRepoSelection={id => setSelectedRepoId(Number(id))}
                  />
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button aria-label='Submit list' color='primary' type='submit'>
                  Confirm
                </Button>
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

/**
 * Renders the Configuration Accordion Menu for linking a new list to a Github
 * Repository. Does not show error toasts to cleanly handle users who don't
 * have github linked account.
 * @param onRepoSelection callback to update the selected repositoryID
 */
function GithubListConfig({
  onRepoSelection
}: {
  onRepoSelection: (id: number) => void;
}) {
  const { loggedInUser } = useAuth();

  const [availableRepos, setAvailableRepos] = useState<SimplifiedRepo[]>([]);

  useEffect(() => {
    if (!loggedInUser) return;

    api
      .get(`/user/${loggedInUser.id}/github/`)
      .then(res => {
        if (!res.content) {
          addToast({ title: 'No Repositories returned', color: 'danger' });

          return;
        }
        const data = JSON.parse(res.content) as SimplifiedRepo[];

        setAvailableRepos(data);
      })
      /* Fail Silently to be seamless for non-github linked accounts skipcq: JS-0321*/
      .catch(() => {});
  }, [loggedInUser]);

  return (
    <Accordion className='my-2' variant='shadow'>
      <AccordionItem
        key='1'
        aria-label='Open Github Drawer'
        startContent={
          <Chip color='secondary' variant='faded'>
            Preview
          </Chip>
        }
        title='Link to Github Repository'
      >
        <Select
          aria-label='Select github repository'
          label='Select Repository'
          variant='underlined'
          onSelectionChange={keys =>
            onRepoSelection(Array.from(keys)[0] as number)
          }
        >
          {availableRepos.map(repo => (
            <SelectItem key={repo.id} description={repo.description}>
              {repo.name}
            </SelectItem>
          ))}
        </Select>
        <p className='py-4'>
          To access more repositories{' '}
          <Link
            isExternal
            showAnchorIcon
            href='https://github.com/apps/tasktix;'
            underline='hover'
          >
            configure your Tasktix App Installation
          </Link>
        </p>
      </AccordionItem>
    </Accordion>
  );
}
