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
  addToast,
  Button,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  ToastProvider,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar
} from '@heroui/react';
import { useRouter } from 'next/navigation';
import { ReactNode, startTransition } from 'react';
import Image from 'next/image';

import ThemeSwitcher from '@/components/ThemeSwitcher';
import { useAuth } from '@/components/AuthProvider';
import { getBackgroundColor } from '@/lib/color';
import { authClient } from '@/lib/auth-client';

export default function Body({ children }: Readonly<{ children?: ReactNode }>) {
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
          <AccountButton />
        </NavbarContent>
      </Navbar>

      {children}

      <ToastProvider />

      <footer className='text-center text-default-600'>
        Tasktix is licensed under the GNU AGPL v3. To view Tasktix&apos;s source
        code, visit{' '}
        <Link
          isExternal
          showAnchorIcon
          href='https://github.com/Tasktix/Tasktix'
          underline='hover'
        >
          the GitHub repository
        </Link>
        .
        <br />
        Please also feel free to{' '}
        <Link
          isExternal
          showAnchorIcon
          href='https://github.com/Tasktix/Tasktix/issues/new'
          underline='hover'
        >
          submit an issue
        </Link>{' '}
        to let us know about bugs or request new features!
      </footer>
    </div>
  );
}

function AccountButton() {
  const { loggedInUser, setLoggedInUser } = useAuth();

  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () =>{
            setLoggedInUser(false);
            router.push("/");
          },
          onError: (ctx) => {
            addToast({ title: ctx.error.message, color: 'danger' });
          }
        }
      });
    }
  )};

  if (!loggedInUser)
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
    <Dropdown aria-label='Profile Dropdown'>
      <DropdownTrigger>
        <Avatar
          key='profile'
          isIconOnly
          aria-label='Profile Actions Dropdown'
          as={Button}
          className={getBackgroundColor(loggedInUser.color)}
          name={loggedInUser.username ?? ''}
        />
      </DropdownTrigger>
      <DropdownMenu aria-label='User Actions'>
        <DropdownItem key='settings' href='/profile'>
          Profile
        </DropdownItem>
        <DropdownItem key='signOut' onPress={handleClick}>
          Log Out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
