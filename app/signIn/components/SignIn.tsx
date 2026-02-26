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

import { addToast, Button, Input, Divider } from '@heroui/react';
import { FormEvent, startTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Github } from 'react-bootstrap-icons';

import { useAuth } from '@/components/AuthProvider';
import { authClient } from '@/lib/auth-client';
import { handleOauth } from '../oauth';
import { SuccessContext } from 'better-auth/react';

import User from '@/lib/model/user';

export default function SignIn() {
  const { setLoggedInUser } = useAuth();
  const [inputs, setInputs] = useState({ username: '', password: '' });
  const router = useRouter();

  function handleUsernameInput(input: string) {
    setInputs({ ...inputs, username: input });
  }

  function handlePasswordInput(input: string) {
    setInputs({ ...inputs, password: input });
  }
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      await authClient.signIn.username(
        {
          username: inputs.username,
          password: inputs.password
        },
        {
          onError: ctx => {
            addToast({ title: ctx.error.message, color: 'danger' });
          },
          onSuccess: (ctx: SuccessContext<{ User: User }>) => {
            setLoggedInUser(ctx.data.User);
            router.push('/list');
          }
        }
      );
    });
  }

  return (
    <form aria-label='Sign-In Form' onSubmit={handleSubmit}>
      <Input
        label='Username'
        type='text'
        value={inputs.username}
        variant='bordered'
        onValueChange={handleUsernameInput}
      />
      <Input
        className='py-2'
        label='Password'
        type='password'
        value={inputs.password}
        variant='bordered'
        onValueChange={handlePasswordInput}
      />

      <div className='flex justify-center my-4'>
        <Button color='primary' type='submit'>
          Sign In
        </Button>
      </div>
      <div className="flex items-center gap-4 py-2">
          <Divider className="flex-1" />
          <p className="text-tiny text-default-500 shrink-0">OR</p>
          <Divider className="flex-1" />
        </div>
      <div className='flex justify-center mt-6'>
          <Button
            startContent={<Github/>}
            variant="bordered"
            aria-label='sign in with github'
            onPress={() => handleOauth('github', { setLoggedInUser, router })}
          >
            Continue with Github
          </Button>
      </div>

    </form>
  );
}
