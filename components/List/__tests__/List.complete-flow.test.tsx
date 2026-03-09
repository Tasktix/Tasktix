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

import ListModel from '@/lib/model/list';
import ListItemModel from '@/lib/model/listItem';
import ListSectionModel from '@/lib/model/listSection';

import List from '../List';

vi.mock('@/components/SearchBar', () => ({
  default: () => <div data-testid='search-bar' />
}));

vi.mock('@/components/ListSettings', () => ({
  default: () => <div data-testid='list-settings' />
}));

vi.mock('@/components/AddListSection', () => ({
  default: () => <div data-testid='add-section' />
}));

describe('List layout integration', () => {
  it('keeps the filter bar and list settings button in the same row container', () => {
    const startingList = new ListModel(
      'List name',
      'Amber',
      [],
      [new ListSectionModel('Section', [new ListItemModel('Item', {})])],
      false,
      false,
      false,
      'list-id'
    );

    render(
      <List
        startingList={JSON.stringify(startingList)}
        startingTagsAvailable='[]'
      />
    );

    const searchBar = screen.getByTestId('search-bar');
    const settings = screen.getByTestId('list-settings');
    const sharedRow = searchBar.parentElement?.parentElement;

    expect(sharedRow).toHaveClass('flex');
    expect(sharedRow).toHaveClass('items-center');
    expect(searchBar.parentElement).toHaveClass('grow');
    expect(settings.parentElement).toHaveClass('shrink-0');
  });
});
