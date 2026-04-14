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
import { HeroUIProvider } from '@heroui/react';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ConfirmedTextarea from '../ConfirmedTextarea';

test('Confirm button initially hidden', () => {
  const { getByTestId } = render(
    <HeroUIProvider disableRipple>
      <ConfirmedTextarea
        label='Input label'
        value='Some value'
        onValueChange={vi.fn()}
      />
    </HeroUIProvider>
  );

  expect(
    within(getByTestId('confirmed-textarea-Input label')).getByRole('button')
  ).toHaveClass('hidden');
});

test('Confirm button appears when the input is changed', async () => {
  const user = userEvent.setup();

  const { getByDisplayValue, getByTestId } = render(
    <HeroUIProvider disableRipple>
      <ConfirmedTextarea
        aria-label='Input label'
        value='Some value'
        onValueChange={vi.fn()}
      />
    </HeroUIProvider>
  );

  await user.clear(getByDisplayValue('Some value'));

  expect(
    within(getByTestId('confirmed-textarea-Input label')).getByRole('button')
  ).not.toHaveClass('hidden');
});

test('Confirm button appears when changed input is restored to original', async () => {
  const user = userEvent.setup();

  const { getByDisplayValue, getByTestId } = render(
    <HeroUIProvider disableRipple>
      <ConfirmedTextarea value='Some value' onValueChange={vi.fn()} />
    </HeroUIProvider>
  );

  const input = getByDisplayValue('Some value');

  await user.clear(input);
  await user.type(input, 'Some value');

  expect(
    within(getByTestId('confirmed-textarea-value')).getByRole('button')
  ).toHaveClass('hidden');
});

test('Input rejected when disabled', async () => {
  const user = userEvent.setup();

  const { getByDisplayValue, getByTestId } = render(
    <HeroUIProvider disableRipple>
      <ConfirmedTextarea
        disabled
        label='Input label'
        value='Some value'
        onValueChange={vi.fn()}
      />
    </HeroUIProvider>
  );

  const input = getByDisplayValue('Some value');

  await user.type(input, ' with more');

  expect(input).toBeDisabled();
  expect(input).toHaveTextContent('Some value');
  expect(
    within(getByTestId('confirmed-textarea-Input label')).getByRole('button')
  ).toHaveClass('hidden');
});

test('Callback triggered when confirm button pressed', async () => {
  const valueHandler = vi.fn();
  const user = userEvent.setup();

  const { getByDisplayValue, getByTestId } = render(
    <HeroUIProvider disableRipple>
      <ConfirmedTextarea
        label='Input label'
        value='Some value'
        onValueChange={valueHandler}
      />
    </HeroUIProvider>
  );

  await user.clear(getByDisplayValue('Some value'));
  await user.click(
    within(getByTestId('confirmed-textarea-Input label')).getByRole('button')
  );

  await waitFor(() => expect(valueHandler).toHaveBeenCalledExactlyOnceWith(''));
});
