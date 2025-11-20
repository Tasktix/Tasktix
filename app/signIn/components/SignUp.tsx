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

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addToast, Button, Input } from '@heroui/react';

import Message, { InputMessage } from '@/components/InputMessage';
import {
  validateUsername,
  validateEmail,
  validatePassword
} from '@/lib/validate';
import api from '@/lib/api';
import { setLoggedIn } from '@/app/body';

import {
  getUsernameMessage,
  getEmailMessage,
  getPasswordMessage
} from '../messages';

export default function SignUp() {
  interface InputMessages {
    username: InputMessage;
    email: InputMessage;
    password: InputMessage;
  }

  const defaultMessage: InputMessage = { message: '', color: 'default' };

  const [inputs, setInputs] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [inputMsgs, setInputMsgs] = useState<InputMessages>({
    email: defaultMessage,
    username: defaultMessage,
    password: defaultMessage
  });
  const router = useRouter();

  function handleUsernameInput(input: string) {
    setInputs({ ...inputs, username: input });
    setInputMsgs({ ...inputMsgs, username: getUsernameMessage(input) });
  }

  function handleEmailInput(input: string) {
    setInputs({ ...inputs, email: input });
    setInputMsgs({ ...inputMsgs, email: getEmailMessage(input) });
  }

  function handlePasswordInput(input: string) {
    setInputs({ ...inputs, password: input });
    setInputMsgs({ ...inputMsgs, password: getPasswordMessage(input) });
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (
      !validateUsername(inputs.username).valid ||
      !validateEmail(inputs.email) ||
      !validatePassword(inputs.password).valid
    ) {
      /* Ensure inputs that have never received input still get the appropriate error message */
      const messages = {
        username: getUsernameMessage(inputs.username),
        email: getEmailMessage(inputs.email),
        password: getPasswordMessage(inputs.password)
      };

      setInputMsgs(messages);

      return;
    }

    api
      .post('/user', inputs)
      .then(() => {
        api
          .post('/session', {
            username: inputs.username,
            password: inputs.password
          })
          .then(() => {
            setLoggedIn();
            router.replace('/list');
          })
          .catch(err => {
            addToast({ title: err.message, color: 'danger' });
          });
      })
      .catch(err => {
        addToast({ title: err.message, color: 'danger' });
      });
  }

  return (
    <form aria-label='Sign-Up Form' onSubmit={handleSubmit}>
      <Input
        color={inputMsgs.username.color}
        description={<Message data={inputMsgs.username} />}
        label='Username'
        type='text'
        value={inputs.username}
        variant='bordered'
        onValueChange={handleUsernameInput}
      />
      <Input
        color={inputMsgs.email.color}
        description={<Message data={inputMsgs.email} />}
        label='Email'
        type='email'
        value={inputs.email}
        variant='bordered'
        onValueChange={handleEmailInput}
      />
      <Input
        color={inputMsgs.password.color}
        description={<Message data={inputMsgs.password} />}
        label='Password'
        type='password'
        value={inputs.password}
        variant='bordered'
        onValueChange={handlePasswordInput}
      />
      <div className='flex justify-center mt-6'>
        <Button color='primary' type='submit'>
          Sign Up
        </Button>
      </div>
    </form>
  );
}
