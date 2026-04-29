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

import { Card, CardBody, Tabs, Tab, Alert, Divider } from '@heroui/react';

import { useAuth } from '@/components/AuthProvider';

import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import OAuth from './components/OAuth';
import { handleOAuth } from './oauth';

export default function Page() {
  const { setLoggedInUser, authConfig } = useAuth();

  if (
    !authConfig.localEnabled &&
    !authConfig.githubEnabled &&
    !authConfig.customEnabled
  ) {
    return (
      <main className='flex grow justify-center items-start mt-40 w-xl mx-auto'>
        <Alert
          color='danger'
          description='Please talk to your administrator about enabling local, GitHub, or OIDC authentication'
          title='No authentication providers configured'
          variant='flat'
        />
      </main>
    );
  }

  if (
    !authConfig.localEnabled &&
    authConfig.githubEnabled !== authConfig.customEnabled
  ) {
    /*
      Local auth disabled and only one 3rd-party auth provider configured, so redirect
      straight to it. Promises explicitly ignored because `handleOAuth` already creates a
      toast for errors
    */
    if (authConfig.githubEnabled)
      void handleOAuth('github', setLoggedInUser, authConfig); // skipcq: JS-0098
    if (authConfig.customEnabled)
      void handleOAuth('custom', setLoggedInUser, authConfig); // skipcq: JS-0098

    return (
      <main className='flex grow justify-center items-start mt-40 w-xl mx-auto'>
        <Alert
          color='success'
          title='Redirecting for SSO sign in...'
          variant='flat'
        />
      </main>
    );
  }

  return (
    <main className='flex grow justify-center items-start mt-40'>
      <Card className='w-96 py-2 px-4'>
        <CardBody>
          {authConfig.localEnabled && (
            <Tabs className='flex justify-center' variant='underlined'>
              <Tab key='signIn' className='text-xl' title='Sign In'>
                <SignIn />
              </Tab>
              <Tab key='signUp' className='text-xl' title='Sign Up'>
                <SignUp />
              </Tab>
            </Tabs>
          )}

          {authConfig.localEnabled &&
          (authConfig.githubEnabled || authConfig.customEnabled) ? (
            <div className='flex items-center gap-4 my-6'>
              <Divider className='flex-1' />
              <p className='text-tiny text-default-500 shrink-0'>OR</p>
              <Divider className='flex-1' />
            </div>
          ) : null}

          {(authConfig.githubEnabled || authConfig.customEnabled) && (
            <OAuth authConfig={authConfig} setLoggedInUser={setLoggedInUser} />
          )}
        </CardBody>
      </Card>
    </main>
  );
}
