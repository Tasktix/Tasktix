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

import { generateId } from '@/lib/generateId';

import ListMember from './listMember';
import ListSection from './listSection';
import { NamedColor, namedColors } from './color';
import Tag from './tag';

export const ZodList = z.strictObject({
  id: z.string().length(16),
  name: z.string().min(1).max(64),
  color: z.enum(namedColors),
  hasTimeTracking: z.boolean(),
  hasDueDates: z.boolean(),
  isAutoOrdered: z.boolean(),
  repoId: z.int()
});

export default class List {
  id: string;
  name: string;
  color: NamedColor;
  hasTimeTracking: boolean;
  hasDueDates: boolean;
  isAutoOrdered: boolean;
  members: ListMember[];
  sections: ListSection[];
  tags: Tag[];
  repoId: number | null;

  constructor(
    name: string,
    color: NamedColor,
    members: ListMember[],
    sections: ListSection[],
    tags: Tag[],
    hasTimeTracking: boolean,
    hasDueDates: boolean,
    isAutoOrdered: boolean,
    repoId?: number,
    id?: string
  ) {
    if (!id) id = generateId();

    this.id = id;
    this.name = name;
    this.color = color;
    this.hasTimeTracking = hasTimeTracking;
    this.hasDueDates = hasDueDates;
    this.isAutoOrdered = isAutoOrdered;
    this.members = members;
    this.sections = sections;
    this.tags = tags;
    this.repoId = repoId ?? null;
  }
}
