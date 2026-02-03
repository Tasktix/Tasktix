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
 * @vitest-environment jsdom
 */

import { render, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { HeroUIProvider } from '@heroui/react';

import api from '@/lib/api';

import UserProperties from './UserProperties';

vi.mock('@/lib/api');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('UserProperties functions', () => {
  const oldUser = {
    id: 1234,
    username: 'oldUsername',
    email: 'oldEmail@gmail.com'
  };

  test('Validate setUsername', async () => {
    vi.mocked(api.patch).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });

    const newName = 'newUsername';

    const user = userEvent.setup();
    const { getByLabelText, getByTestId } = render(
      <HeroUIProvider disableRipple>
        <UserProperties user={JSON.stringify(oldUser)} />
      </HeroUIProvider>
    );

    const usernameInput = getByLabelText('Username');

    expect(usernameInput).toHaveValue('oldUsername');

    await user.clear(usernameInput);
    await user.type(usernameInput, newName);
    await user.click(
      within(getByTestId('confirmed-input-Username')).getByRole('button')
    );

    expect(api.patch).toHaveBeenCalledTimes(1);
    expect(api.patch).toHaveBeenCalledWith(`/user/${oldUser.id}`, {
      username: 'newUsername'
    });
  });

  test('Validate setEmail', async () => {
    vi.mocked(api.patch).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });

    const newEmail = 'newEmail@gmail.com';

    const user = userEvent.setup();
    const { getByLabelText, getByTestId } = render(
      <HeroUIProvider disableRipple>
        <UserProperties user={JSON.stringify(oldUser)} />
      </HeroUIProvider>
    );

    const emailInput = getByLabelText('Email');

    expect(emailInput).toHaveValue('oldEmail@gmail.com');

    await user.clear(emailInput);
    await user.type(emailInput, newEmail);
    await user.click(
      within(getByTestId('confirmed-input-Email')).getByRole('button')
    );

    expect(api.patch).toHaveBeenCalledTimes(1);
    expect(api.patch).toHaveBeenCalledWith(`/user/${oldUser.id}`, {
      email: 'newEmail@gmail.com'
    });
  });
});
