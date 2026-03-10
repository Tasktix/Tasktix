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

import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';

import Tag from '@/lib/model/tag';
import api from '@/lib/api';

import TagSettings from '../TagSettings';

vi.mock('@/lib/api');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('Edit Tags', () => {
  it('Edits tag color on tag color change submit', async () => {
    const user = userEvent.setup();
    const setTagsAvailableMock = vi.fn();

    vi.mocked(api.patch).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });
    const { getByLabelText } = render(
      <TagSettings
        addNewTag={vi.fn()}
        listId='list-id'
        setTagsAvailable={setTagsAvailableMock}
        tagsAvailable={[
          new Tag('tag1', 'Red', 'id-tag1'),
          new Tag('tag2', 'Blue', 'id-tag2')
        ]}
      />
    );

    const editTag1Color = getByLabelText('edit color: tag1');

    await user.click(editTag1Color);

    const greenButton = getByLabelText('Green');

    await user.click(greenButton);

    expect(api.patch).toHaveBeenCalled();
    expect(setTagsAvailableMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 'id-tag1', color: 'Green' })
      ])
    );
  });

  it('Does not edit tag color if new color not submitted', async () => {
    const user = userEvent.setup();
    const setTagsAvailableMock = vi.fn();
    const { getByLabelText } = render(
      <TagSettings
        addNewTag={vi.fn()}
        listId='list-id'
        setTagsAvailable={setTagsAvailableMock}
        tagsAvailable={[
          new Tag('tag1', 'Red', 'id-tag1'),
          new Tag('tag2', 'Blue', 'id-tag2')
        ]}
      />
    );

    const editTag1Color = getByLabelText('edit color: tag1');

    await user.click(editTag1Color);

    const closeColorWidget = getByLabelText('clear');

    await user.click(closeColorWidget);

    expect(api.patch).not.toHaveBeenCalled();
    expect(setTagsAvailableMock).not.toHaveBeenCalled();
  });

  it('Edits tag name on tag name change submit', async () => {
    const user = userEvent.setup();
    const setTagsAvailableMock = vi.fn();

    vi.mocked(api.patch).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });
    const { getByLabelText } = render(
      <TagSettings
        addNewTag={vi.fn()}
        listId='list-id'
        setTagsAvailable={setTagsAvailableMock}
        tagsAvailable={[
          new Tag('tag1', 'Red', 'id-tag1'),
          new Tag('tag2', 'Blue', 'id-tag2')
        ]}
      />
    );

    const editTextTag1 = getByLabelText('rename tag: tag1');

    expect(editTextTag1).toBeVisible();

    await user.type(editTextTag1, '-renamed');
    await user.keyboard('{enter}');
    expect(setTagsAvailableMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 'id-tag1', name: 'tag1-renamed' })
      ])
    );
  });
});
describe('Removing Tags', () => {
  it('Deletes tag on delete buton press', async () => {
    const user = userEvent.setup();
    const setTagsAvailableMock = vi.fn();
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockImplementation(() => true);

    vi.mocked(api.delete).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });
    const { getByLabelText } = render(
      <TagSettings
        addNewTag={vi.fn()}
        listId='list-id'
        setTagsAvailable={setTagsAvailableMock}
        tagsAvailable={[
          new Tag('tag1', 'Red', 'id-tag1'),
          new Tag('tag2', 'Blue', 'id-tag2')
        ]}
      />
    );

    const deleteTag1 = getByLabelText('delete tag: tag1');

    expect(deleteTag1).toBeVisible();

    await user.click(deleteTag1);
    expect(confirmSpy).toHaveBeenCalled();

    expect(setTagsAvailableMock).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'id-tag2' })
    ]);
  });

  it('Does not delete tag if not confirmed', async () => {
    const user = userEvent.setup();
    const setTagsAvailableMock = vi.fn();
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockImplementation(() => false);

    vi.mocked(api.delete).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });
    const { getByLabelText } = render(
      <TagSettings
        addNewTag={vi.fn()}
        listId='list-id'
        setTagsAvailable={setTagsAvailableMock}
        tagsAvailable={[
          new Tag('tag1', 'Red', 'id-tag1'),
          new Tag('tag2', 'Blue', 'id-tag2')
        ]}
      />
    );

    const deleteTag1 = getByLabelText('delete tag: tag1');

    expect(deleteTag1).toBeVisible();

    await user.click(deleteTag1);
    expect(confirmSpy).toHaveBeenCalled();

    expect(setTagsAvailableMock).not.toHaveBeenCalled();
  });
});
