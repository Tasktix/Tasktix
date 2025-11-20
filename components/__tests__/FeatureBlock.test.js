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

import FeatureBlock from '@/components/FeatureBlock';

describe('FeatureBlock', () => {
  it('renders title and description', () => {
    render(
      <FeatureBlock
        title='Test Feature'
        description='This is a test description.'
        imageBaseName='testImage'
      />
    );

    expect(screen.getByText('Test Feature')).toBeInTheDocument();
    expect(screen.getByText('This is a test description.')).toBeInTheDocument();
  });

  it('applies flipped layout when align="flipped"', () => {
    const { container } = render(
      <FeatureBlock
        title='Flipped Feature'
        description='Flipped description'
        imageBaseName='testImage'
        align='flipped'
      />
    );

    const section = container.querySelector('section');

    expect(section.className).toMatch(/md:flex-row-reverse/);
  });

  it('renders both light and dark images', () => {
    render(
      <FeatureBlock
        title='Test Feature'
        description='desc'
        imageBaseName='testImage'
      />
    );

    const images = screen.getAllByAltText('Test Feature screenshot');

    // Both images (light + dark) should exist in the DOM
    expect(images).toHaveLength(2);
  });
});
