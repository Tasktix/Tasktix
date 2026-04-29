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

import { createContext } from 'react';

import User from '@/lib/model/user';
import { AuthConfig } from '@/lib/auth';

interface AuthContextType {
  loggedInUser: User | false;
  setLoggedInUser: (_: User | false) => void;
  authConfig: AuthConfig;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  // Typescript compiler requires default value skipcq: JS-W1042
  undefined
);
