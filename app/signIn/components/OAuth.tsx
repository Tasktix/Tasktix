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

import { Button } from '@heroui/react';
import { Github, ShieldLockFill } from 'react-bootstrap-icons';
import { startTransition } from 'react';

import { AuthConfig } from '@/lib/auth';
import User from '@/lib/model/user';

import { handleOAuth } from '../oauth';
/**
 * OAuth component that provides GitHub authentication options for user sign-in.
 *
 * Displays a divider section with an "OR" label followed by a GitHub sign-in button.
 * Uses React's `startTransition` to handle the OAuth flow without blocking the UI.
 *
 * @component
 * @param props - The OAuth controller props
 * @param props.setLoggedInUser - Callback function to set the logged-in user state
 * @param props.authConfig - Supported Oauth Providers configuration
 *
 * @example
 * <OAuth setLoggedInUser={setUser} router={router} />
 */
export default function OAuth({
  setLoggedInUser,
  authConfig
}: Readonly<{
  setLoggedInUser: (user: User) => void;
  authConfig: AuthConfig;
}>) {
  return (
    <div className='flex flex-col items-center gap-4'>
      {authConfig.githubEnabled && (
        <Button
          aria-label='sign in with github'
          startContent={<Github />}
          variant='bordered'
          onPress={() =>
            startTransition(() =>
              handleOAuth('github', setLoggedInUser, authConfig)
            )
          }
        >
          Continue with Github
        </Button>
      )}
      {authConfig.customEnabled && (
        <Button
          aria-label={`sign in with ${authConfig.customProviderId}`}
          startContent={<ShieldLockFill />}
          variant='bordered'
          onPress={() =>
            startTransition(() =>
              handleOAuth('custom', setLoggedInUser, authConfig)
            )
          }
        >
          Continue with {authConfig.customProviderId}
        </Button>
      )}
    </div>
  );
}
