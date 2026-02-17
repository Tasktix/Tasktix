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

import { useState, useMemo, ReactNode } from "react";

import { OfflineContext } from "./offlineContext";

/**
 * Provides context as to whether a user is online/offline, generally should only be set by server
 * sent event connection handlers
 * 
 * @param children DOM tree that should be able to access state
 * @param clientOnlineAtStart Initial client connection state 
 */
export default function OfflineProvider({
  children,
  clientOnlineAtStart
}: {
  children: ReactNode;
  clientOnlineAtStart: boolean;
}) {
  const [ clientOnline, setClientOnline ] = useState( clientOnlineAtStart );

  return (
    <OfflineContext.Provider
      value = {useMemo(() => ({ clientOnline, setClientOnline }), [clientOnline])}
    >
      {children}
    </OfflineContext.Provider>
  )
}