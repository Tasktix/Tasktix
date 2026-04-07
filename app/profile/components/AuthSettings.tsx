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
  Card,
  CardBody,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Form,
  useDisclosure,
  addToast,
  Alert
} from '@heroui/react';
import { FormEvent, startTransition, useEffect, useState } from 'react';
import { Github, TrashFill } from 'react-bootstrap-icons';
import { useRouter, useSearchParams } from 'next/navigation';

import { addToastForError } from '@/lib/error';
import { authClient } from '@/lib/auth-client';
import User from '@/lib/model/user';
import { useAuth } from '@/components/AuthProvider';

interface FilteredAccount {
  providerId: string;
}

type AccountMethod = {
  title: string;
  description: string;
  icon: React.ReactNode;
  testId: string;
  actionLabel: string;
  isCriticalAction?: boolean;
  handler: () => void;
};

/**
 * Provides UI component for configuring authentication related settings on the
 * profile page (e.g. Linking To Github, Deleting Accounts, Changing Passwords)
 * @param user The logged in User
 */
export default function AuthSettings({ user }: { user: User }) {
  const [accounts, setAccounts] = useState<FilteredAccount[]>([]);
  const router = useRouter();
  const queryParams = useSearchParams();
  const { setLoggedInUser, oauthConfig } = useAuth();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    /**
     * Updates state of accounts that a user has configured. A user may have
     * multiple accounts, e.g. "github" representing their OAuth configuration
     * and "credential" representing email and password config
     */
    const fetchAccounts = async () => {
      const { data, error } = await authClient.listAccounts();

      if (data) {
        setAccounts(data);
      } else {
        addToastForError(error);
      }
    };

    fetchAccounts().catch(() => {
      // Fail Silently here, Errors will be toasted above
    });
  }, []);

  useEffect(() => {
    const error = queryParams.get('error');

    if (error) {
      // Error details are not given to minimize potential XSS risks
      addToastForError(null);
    }
  }, [queryParams]);

  const isGithubLinked = accounts.some(acc => acc.providerId === 'github');

  /**
   * Attempts to a link a user's Tasktix account to their Github account,
   * redirecting back to this page on success, Errors from this are displayed
   * as toasts in the useEffect for queryParams.
   */
  function handleLinkGithub() {
    startTransition(async () => {
      await authClient.linkSocial({
        provider: 'github',
        callbackURL: '/profile',
        errorCallbackURL: '/profile'
      });
    });
  }

  /**
   * Attempts to unlink a user's Tasktix account from Github
   */
  function handleUnlinkGithub() {
    startTransition(async () => {
      await authClient.unlinkAccount(
        {
          providerId: 'github'
        },
        {
          onSuccess: () => {
            setAccounts(accounts.filter(acc => acc.providerId !== 'github'));
          },
          onError: ctx => {
            addToastForError(ctx.error);
          }
        }
      );
    });
  }

  /**
   * Attempts to delete account with provided password. On success it logs out
   * the user and redirects to the Tasktix Home Page. Failure is handled by
   * adding toasts
   * @param e Form Data, should include the users password as a string
   */
  function handleDeleteAccount(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.currentTarget));

    startTransition(async () => {
      await authClient.deleteUser(
        {
          password: formData.password as string
        },
        {
          onSuccess: () => {
            setLoggedInUser(false);
            router.push('/');
            addToast({
              title: 'Account succesfully deleted',
              color: 'success'
            });
          },
          onError: ctx => {
            addToastForError(ctx.error);
          }
        }
      );
    });
  }

  const methods = [
    oauthConfig.githubEnabled && {
      title: 'Github',
      description: isGithubLinked
        ? `Linked to ${user.name}`
        : 'Link to your Github account',
      icon: <Github />,
      actionLabel: isGithubLinked ? 'Disconnect' : 'Connect',
      handler: isGithubLinked ? handleUnlinkGithub : handleLinkGithub,
      isCriticalAction: false,
      testId: 'link-to-github'
    },
    {
      title: 'Delete Account',
      description: 'Permanently delete your account',
      icon: <TrashFill />,
      actionLabel: 'Delete Account',
      handler: onOpen,
      isCriticalAction: true,
      testId: 'delete-account'
    }
  ].filter(Boolean) as AccountMethod[];

  return (
    <div className='p-6'>
      <h2 className='text-xl p-4'>Account Settings</h2>
      <Card className=' border border-white/10 rounded-lg'>
        <CardBody className='p-0'>
          {methods.map((method, index) => (
            <AuthSettingRow
              key={method.title}
              isLast={index === methods.length - 1}
              method={method}
            />
          ))}
        </CardBody>
      </Card>
      <DeleteAccountModal
        handleDeleteAccount={handleDeleteAccount}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      />
    </div>
  );
}

/**
 * Represents a single row in the AuthSettings Component
 * @param method Object used to represent the data to be constructed in this row (e.g. Title, Description, Handlers, )
 * @param isLast Boolean representing if the element is the last element in the
 *  list, used for rendering the borders
 * @returns
 */
function AuthSettingRow({
  method,
  isLast
}: {
  method: AccountMethod;
  isLast: boolean;
}) {
  return (
    // Already refactored to reasonable JSX depth skipcq: JS-0415
    <div data-testid={method.testId}>
      <div className='flex items-center justify-between p-5 hover:bg-white/2 transition-colors group'>
        <div className='flex items-start gap-4'>
          <div className='mt-1'>{method.icon}</div>
          <div className='flex flex-col'>
            <span className='text-base font-medium'>{method.title}</span>
            <span className='text-sm text-gray-500'>{method.description}</span>
          </div>
        </div>
        <Button
          aria-label={method.actionLabel}
          color={method.isCriticalAction ? 'danger' : 'default'}
          size='sm'
          variant='solid'
          onPress={method.handler}
        >
          {method.actionLabel}
        </Button>
      </div>
      {!isLast && <Divider />}
    </div>
  );
}
/**
 * Renders a modal prompting the user to input their password to confirm account deletion
 * @param isOpen is the modal open (from useDisclosure)
 * @param onOpenChange how to handle changing the modals openness (from useDisclosure)
 * @param handleDeleteAccount Handler function to attempt account deletion
 */
function DeleteAccountModal({
  isOpen,
  onOpenChange,
  handleDeleteAccount
}: {
  isOpen: boolean;
  onOpenChange: () => void;
  handleDeleteAccount: (e: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    // Already refactored to reasonable JSX depth skipcq: JS-0415
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent className='p-2'>
        <ModalHeader className='justify-center'>
          Confirm Account Deletion
        </ModalHeader>
        <ModalBody>
          <Alert
            color='danger'
            description='This will delete all data associated with your account'
            title='This action is irreversible.'
          />
          <Form className='w-full gap-4' onSubmit={handleDeleteAccount}>
            <Input
              aria-label='Password Input'
              label='Password'
              labelPlacement='outside'
              name='password'
              type='password'
            />

            <Button
              aria-label='Confirm Delete Account'
              className='gap-2 self-end'
              color='danger'
              type='submit'
            >
              Confirm
            </Button>
          </Form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
