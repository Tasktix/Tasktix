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

import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import Tag from '@/lib/model/tag';

import Tags from '../Tags';

test('Tags that can be added render in order alphabetically', async () => {
  const user = userEvent.setup();

  const { getByLabelText, getByRole } = render(
    <Tags
      addNewTag={vi.fn()}
      isComplete={false}
      linkTag={vi.fn()}
      tags={[]}
      tagsAvailable={[
        new Tag('Second tag', 'Blue'),
        new Tag('First tag', 'Cyan'),
        new Tag('Third tag', 'Violet')
      ]}
      unlinkTag={vi.fn()}
    />
  );

  await user.click(getByLabelText('Update tags'));

  const tagContainer = getByRole('dialog');
  const tags = within(tagContainer).getAllByText(/.*tag/);

  expect(tags.map(tag => tag.textContent)).toEqual([
    'First tag',
    'Second tag',
    'Third tag'
  ]);
});

test('Tags that are be added render in order alphabetically', async () => {
  const user = userEvent.setup();

  const { getByLabelText, getByRole } = render(
    <Tags
      addNewTag={vi.fn()}
      isComplete={false}
      linkTag={vi.fn()}
      tags={[
        new Tag('Second tag', 'Blue', 'tag2'),
        new Tag('First tag', 'Cyan', 'tag1'),
        new Tag('Third tag', 'Violet', 'tag3')
      ]}
      tagsAvailable={[
        new Tag('Second tag', 'Blue', 'tag2'),
        new Tag('First tag', 'Cyan', 'tag1'),
        new Tag('Third tag', 'Violet', 'tag3')
      ]}
      unlinkTag={vi.fn()}
    />
  );

  await user.click(getByLabelText('Update tags'));

  const tagContainer = getByRole('dialog');
  const tags = within(tagContainer).getAllByText(/.*tag/);

  expect(tags.map(tag => tag.textContent)).toEqual([
    'First tag',
    'Second tag',
    'Third tag'
  ]);
});

test('Tags that are added render above tags that can be added', async () => {
  const user = userEvent.setup();

  const { getByLabelText, getByRole } = render(
    <Tags
      addNewTag={vi.fn()}
      isComplete={false}
      linkTag={vi.fn()}
      tags={[new Tag('Second tag', 'Blue', 'added-id')]}
      tagsAvailable={[
        new Tag('Second tag', 'Blue', 'added-id'),
        new Tag('First tag', 'Cyan'),
        new Tag('Third tag', 'Violet')
      ]}
      unlinkTag={vi.fn()}
    />
  );

  await user.click(getByLabelText('Update tags'));

  const tagContainer = getByRole('dialog');
  const tags = within(tagContainer).getAllByText(/.*tag/);

  expect(tags.map(tag => tag.textContent)).toEqual([
    'Second tag',
    'First tag',
    'Third tag'
  ]);
});

test('Popover contains only the "new tag" input if currently no tags', async () => {
  const user = userEvent.setup();

  const { getByLabelText, getByRole } = render(
    <Tags
      addNewTag={vi.fn()}
      isComplete={false}
      linkTag={vi.fn()}
      tags={[]}
      tagsAvailable={[]}
      unlinkTag={vi.fn()}
    />
  );

  await user.click(getByLabelText('Update tags'));

  expect(getByRole('dialog')).toHaveTextContent('');
});
