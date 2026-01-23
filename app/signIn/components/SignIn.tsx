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

import { addToast, Button, Input } from '@heroui/react';
import { FormEvent, startTransition, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/components/AuthProvider';
import { authClient } from '@/lib/auth-client';

export default function SignIn() {
  const { setIsLoggedIn } = useAuth();
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
      // TODO: Update to use username
      const {data, error} = await authClient.signIn.email({
        email: inputs.username,
        password: inputs.password, 
      }, {
        onError: (ctx) => {
          addToast({ title: ctx.error.message, color: 'danger' });
        },
        onSuccess: () => {
          setIsLoggedIn(true);
          router.push("/list");
        }
      })
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
      <div className='flex justify-center mt-6'>
        <Button color='primary' type='submit'>
          Sign In
        </Button>
      </div>
    </form>
  );
}
