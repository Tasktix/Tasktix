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
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { default as api } from '@/lib/api';
import { setLoggedIn } from '@/app/body';

export default function SignIn() {
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
    api
      .post('/session', inputs)
      .then(() => {
        setLoggedIn();
        router.replace('/list');
      })
      .catch(err =>
        addToast({
          title: err.message,
          color: 'danger'
        })
      );
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
