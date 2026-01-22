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

import { NamedColor, namedColors } from './color';

export const ZodUser = z.strictObject({
  id: z.string().length(191),
  name: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_]*$/),
  email: z.email().max(128),
  legacyPassword: z.string().min(10).max(128),
  color: z.enum(namedColors)
});

export default class User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean ;
  legacyPassword: string | null;
  image: string | null;
  color: NamedColor;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    name: string,
    email: string,
    emailVerfied: boolean,
    legacyPassword: string,
    image: string,
    createdAt: Date,
    updatedAt: Date,
    color?: NamedColor 
  ) {

    if (!color) color = randomNamedColor();

    this.id = id;
    this.name = name;
    this.email = email;
    this.emailVerified = emailVerfied;
    this.legacyPassword = legacyPassword;
    this.image = image;
    this.color = color;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
