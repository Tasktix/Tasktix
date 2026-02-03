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
 *
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

import Body from '@/app/body';
import { useAuth } from '@/components/AuthProvider';

jest.mock('@/components/AuthProvider', () => ({
  useAuth: jest.fn()
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
    prefetch: jest.fn()
  })
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={props.alt || ''} {...props} />;
  }
}));

jest.mock('@/components/ThemeSwitcher', () => ({
  __esModule: true,
  default: () => <div data-testid='theme-switcher' />
}));

// Lightweight mocks for HeroUI so we can assert href without depending on their internals
type Props = React.PropsWithChildren<Record<string, unknown>>;

jest.mock('@heroui/react', () => ({
  __esModule: true,

  Button: ({ children, ...props }: Props) => (
    <button {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  ),

  Link: ({ href, children, ...props }: Props & { href?: string }) => (
    <a
      href={href}
      {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
    >
      {children}
    </a>
  ),

  Navbar: ({ children }: React.PropsWithChildren) => <nav>{children}</nav>,

  NavbarBrand: ({
    as: AsComp,
    href,
    children,
    ...props
  }: Props & { as?: React.ElementType; href?: string }) => {
    const Comp = AsComp || 'div';

    return (
      <Comp href={href} {...props}>
        {children}
      </Comp>
    );
  },

  NavbarContent: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  NavbarItem: ({ children }: React.PropsWithChildren) => <div>{children}</div>,

  ToastProvider: () => <div />,

  Dropdown: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  DropdownTrigger: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  DropdownMenu: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),

  DropdownItem: ({ children, ...props }: Props) => (
    <div {...props}>{children}</div>
  ),

  Avatar: () => <div />
}));

describe('Body', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('links logo to /list when logged in', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isLoggedIn: true,
      setIsLoggedIn: jest.fn()
    });

    render(
      <Body>
        <div>child</div>
      </Body>
    );

    const logoImg = screen.getByAltText('Tasktix');
    const link = logoImg.closest('a');

    expect(link).toBeTruthy();
    expect(link).toHaveAttribute('href', '/list');
  });

  it('links logo to /about when logged out', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isLoggedIn: false,
      setIsLoggedIn: jest.fn()
    });

    render(
      <Body>
        <div>child</div>
      </Body>
    );

    const logoImg = screen.getByAltText('Tasktix');
    const link = logoImg.closest('a');

    expect(link).toBeTruthy();
    expect(link).toHaveAttribute('href', '/about');
  });
});
