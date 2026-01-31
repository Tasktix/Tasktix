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

'use client';

import { useState, ReactNode, useMemo } from 'react';

import User from '@/lib/model/user';

import { AuthContext } from './authContext';

/**
 * Provides React Context about whether a user is currently logged in; intended for use
 * in the top-level Next.js layout file.
 *
 * @param children The React tree that should be able to use the auth context
 * @param loggedInUserAtStart The logged in user, if any, on first render
 */
export default function AuthProvider({
  children,
  loggedInUserAtStart
}: {
  children: ReactNode;
  loggedInUserAtStart: User | false;
}) {
  const [loggedInUser, setLoggedInUser] = useState(loggedInUserAtStart);

  return (
    <AuthContext.Provider
      value={useMemo(() => ({ loggedInUser, setLoggedInUser }), [loggedInUser])}
    >
      {children}
    </AuthContext.Provider>
  );
}
