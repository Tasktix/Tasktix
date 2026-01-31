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

import { getUser } from '@/lib/session';

import UserProperties from './components/UserProperties';

/**
 * Gets current user information and sends it to UserProperties
 *
 */
export default async function Page() {
  const userDetails = await getUser();

  return (
    <main className='flex p-6 justify-center flex-grow'>
      <div className='border-2 border-content3 bg-content1 shadow-lg shadow-content2 w-130 m-4 rounded-lg px-4 h-full'>
        <h1 className='text-2xl p-4'>Profile</h1>
        <UserProperties user={JSON.stringify(userDetails)} />
      </div>
    </main>
  );
}
