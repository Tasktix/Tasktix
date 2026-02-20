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

import ListMember from '../listMember';
import User from '../user';

test('Defaults all permissions to not granted', () => {
  const listMember = new ListMember(
    new User(
      'userId',
      'testListMember',
      'test@example.com',
      true,
      new Date(),
      new Date(),
      {}
    )
  );

  expect(listMember.canAdd).toBe(false);
  expect(listMember.canRemove).toBe(false);
  expect(listMember.canComplete).toBe(false);
  expect(listMember.canAssign).toBe(false);
});

test('Assigns all properties correctly', () => {
  const user = new User(
    'userId',
    'testListMember',
    'test@example.com',
    true,
    new Date(),
    new Date(),
    {}
  );

  const listMember = new ListMember(user, true, false, true, true);

  expect(listMember.user).toBe(user);
  expect(listMember.canAdd).toBe(true);
  expect(listMember.canRemove).toBe(false);
  expect(listMember.canComplete).toBe(true);
  expect(listMember.canAssign).toBe(true);
});
