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
 *
 * @vitest-environment jsdom
 */

import '@testing-library/jest-dom';

import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useDisclosure } from '@heroui/react';
import { useEffect } from 'react';

import ConfirmModal from '../ConfirmModal';

describe('ConfirmModal', () => {
  test('Renders modal asking for confirmation with details and confirm/cancel buttons', async () => {
    /**
     * Passing `isOpen={true}` is insufficient for opening the modal, hence the test
     * component with `useDisclosure`
     */
    function TestComponent() {
      const { isOpen, onOpen, onOpenChange } = useDisclosure();

      useEffect(onOpen);

      return (
        <ConfirmModal
          description='Some extra details'
          isOpen={isOpen}
          title='Are you sure?'
          onConfirm={vi.fn()}
          onOpenChange={onOpenChange}
        />
      );
    }

    const { getByRole, getByText } = render(<TestComponent />);

    await waitFor(() => expect(getByText('Are you sure?')).toBeVisible());
    expect(getByText('Some extra details')).toBeVisible();
    expect(getByRole('button', { name: 'Confirm' })).toBeVisible();
    expect(getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('Pressing the cancel button triggers the modal to close', async () => {
    const user = userEvent.setup();
    const onOpenChangeMock = vi.fn();

    const { getByRole } = render(
      <ConfirmModal
        isOpen
        description='Some extra details'
        title='Are you sure?'
        onConfirm={vi.fn()}
        onOpenChange={onOpenChangeMock}
      />
    );

    await user.click(getByRole('button', { name: 'Cancel' }));

    expect(onOpenChangeMock).toHaveBeenCalledExactlyOnceWith(false);
  });

  test('Pressing the confirm button triggers the onConfirm handler', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onOpenChangeMock = vi.fn();

    const { getByRole } = render(
      <ConfirmModal
        isOpen
        description='Some extra details'
        title='Are you sure?'
        onConfirm={onConfirm}
        onOpenChange={onOpenChangeMock}
      />
    );

    await user.click(getByRole('button', { name: 'Confirm' }));

    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
