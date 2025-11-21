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
import '@testing-library/user-event'; // We can exclude this import for testing static pages like this one, but we'll need it for testing interactive behavior
import { render } from '@testing-library/react';

import FeatureBlock from './FeatureBlock';

test('renders title and description', () => {
  const { getByText } = render(
    <FeatureBlock
      description='test description'
      imageBaseName='test'
      title='test title'
    />
  );

  expect(getByText('test title')).toBeVisible();
});
