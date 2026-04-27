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
import { render } from '@testing-library/react';
import { useTheme } from 'next-themes';

import ThemedVideo from '../ThemedVideo';

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
  videoBaseName: 'testFeature',
  posterBaseName: 'testFeaturePreview'
};

describe('ThemedVideo', () => {
  test('Renders light video with light poster when theme is light', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      themes: ['light', 'dark', 'system'],
      setTheme: vi.fn()
    });

    const { getByTestId } = render(<ThemedVideo {...baseProps} />);

    const video = getByTestId('video-testFeature');

    expect(video.children[0]).toHaveAttribute(
      'src',
      expect.stringContaining('.light.mp4')
    );
    expect(video).toHaveAttribute(
      'poster',
      expect.stringContaining('.light.jpg')
    );
  });

  test('Renders dark video with light poster when theme is dark', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      themes: ['light', 'dark', 'system'],
      resolvedTheme: 'dark',
      setTheme: vi.fn()
    });

    const { getByTestId } = render(<ThemedVideo {...baseProps} />);

    const video = getByTestId('video-testFeature');

    expect(video.children[0]).toHaveAttribute(
      'src',
      expect.stringContaining('.dark.mp4')
    );
    expect(video).toHaveAttribute(
      'poster',
      expect.stringContaining('.dark.jpg')
    );
  });

  test('Renders dark video with dark poster when theme is system and resolvedTheme is dark', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'system',
      themes: ['light', 'dark', 'system'],
      resolvedTheme: 'dark',
      setTheme: vi.fn()
    });

    const { getByTestId } = render(<ThemedVideo {...baseProps} />);

    const video = getByTestId('video-testFeature');

    expect(video.children[0]).toHaveAttribute(
      'src',
      expect.stringContaining('.dark.mp4')
    );
    expect(video).toHaveAttribute(
      'poster',
      expect.stringContaining('.dark.jpg')
    );
  });
});
