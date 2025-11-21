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

import { getUser } from '@/lib/session';
import { useState } from 'react';
import { default as api } from '@/lib/api';
import { addSnackbar } from '@/components/Snackbar';
import User from '@/lib/model/user';
import ConfirmedTextInput from '@/components/ConfirmedTextInput'

export default function SetUserProps({ user }: { user: string} ){
  const userDetails: User = JSON.parse(user) || [];
  const [_user, _setUser] = useState(userDetails);

  async function setUsername(username: string) {

    api
      .patch(`/user/${_user.id}`, { username })
      .then(() => {
        const newUserData = structuredClone(_user);

        newUserData.username = username;
        _setUser(newUserData);
      })
      .catch(err => addSnackbar(err.message, 'error'));
  }

  async function setEmail(email: string) {
    const userDetails = await getUser();
    const [_user, _setUser] = useState(userDetails);

    api
      .patch(`/user/${_user.id}`, { email })
      .then(() => {
        const newUserData = structuredClone(_user);

        newUserData.email = email;
        _setUser(newUserData);
      })
      .catch(err => addSnackbar(err.message, 'error'));
  }

  //Email still not working for some reason
  return(
    <div>
      <ConfirmedTextInput 
        name={_user.username}
        updateName={setUsername}
      />
      {/* <ConfirmedTextInput 
        name={_user.email}
        updateName={setEmail}
      /> */}
    </div>
  )

}