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

import React from 'react';
import { Card, CardBody, Tabs, Tab } from '@heroui/react';

import SignUp from './components/SignUp';
import SignIn from './components/SignIn';

export default function Page() {
  return (
    <main className='flex justify-center items-start mt-40'>
      <Card className='w-96 py-2 px-4'>
        <CardBody>
          <Tabs className='flex justify-center' variant='underlined'>
            <Tab key='signIn' className='text-xl' title='Sign In'>
              <SignIn />
            </Tab>
            <Tab key='signUp' className='text-xl' title='Sign Up'>
              <SignUp />
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </main>
  );
}
