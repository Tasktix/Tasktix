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
import { HeroUIProvider, addToast } from '@heroui/react';

import api from '@/lib/api';

import UserProperties from './UserProperties';

vi.mock('@/lib/api');

jest.mock('framer-motion', () => ({
  ...jest.requireActual('framer-motion'),
  LazyMotion: ({ children }: { children: React.ReactNode }) => children
}));

jest.mock('@heroui/react', () => ({
  ...jest.requireActual('@heroui/react'),
  addToast: jest.fn()
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('UserProperties functions', () => {
  const oldUser = {
    id: 1234,
    username: 'oldUsername',
    email: 'oldEmail@gmail.com',
    color: 'Pink'
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

  test('Validate setColor updates user color', async () => {
    (api.patch as jest.Mock).mockImplementation(() => Promise.resolve());
    const user = userEvent.setup();

    const { getByLabelText, getByTestId } = render(
      <HeroUIProvider disableRipple reducedMotion='always'>
        <UserProperties user={JSON.stringify(oldUser)} />
      </HeroUIProvider>
    );

    const colorInput = within(getByTestId('colorPicker')).getByRole('button');

    expect(colorInput).toHaveClass('bg-pink-500');

    await user.click(colorInput);
    await user.click(getByLabelText('Red'));

    expect(api.patch as jest.Mock).toHaveBeenCalledTimes(1);
    expect(api.patch as jest.Mock).toHaveBeenCalledWith(`/user/${oldUser.id}`, {
      color: 'Red'
    });
  });

  test('Give error when color is null', async () => {
    const user = userEvent.setup();

    const { getByLabelText, getByTestId } = render(
      <HeroUIProvider disableRipple reducedMotion='always'>
        <UserProperties user={JSON.stringify(oldUser)} />
      </HeroUIProvider>
    );

    const colorInput = within(getByTestId('colorPicker')).getByRole('button');

    await user.click(colorInput);
    await user.click(getByLabelText('clear'));

    expect(addToast as jest.Mock).toHaveBeenCalledTimes(1);
    expect(addToast as jest.Mock).toHaveBeenCalledWith({
      title: 'Please specify a user color',
      color: 'danger'
    });
  });
});

describe('UserProperties errors', () => {
  const oldUser = {
    id: 1234,
    username: 'oldUsername',
    email: 'oldEmail@gmail.com',
    color: 'Pink'
  };

  test('setUsername error message', async () => {
    (api.patch as jest.Mock).mockRejectedValue(
      new Error('Server message about failure')
    );

    const newName = 'newUsername';

    const user = userEvent.setup();
    const { getByLabelText, getByTestId } = render(
      <HeroUIProvider disableRipple>
        <UserProperties user={JSON.stringify(oldUser)} />
      </HeroUIProvider>
    );

    const usernameInput = getByLabelText('Username');

    await user.clear(usernameInput);
    await user.type(usernameInput, newName);
    await user.click(
      within(getByTestId('confirmed-input-Username')).getByRole('button')
    );

    expect(addToast as jest.Mock).toHaveBeenCalledTimes(1);
    expect(addToast as jest.Mock).toHaveBeenCalledWith({
      title: 'Server message about failure',
      color: 'danger'
    });
  });

  test('setEmail error message', async () => {
    (api.patch as jest.Mock).mockRejectedValue(
      new Error('Server message about failure')
    );

    const newEmail = 'newEmail@gmail.com';

    const user = userEvent.setup();
    const { getByLabelText, getByTestId } = render(
      <HeroUIProvider disableRipple>
        <UserProperties user={JSON.stringify(oldUser)} />
      </HeroUIProvider>
    );

    const emailInput = getByLabelText('Email');

    await user.clear(emailInput);
    await user.type(emailInput, newEmail);
    await user.click(
      within(getByTestId('confirmed-input-Email')).getByRole('button')
    );

    expect(addToast as jest.Mock).toHaveBeenCalledTimes(1);
    expect(addToast as jest.Mock).toHaveBeenCalledWith({
      title: 'Server message about failure',
      color: 'danger'
    });
  });

  test('setColor error message', async () => {
    (api.patch as jest.Mock).mockRejectedValue(
      new Error('Server message about failure')
    );
    const user = userEvent.setup();

    const { getByLabelText, getByTestId } = render(
      <HeroUIProvider disableRipple reducedMotion='always'>
        <UserProperties user={JSON.stringify(oldUser)} />
      </HeroUIProvider>
    );

    const colorInput = within(getByTestId('colorPicker')).getByRole('button');

    expect(colorInput).toHaveClass('bg-pink-500');

    await user.click(colorInput);
    await user.click(getByLabelText('Red'));

    expect(addToast as jest.Mock).toHaveBeenCalledTimes(1);
    expect(addToast as jest.Mock).toHaveBeenCalledWith({
      title: 'Server message about failure',
      color: 'danger'
    });
  });
});
