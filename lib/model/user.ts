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

import { randomNamedColor } from '../color';
import { generateId } from '../generateId';

import { NamedColor, namedColors } from './color';

export const ZodUser = z.strictObject({
  id: z.string().length(16),
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_]*$/),
  email: z.email().max(128),
  password: z.string().min(10).max(128),
  color: z.enum(namedColors)
});

export default class User {
  id: string;
  username: string;
  email: string;
  password: string;
  color: NamedColor;
  dateCreated: Date;
  dateSignedIn: Date;

  constructor(
    username: string,
    email: string,
    password: string,
    dateCreated: Date,
    dateSignedIn: Date,
    { id, color }: { id?: string; color?: NamedColor }
  ) {
    if (!id) id = generateId();

    if (!color) color = randomNamedColor();

    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.color = color;
    this.dateCreated = dateCreated;
    this.dateSignedIn = dateSignedIn;
  }
}
