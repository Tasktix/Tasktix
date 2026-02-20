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

import Assignee from '../assignee';
import User from '../user';

test('Assigns all properties correctly', () => {
  const user = new User(
    'abcdefg',
    'username',
    'email@example.com',
    false,
    new Date(),
    new Date(),
    'Amber'
  );

  const listMember = new Assignee(user, 'role-name');

  expect(listMember.user).toBe(user);
  expect(listMember.role).toBe('role-name');
});
