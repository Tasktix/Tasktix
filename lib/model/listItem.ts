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

import { DATABASE_LIMITS } from '@/lib/database/constants';
import { generateId } from '@/lib/generateId';

import Assignee from './assignee';
import Tag from './tag';

const statuses = ['Unstarted', 'In_Progress', 'Paused', 'Completed'] as const;
const priorities = ['Low', 'Medium', 'High'] as const;

export type Status = (typeof statuses)[number];
export type Priority = 'Low' | 'Medium' | 'High';

export const ZodListItem = z.strictObject({
  id: z.string().length(16),
  name: z.string().min(1).max(128),
  status: z.enum(statuses),
  priority: z.enum(priorities),
  isUnclear: z.boolean(),
  expectedMs: z.number().min(0).max(DATABASE_LIMITS.INT_MAX).nullable(),
  elapsedMs: z.number().min(0).max(DATABASE_LIMITS.INT_MAX),
  sectionIndex: z.number().min(0).max(DATABASE_LIMITS.INT_MAX),
  dateDue: z.iso.datetime({ offset: true }).nullable(),
  dateStarted: z.iso.datetime({ offset: true }).nullable(),
  dateCompleted: z.iso.datetime({ offset: true }).nullable(),
  sectionId: z.string().length(16)
});

export default class ListItem {
  id: string;
  name: string;
  status: Status;
  priority: Priority;
  isUnclear: boolean;
  expectedMs: number | null;
  elapsedMs: number;
  sectionIndex: number;
  dateCreated: Date;
  dateDue: Date | null;
  dateStarted: Date | null;
  dateCompleted: Date | null;
  assignees: Assignee[];
  tags: Tag[];
  listId?: string;

  constructor(
    name: string,
    {
      id,
      status = 'Unstarted',
      priority = 'Low',
      isUnclear = false,
      expectedMs = null,
      elapsedMs = 0,
      sectionIndex = 0,
      dateCreated = new Date(),
      dateDue = new Date(),
      dateStarted = null,
      dateCompleted = null,
      assignees = [],
      tags = [],
      listId
    }: {
      id?: string;
      status?: Status;
      priority?: Priority;
      isUnclear?: boolean;
      expectedMs?: number | null;
      elapsedMs?: number;
      sectionIndex?: number;
      dateCreated?: Date;
      dateDue?: Date | null;
      dateStarted?: Date | null;
      dateCompleted?: Date | null;
      assignees?: Assignee[];
      tags?: Tag[];
      listId?: string;
      sectionId?: string;
    }
  ) {
    if (!id) id = generateId();

    this.id = id;
    this.name = name;
    this.status = status;
    this.priority = priority;
    this.isUnclear = Boolean(isUnclear);
    this.expectedMs = expectedMs;
    this.elapsedMs = elapsedMs;
    this.sectionIndex = sectionIndex;
    this.dateCreated = dateCreated;
    this.dateDue = dateDue;
    this.dateStarted = dateStarted;
    this.dateCompleted = dateCompleted;
    this.assignees = assignees;
    this.tags = tags;
    this.listId = listId;
  }
}
