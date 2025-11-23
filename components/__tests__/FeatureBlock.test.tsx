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

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { useTheme } from 'next-themes';

import FeatureBlock from '../FeatureBlock';

jest.mock('next-themes', () => ({
  useTheme: jest.fn()
}));

beforeEach(() => {
  jest.resetAllMocks();
  (useTheme as jest.Mock).mockReturnValue({ theme: 'light' });
});

const baseProps = {
  title: 'Test Feature',
  description: 'This is a test.',
  imageBaseName: 'testFeature'
};

describe('FeatureBlock', () => {
  test('renders title and description', () => {
    render(<FeatureBlock {...baseProps} />);

    expect(screen.getByText('Test Feature')).toBeInTheDocument();
    expect(screen.getByText('This is a test.')).toBeInTheDocument();
  });

  test('renders light image when theme is light', () => {
    (useTheme as jest.Mock).mockReturnValue({ theme: 'light' });

    render(<FeatureBlock {...baseProps} />);

    const img = screen.getByRole('img');

    expect(img).toHaveAttribute('src', expect.stringContaining('.light.png'));
  });

  test('renders dark image when theme is dark', () => {
    (useTheme as jest.Mock).mockReturnValue({ theme: 'dark' });

    render(<FeatureBlock {...baseProps} />);

    const img = screen.getByRole('img');

    expect(img).toHaveAttribute('src', expect.stringContaining('.dark.png'));
  });

  test("flips layout when align='flipped'", () => {
    const { container } = render(
      <FeatureBlock {...baseProps} align='flipped' />
    );

    const section = container.querySelector('section');

    expect(section).toHaveClass('md:flex-row-reverse');
  });
});
