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
  Input,
  Form
} from '@nextui-org/react';

import { useEffect, useState } from 'react';
import { Check } from 'react-bootstrap-icons';
import User from '@/lib/model/user';

export function EditFields({
  name,
  value,
  type,
  propType,
  updateValue
}: {
  name: string;
  value: string;
  type: string;
  propType: string;
  updateValue: (value: Partial<User>) => unknown;
}) {
  const [newValue, setNewValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  

  useEffect(() => setPrevValue(value), [value]);

  return (
    <form
      className='flex grow shrink w-full'
      onSubmit={e => {
        e.preventDefault();
        updateValue({propType: value});
      }}
    >
      <Input label={name} type={type} defaultValue={value} onValueChange={setNewValue} isClearable/>
      <Button
        isIconOnly
        color='primary'
        type='submit'
      >
        <Check />
      </Button>
    </form>
    // <Form className='text-base'>
    //   {/* <Input label={name} type='text' defaultValue='test' isClearable/> */}
    //   <Input label={name} type={type} defaultValue={value} isClearable/>
    //   {/* <Button color='primary' type='submit'>
    //     Submit
    //   </Button> */}

    //   {/* <Button isIconOnly color='primary' variant='flat'>
    //     <PencilFill aria-label='Edit' size={20} />
    //   </Button> */}

    // </Form>
  );
}