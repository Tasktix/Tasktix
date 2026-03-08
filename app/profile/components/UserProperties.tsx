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

//TODO: Currently, when a user changes their information, then exits and reenters their
//profile page, the information will not be updated. However, the information is updated
//in the database, and will be updated if the user logs out and back in.

'use client';

import { addToast } from '@heroui/react';

import api from '@/lib/api';
import User from '@/lib/model/user';
import ConfirmedTextInput from '@/components/ConfirmedTextInput';
import ColorPicker from '@/components/ColorPicker';
import { NamedColor } from '@/lib/model/color';
import { addToastForError } from '@/lib/error';

/**
 * Handles client-side functions for the profile page
 *
 * @param user A JSON string that contains the current user data
 */
export default function UserProperties({ user }: { user: string }) {
  const userDetails = JSON.parse(user) as User;

  /**
   * Sets the user's username
   *
   * @param username The user's new username
   */
  function setUsername(username: string) {
    api
      .patch(`/user/${userDetails.id}`, { username })
      .then(() => {
        const newUserData = structuredClone(userDetails);

        newUserData.username = username;
        location.reload();
      })
      .catch(addToastForError);
  }

  /**
   * Sets the user's email
   *
   * @param email The user's new email
   */
  function setEmail(email: string) {
    api
      .patch(`/user/${userDetails.id}`, { email })
      .then(() => {
        const newUserData = structuredClone(userDetails);

        newUserData.email = email;
        location.reload();
      })
      .catch(addToastForError);
  }

  /**
   * Sets the user's color. If null, return error.
   *
   * @param color the user's color
   */
  function setColor(color: NamedColor | null) {
    if (!color) {
      addToast({
        title: 'Please specify a user color',
        color: 'danger'
      });
    } else {
      api
        .patch(`/user/${userDetails.id}`, { color })
        .then(() => {
          const newUserData = structuredClone(userDetails);

          newUserData.color = color;
          location.reload();
        })
        .catch(addToastForError);
    }
  }

  return (
    <div>
      <div className='m-4 flex items-end'>
        <ConfirmedTextInput
          label='Username'
          labelPlacement='outside'
          updateValue={setUsername}
          value={userDetails.username as string}
          variant='flat'
        />

        <span data-testid='colorPicker'>
          <ColorPicker
            className={'w-10 h-10 mx-3'}
            label='Profile Color'
            value={userDetails.color}
            onValueChange={setColor}
          />
        </span>
      </div>

      <div className='m-4'>
        <ConfirmedTextInput
          label='Email'
          labelPlacement='outside'
          updateValue={setEmail}
          value={userDetails.email}
          variant='flat'
        />
      </div>
    </div>
  );
}
