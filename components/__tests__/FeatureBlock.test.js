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

import { render, screen } from '@testing-library/react';

import FeatureBlock from '../FeatureBlock';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn()
  })
}));

// Mock HeroUI Image to behave like a regular img tag
jest.mock('@heroui/image', () => ({
  Image: props => <img {...props} />
}));

describe('FeatureBlock', () => {
  const mockProps = {
    title: 'Test Feature',
    description: 'Description here',
    imageBaseName: 'testFeature'
  };

  // 1️⃣ Title + description render
  test('renders title and description', () => {
    render(<FeatureBlock {...mockProps} />);
    expect(screen.getByText('Test Feature')).toBeInTheDocument();
    expect(screen.getByText('Description here')).toBeInTheDocument();
  });

  // 2️⃣ Default alignment (not flipped)
  test('applies default layout', () => {
    const { container } = render(<FeatureBlock {...mockProps} />);
    const section = container.querySelector('section');

    // Should NOT have md:flex-row-reverse
    expect(section.className.includes('md:flex-row-reverse')).toBe(false);
  });

  // 3️⃣ Flipped alignment
  test("applies flipped layout when align='flipped'", () => {
    const { container } = render(
      <FeatureBlock {...mockProps} align='flipped' />
    );

    const section = container.querySelector('section');

    expect(section.className.includes('md:flex-row-reverse')).toBe(true);
  });

  // 4️⃣ Light mode visibility test
  test('shows the light image in light mode', () => {
    render(<FeatureBlock {...mockProps} />);

    const lightImg = screen.getAllByAltText('Test Feature screenshot')[0];
    const darkImg = screen.getAllByAltText('Test Feature screenshot')[1];

    expect(lightImg).toBeVisible();
    expect(darkImg.className.includes('hidden')).toBe(true);
  });

  // 5️⃣ Dark mode visibility test
  test('shows the dark image in dark mode', () => {
    // Override theme mock for this test
    jest.spyOn(require('next-themes'), 'useTheme').mockReturnValue({
      theme: 'dark',
      setTheme: jest.fn()
    });

    render(<FeatureBlock {...mockProps} />);

    const lightImg = screen.getAllByAltText('Test Feature screenshot')[0];
    const darkImg = screen.getAllByAltText('Test Feature screenshot')[1];

    expect(darkImg).toBeVisible();
    expect(lightImg.className.includes('dark:hidden')).toBe(true);
  });
});
