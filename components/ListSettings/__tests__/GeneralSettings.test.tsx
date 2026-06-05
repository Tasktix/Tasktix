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

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import GeneralSettings from '../GeneralSettings';

//Mock router
vi.mock(import('next/navigation'), async importOriginal => ({
  ...(await importOriginal()),
  useRouter: vi.fn()
}));

it('Calls onKanbanToggle when clicked', async () => {
  const user = userEvent.setup();
  const onKanbanToggle = vi.fn();

  const { getByLabelText } = render(
    <GeneralSettings
      hasDueDates={false}
      hasTimeTracking={false}
      isAutoOrdered={false}
      isKanban={false}
      listColor={'Pink'}
      listId={'listid'}
      listName={'listname'}
      onKanbanToggle={onKanbanToggle}
      onListNameChange={vi.fn()}
    />
  );

  const routerMock = {
    push: vi.fn()
  } as unknown as AppRouterInstance;

  vi.mocked(useRouter).mockReturnValue(routerMock);

  expect(getByLabelText('View in kanban mode')).toBeVisible();
  await user.click(getByLabelText('View in kanban mode'));
  expect(onKanbanToggle).toHaveBeenCalledExactlyOnceWith(true);
});
