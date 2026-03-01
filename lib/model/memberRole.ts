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

import { generateId } from '../generateId';

export const ZodMemberRole = z.strictObject({
  id: z.string().length(16),
  name: z.string().min(1).max(32),
  description: z.string().min(1).max(64),
  canAddItems: z.boolean(),
  canUpdateItems: z.boolean(),
  canManageItems: z.boolean(),
  canManageTags: z.boolean(),
  canManageAssignees: z.boolean(),
  canManageMembers: z.boolean(),
  canUpdateList: z.boolean(),
  canManageList: z.boolean()
});

/**
 * Admin role ID in database (has all permissions)
 */
export const ADMIN_ROLE_ID = 'yZW3BwhhtgSQ7zhb' as const;

export default class MemberRole {
  id: string;
  name: string;
  description: string;
  canAddItems: boolean;
  canUpdateItems: boolean;
  canManageItems: boolean;
  canManageTags: boolean;
  canManageAssignees: boolean;
  canManageMembers: boolean;
  canUpdateList: boolean;
  canManageList: boolean;

  constructor(
    name: string,
    description: string,
    canAddItems: boolean,
    canUpdateItems: boolean,
    canManageItems: boolean,
    canManageTags: boolean,
    canManageAssignees: boolean,
    canManageMembers: boolean,
    canUpdateList: boolean,
    canManageList: boolean,
    id?: string
  ) {
    if (!id) id = generateId();

    this.id = id;
    this.name = name;
    this.description = description;
    this.canAddItems = canAddItems;
    this.canManageItems = canManageItems;
    this.canUpdateItems = canUpdateItems;
    this.canManageTags = canManageTags;
    this.canManageAssignees = canManageAssignees;
    this.canManageMembers = canManageMembers;
    this.canUpdateList = canUpdateList;
    this.canManageList = canManageList;
  }
}
