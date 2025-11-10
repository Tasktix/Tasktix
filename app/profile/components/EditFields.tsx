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

import {
  Button,
  Input
} from '@nextui-org/react';

import { PencilFill } from 'react-bootstrap-icons';
import { getUser } from '@/lib/session';

export function EditFields({
  name
}: {
  name: string;
}) {
  //const userDetails = getUser();

  return (
    <span className='text-base'>
      <Input label={name} type='text' defaultValue='test' isClearable/>
      {/* <Input label={name} type='text' defaultValue={userDetails.username} isClearable/> */}
      {/* <Button isIconOnly color='primary' variant='flat'>
        <PencilFill aria-label='Edit' size={20} />
      </Button> */}

    </span>
  );
}