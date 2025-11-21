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
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  ToastProvider
} from '@heroui/react';
import { useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import Image from 'next/image';

import { default as api } from '@/lib/api';
import ThemeSwitcher from '@/components/ThemeSwitcher';

export function setLoggedIn() {
  // The whole point is that this may be called before the fn is defined - skipcq: JS-0357
  if (!_setLoggedIn) throw new Error('Body component not yet mounted');

  // The whole point is that this may be called before the fn is defined - skipcq: JS-0357
  return _setLoggedIn();
}

export function setLoggedOut() {
  // The whole point is that this may be called before the fn is defined - skipcq: JS-0357
  if (!_setLoggedOut) throw new Error('Body component not yet mounted');

  // The whole point is that this may be called before the fn is defined - skipcq: JS-0357
  return _setLoggedOut();
}

let _setLoggedIn: () => void;
let _setLoggedOut: () => void;

interface BodyProps {
  children: ReactNode;
  isLoggedInAtStart: boolean;
}

export default function Body({
  children,
  isLoggedInAtStart
}: Readonly<BodyProps>) {
  const [isLoggedIn, setIsLoggedIn] = useState(isLoggedInAtStart);

  _setLoggedIn = () => setIsLoggedIn(true);
  _setLoggedOut = () => setIsLoggedIn(false);

  return (
    <div className='flex flex-col h-screen'>
      <Navbar maxWidth='full'>
        <NavbarBrand
          as={Link}
          className='flex flex-row justify-left items-center gap-2'
          href='/'
        >
          <Image
            priority
            alt='Tasktix'
            height={26}
            src='/logo.png'
            style={{ borderRadius: 0 }}
            width={100}
          />
        </NavbarBrand>
        <NavbarContent className='justify-center'>
          <NavbarItem>{/* Expandable filler */}</NavbarItem>
        </NavbarContent>
        <NavbarContent justify='end'>
          <ThemeSwitcher />
          <AccountButton isLoggedIn={isLoggedIn} />
        </NavbarContent>
      </Navbar>

      {children}

      <ToastProvider />
    </div>
  );
}

function AccountButton({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();

  function handleClick() {
    api
      .delete('/session')
      .catch(_ => {})
      .finally(() => {
        setLoggedOut();
        router.replace('/');
      });
  }

  if (!isLoggedIn)
    return (
      <Button
        key='signIn'
        as={Link}
        color='primary'
        href='/signIn'
        variant='flat'
      >
        Sign In
      </Button>
    );

  return (
    <Button key='signOut' color='primary' variant='flat' onPress={handleClick}>
      Sign Out
    </Button>
  );
}
