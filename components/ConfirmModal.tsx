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

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@heroui/react';
import { ExclamationOctagonFill } from 'react-bootstrap-icons';

/**
 * Renders a warning modal asking the user to confirm that they wish to proceed. Intended
 * for use before performing a destructive action to safeguard against accidental use.
 * Responsibility for opening the modal lies with the caller. If the modal is not removed
 * from the component tree in the aftermath of `onConfirm`, responsibility for closing the
 * modal also lies with the caller.
 *
 * @example
 * function DangerousAction({ removeSelf }) {
 *   const { isOpen, onOpen, onOpenChange } = useDisclosure();
 *
 *   function doDangerousThing() {
 *     ...
 *     removeSelf(); // Otherwise `onOpenChange(false);`
 *   }
 *
 *   return (
 *     <>
 *       <Button onPress={onOpen}>Do dangerous thing</Button>
 *       <ConfirmModal
 *         title='Are you sure?'
 *         description='This could be bad'
 *         isOpen={isOpen}
 *         onConfirm={doDangerousThing}
 *         onOpenChange={onOpenChange}
 *       />
 *     </>
 *   );
 * }
 *
 * @param title The modal title to display (e.g. "Permanently delete tag?")
 * @param description Message to display below the title (e.g. "This will also remove this
 *    tag from all items that currently have it.")
 * @param isOpen The `isOpen` parameter from HeroUI's `useDisclosure`
 * @param onConfirm Callback to perform an action when the "confirm" button is pressed
 * @param onOpenChange The `onOpenChange` parameter from HeroUI's `useDisclosure`
 */
export default function ConfirmModal({
  title,
  description,
  isOpen,
  onConfirm,
  onOpenChange
}: {
  title: string;
  description: string;
  isOpen: boolean;
  onConfirm: () => unknown;
  onOpenChange: (isOpen: boolean) => unknown;
}) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {onClose => (
          <>
            <ModalHeader className='flex gap-2 items-center'>
              <ExclamationOctagonFill className='text-danger' />
              {title}
            </ModalHeader>
            <ModalBody className='text-sm text-gray-500'>
              {description}
            </ModalBody>
            <ModalFooter>
              <Button variant='light' onPress={onClose}>
                Cancel
              </Button>
              <Button color='danger' onPress={onConfirm}>
                Confirm
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
