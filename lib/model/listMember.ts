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

import z from 'zod';

import MemberRole from './memberRole';
import User from './user';

export const ZodListMember = z.strictObject({
  userId: z.string().length(16),
  listId: z.string().length(16),
  roleId: z.string().length(16)
});

export default class ListMember {
  user: User;
  role: MemberRole;

  constructor(user: User, role: MemberRole) {
    this.user = user;
    this.role = role;
  }
}
