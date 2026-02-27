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

import { Button, Divider } from '@heroui/react';
import { Github } from 'react-bootstrap-icons';
import { startTransition } from 'react';

import { handleOauth } from '../oauth';
import { OAuthControllers } from '../oauth';

export default function OAuth({ setLoggedInUser, router }: OAuthControllers) {
  return (
    <div>
      <div className='flex items-center gap-4 py-2'>
        <Divider className='flex-1' />
        <p className='text-tiny text-default-500 shrink-0'>OR</p>
        <Divider className='flex-1' />
      </div>
      <div className='flex justify-center mt-6'>
        <Button
          aria-label='sign in with github'
          startContent={<Github />}
          variant='bordered'
          onPress={() =>
            startTransition(() =>
              handleOauth('github', { setLoggedInUser, router })
            )
          }
        >
          Continue with Github
        </Button>
      </div>
    </div>
  );
}
