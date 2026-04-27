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
 * @vitest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { useTheme } from 'next-themes';

import ThemedImage from '../ThemedImage';

vi.mock(import('next-themes'), async importOriginal => {
  const originalUseTheme = await importOriginal();

  return {
    ...originalUseTheme,
    useTheme: vi.fn(() => ({ ...originalUseTheme.useTheme(), theme: 'light' }))
  };
});

beforeEach(() => {
  vi.resetAllMocks();
});

const baseProps = {
  alt: 'Test Feature Screenshot',
  imageBaseName: 'testFeature'
};

describe('ThemedImage', () => {
  test('Renders light image when theme is light', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      themes: ['light', 'dark', 'system'],
      setTheme: vi.fn()
    });

    render(<ThemedImage {...baseProps} />);

    const img = screen.getByRole('img');

    expect(img).toHaveAttribute('src', expect.stringContaining('.light.png'));
  });

  test('Renders dark image when theme is dark', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      themes: ['light', 'dark', 'system'],
      resolvedTheme: 'dark',
      setTheme: vi.fn()
    });

    render(<ThemedImage {...baseProps} />);

    const img = screen.getByRole('img');

    expect(img).toHaveAttribute('src', expect.stringContaining('.dark.png'));
  });

  test('Renders dark image when theme is system and resolvedTheme is dark', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'system',
      themes: ['light', 'dark', 'system'],
      resolvedTheme: 'dark',
      setTheme: vi.fn()
    });

    render(<ThemedImage {...baseProps} />);

    const img = screen.getByRole('img');

    expect(img).toHaveAttribute('src', expect.stringContaining('.dark.png'));
  });

  test('Renders border/shadow by default', () => {
    render(<ThemedImage {...baseProps} />);

    const img = screen.getByRole('img');

    expect(img).toHaveClass('shadow-lg');
  });

  test('Renders no border/shadow when disabled', () => {
    render(<ThemedImage {...baseProps} hideImageBorder />);

    const img = screen.getByRole('img');

    expect(img).not.toHaveClass('shadow-lg');
  });
});
