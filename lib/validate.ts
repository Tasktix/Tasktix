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

import { regexes as zodRegexes } from 'zod';

interface InputResult {
  valid: boolean;
  color: 'success' | 'warning' | 'danger' | 'default';
  message: string;
}

export function validateUsername(username: string): InputResult {
  const usernameRegex = /^[a-zA-Z0-9_]*$/;

  if (!usernameRegex.test(username))
    return {
      valid: false,
      color: 'danger',
      message: 'Username can only have letters, numbers, and underscores'
    };
  else if (username.length < 3)
    return {
      valid: false,
      color: 'danger',
      message: 'Username must be at least 3 characters'
    };
  else if (username.length > 32)
    return {
      valid: false,
      color: 'danger',
      message: 'Username cannot be more than 32 characters'
    };
  else return { valid: true, color: 'success', message: '' };
}

export function validateEmail(email: string): boolean {
  /* Credit: bortzeyer, https://stackoverflow.com/a/201378 */

  return zodRegexes.email.test(email) && email.length <= 128;
}

export function validatePassword(password: string): InputResult {
  if (password.length > 128)
    return { valid: false, color: 'danger', message: 'too long' };
  else if (password.length >= 16)
    return { valid: true, color: 'success', message: 'strong' };
  else if (password.length >= 10)
    return { valid: true, color: 'warning', message: 'acceptable' };
  else return { valid: false, color: 'danger', message: 'weak' };
}

export function validateListName(name: string): [boolean, string] {
  return [name.length <= 64, name.substring(0, 64)];
}
