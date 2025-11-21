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

import { InputMessage } from '@/components/InputMessage';
import {
  validateUsername,
  validateEmail,
  validatePassword
} from '@/lib/validate';

export function getUsernameMessage(input: string): InputMessage {
  if (input) return validateUsername(input);
  else
    return {
      message: 'Username is required',
      color: 'danger'
    };
}

export function getEmailMessage(input: string): InputMessage {
  if (input)
    if (validateEmail(input))
      return {
        message: '',
        color: 'success'
      };
    else
      return {
        message: 'Please enter a valid email',
        color: 'danger'
      };
  else
    return {
      message: 'Email address is required',
      color: 'danger'
    };
}

export function getPasswordMessage(input: string): InputMessage {
  if (input) {
    const passwordResult = validatePassword(input);

    return {
      message: `Password is ${passwordResult.message}`,
      color: passwordResult.color
    };
  } else
    return {
      message: 'Password is required',
      color: 'danger'
    };
}
