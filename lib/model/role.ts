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

export const ZodRole = z.strictObject({
  id: z.string().length(16),
  name: z.string().min(1).max(32),
  description: z.string().min(1).max(64),
  canAddItems: z.boolean(),
  canCompleteItems: z.boolean(),
  canUpdateItems: z.boolean(),
  canAssignItems: z.boolean(),
  canDeleteItems: z.boolean(),
  canManageMembers: z.boolean(),
  canManageList: z.boolean(),
  canDeleteList: z.boolean()
});

export default class Role {
  id: string;
  name: string;
  description: string;
  canAddItems: boolean;
  canCompleteItems: boolean;
  canUpdateItems: boolean;
  canAssignItems: boolean;
  canDeleteItems: boolean;
  canManageMembers: boolean;
  canManageList: boolean;
  canDeleteList: boolean;

  constructor(
    name: string,
    description: string,
    canAddItems: boolean,
    canCompleteItems: boolean,
    canUpdateItems: boolean,
    canAssignItems: boolean,
    canDeleteItems: boolean,
    canManageMembers: boolean,
    canManageList: boolean,
    canDeleteList: boolean,
    id?: string
  ) {
    if (!id) id = generateId();

    this.id = id;
    this.name = name;
    this.description = description;
    this.canAddItems = canAddItems;
    this.canCompleteItems = canCompleteItems;
    this.canUpdateItems = canUpdateItems;
    this.canAssignItems = canAssignItems;
    this.canDeleteItems = canDeleteItems;
    this.canManageMembers = canManageMembers;
    this.canManageList = canManageList;
    this.canDeleteList = canDeleteList;
  }
}
