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
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeroUIProvider } from '@heroui/react';

import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  it('calls change handler when typing into the input', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <HeroUIProvider disableRipple>
        <SearchBar
          inputOptions={[
            {
              label: 'General',
              options: [{ type: 'String', label: 'Title' }]
            }
          ]}
          onValueChange={onValueChange}
        />
      </HeroUIProvider>
    );

    await user.type(screen.getByPlaceholderText('Filter...'), 'Title:');

    await waitFor(() => expect(onValueChange).toHaveBeenCalled());
  });
});
