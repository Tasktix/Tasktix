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

import ListItem from '@/lib/model/listItem';

import { sortItems, sortItemsByCompleted, sortItemsByIndex } from './sortItems';

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

describe('sortItemsByCompleted', () => {
  test('Incomplete items are sorted before completed items', () => {
    const data: ListItem[] = [
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        status: 'Completed',
        dateCompleted: new Date('2024-07-24T01:23:47.000Z')
      }),
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        status: 'Unstarted',
        dateCompleted: null
      })
    ];
    const expected: ListItem[] = [
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        status: 'Unstarted',
        dateCompleted: null
      }),
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        status: 'Completed',
        dateCompleted: new Date('2024-07-24T01:23:47.000Z')
      })
    ];

    const result = data.toSorted(sortItemsByCompleted);

    expect(result).toMatchObject(expected);
  });

  test('Incomplete items stay before completed items', () => {
    const data: ListItem[] = [
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        status: 'Unstarted',
        dateCompleted: null
      }),
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        status: 'Completed',
        dateCompleted: new Date('2024-07-24T01:23:47.000Z')
      })
    ];
    const expected: ListItem[] = [
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        status: 'Unstarted',
        dateCompleted: null
      }),
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        status: 'Completed',
        dateCompleted: new Date('2024-07-24T01:23:47.000Z')
      })
    ];

    const result = data.toSorted(sortItemsByCompleted);

    expect(result).toMatchObject(expected);
  });

  test('Items completed most recent are sorted before items completed longer ago', () => {
    const data: ListItem[] = [
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        status: 'Completed',
        dateCompleted: new Date('2024-07-24T01:23:45.000Z')
      }),
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        status: 'Completed',
        dateCompleted: new Date('2024-07-24T01:23:47.000Z')
      })
    ];
    const expected: ListItem[] = [
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        status: 'Completed',
        dateCompleted: new Date('2024-07-24T01:23:47.000Z')
      }),
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        status: 'Completed',
        dateCompleted: new Date('2024-07-24T01:23:45.000Z')
      })
    ];

    const result = data.toSorted(sortItems.bind(null, false, false));

    expect(result).toMatchObject(expected);
  });

  test('Items completed most recent stay before items completed longer ago', () => {
    const data: ListItem[] = [
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        status: 'Completed',
        dateCompleted: new Date('2024-07-24T01:23:47.000Z')
      }),
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        status: 'Completed',
        dateCompleted: new Date('2024-07-24T01:23:45.000Z')
      })
    ];
    const expected: ListItem[] = [
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        status: 'Completed',
        dateCompleted: new Date('2024-07-24T01:23:47.000Z')
      }),
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        status: 'Completed',
        dateCompleted: new Date('2024-07-24T01:23:45.000Z')
      })
    ];

    const result = data.toSorted(sortItems.bind(null, false, false));

    expect(result).toMatchObject(expected);
  });

  test('Items completed at the same time are both returned with order unspecified', () => {
    const data: ListItem[] = [
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        status: 'Completed',
        dateCompleted: new Date('2024-07-26T03:36:23.000Z')
      }),
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        status: 'Completed',
        dateCompleted: new Date('2024-07-26T03:36:23.000Z')
      })
    ];
    const expected: ListItem[] = [
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        status: 'Completed',
        dateCompleted: new Date('2024-07-26T03:36:23.000Z')
      }),
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        status: 'Completed',
        dateCompleted: new Date('2024-07-26T03:36:23.000Z')
      })
    ];

    const result = data.toSorted(sortItemsByCompleted);

    expect(result).toMatchObject(expected);
  });

  test('Incomplete items are not reordered', () => {
    const data: ListItem[] = [
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        status: 'Unstarted'
      }),
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        status: 'Unstarted'
      })
    ];
    const expected: ListItem[] = [
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        status: 'Unstarted'
      }),
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        status: 'Unstarted'
      })
    ];

    const result = data.toSorted(sortItemsByCompleted);

    expect(result).toMatchObject(expected);
  });
});

describe('sortItemsByIndex()', () => {
  test('Items are sorted in ascending order by index', () => {
    const data = [
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', sectionIndex: 2 }),
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', sectionIndex: 1 })
    ];

    const expected = [
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', sectionIndex: 1 }),
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', sectionIndex: 2 })
    ];

    const result = data.toSorted(sortItemsByIndex);

    expect(result).toMatchObject(expected);
  });

  test('Items in ascending order are  not reordered', () => {
    const data = [
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', sectionIndex: 1 }),
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', sectionIndex: 2 })
    ];

    const expected = [
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', sectionIndex: 1 }),
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', sectionIndex: 2 })
    ];

    const result = data.toSorted(sortItemsByIndex);

    expect(result).toMatchObject(expected);
  });

  test('Items with the same index are both returned with order unspecified', () => {
    const data = [
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', sectionIndex: 1 }),
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', sectionIndex: 1 })
    ];

    const expected = [
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', sectionIndex: 1 }),
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', sectionIndex: 1 })
    ];

    const result = data.toSorted(sortItemsByIndex);

    expect(result).toMatchObject(expected);
  });
});

describe('sortItems', () => {
  test('High priority items are sorted before low priority ones', () => {
    const data: ListItem[] = [
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', priority: 'Low' }),
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', priority: 'High' })
    ];
    const expected: ListItem[] = [
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', priority: 'High' }),
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', priority: 'Low' })
    ];

    const result = data.toSorted(sortItems.bind(null, false, false));

    expect(result).toMatchObject(expected);
  });

  test('High priority items stay before low priority ones', () => {
    const data: ListItem[] = [
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', priority: 'High' }),
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', priority: 'Low' })
    ];
    const expected: ListItem[] = [
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', priority: 'High' }),
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', priority: 'Low' })
    ];

    const result = data.toSorted(sortItems.bind(null, false, false));

    expect(result).toMatchObject(expected);
  });

  test('High priority items are sorted before medium priority ones', () => {
    const data: ListItem[] = [
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', priority: 'Medium' }),
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', priority: 'High' })
    ];
    const expected: ListItem[] = [
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', priority: 'High' }),
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', priority: 'Medium' })
    ];

    const result = data.toSorted(sortItems.bind(null, false, false));

    expect(result).toMatchObject(expected);
  });

  test('High priority items stay before medium priority ones', () => {
    const data: ListItem[] = [
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', priority: 'High' }),
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', priority: 'Medium' })
    ];
    const expected: ListItem[] = [
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', priority: 'High' }),
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', priority: 'Medium' })
    ];

    const result = data.toSorted(sortItems.bind(null, false, false));

    expect(result).toMatchObject(expected);
  });

  test('Medium priority items are sorted before low priority ones', () => {
    const data: ListItem[] = [
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', priority: 'Low' }),
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', priority: 'Medium' })
    ];
    const expected: ListItem[] = [
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', priority: 'Medium' }),
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', priority: 'Low' })
    ];

    const result = data.toSorted(sortItems.bind(null, false, false));

    expect(result).toMatchObject(expected);
  });

  test('Medium priority items stay before low priority ones', () => {
    const data: ListItem[] = [
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', priority: 'Medium' }),
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', priority: 'Low' })
    ];
    const expected: ListItem[] = [
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', priority: 'Medium' }),
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', priority: 'Low' })
    ];

    const result = data.toSorted(sortItems.bind(null, false, false));

    expect(result).toMatchObject(expected);
  });

  test('When due dates are active, items due first are sorted before items due later', () => {
    const data: ListItem[] = [
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        dateDue: new Date('2024-07-27T00:00:00.000Z')
      }),
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        dateDue: new Date('2024-07-25T00:00:00.000Z')
      })
    ];
    const expected: ListItem[] = [
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        dateDue: new Date('2024-07-25T00:00:00.000Z')
      }),
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        dateDue: new Date('2024-07-27T00:00:00.000Z')
      })
    ];

    const result = data.toSorted(sortItems.bind(null, false, true));

    expect(result).toMatchObject(expected);
  });

  test('When due dates are active, items due first stay before items due later', () => {
    const data: ListItem[] = [
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        dateDue: new Date('2024-07-25T00:00:00.000Z')
      }),
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        dateDue: new Date('2024-07-27T00:00:00.000Z')
      })
    ];
    const expected: ListItem[] = [
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        dateDue: new Date('2024-07-25T00:00:00.000Z')
      }),
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        dateDue: new Date('2024-07-27T00:00:00.000Z')
      })
    ];

    const result = data.toSorted(sortItems.bind(null, false, true));

    expect(result).toMatchObject(expected);
  });

  test('When due dates are active, items without due dates are sorted before item with due dates', () => {
    const data: ListItem[] = [
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        dateDue: new Date('2024-07-27T00:00:00.000Z')
      }),
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', dateDue: null })
    ];
    const expected: ListItem[] = [
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', dateDue: null }),
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        dateDue: new Date('2024-07-27T00:00:00.000Z')
      })
    ];

    const result = data.toSorted(sortItems.bind(null, false, true));

    expect(result).toMatchObject(expected);
  });

  test('When due dates are active, items without due dates stay before item with due dates', () => {
    const data: ListItem[] = [
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', dateDue: null }),
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        dateDue: new Date('2024-07-27T00:00:00.000Z')
      })
    ];
    const expected: ListItem[] = [
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa', dateDue: null }),
      new ListItem('Some item', {
        id: 'aaaaaaaaaaaaaaaa',
        dateDue: new Date('2024-07-27T00:00:00.000Z')
      })
    ];

    const result = data.toSorted(sortItems.bind(null, false, true));

    expect(result).toMatchObject(expected);
  });

  test('When due dates are active, items without due dates are not reordered relative to each other', () => {
    const data: ListItem[] = [
      new ListItem('First item', { id: 'aaaaaaaaaaaaaaaa', dateDue: null }),
      new ListItem('Second item', { id: 'aaaaaaaaaaaaaaaa', dateDue: null })
    ];
    const expected: ListItem[] = [
      new ListItem('First item', { id: 'aaaaaaaaaaaaaaaa', dateDue: null }),
      new ListItem('Second item', { id: 'aaaaaaaaaaaaaaaa', dateDue: null })
    ];

    const result = data.toSorted(sortItems.bind(null, false, true));

    expect(result).toMatchObject(expected);
  });

  test('Identical items are both returned', () => {
    const data: ListItem[] = [
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa' }),
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa' })
    ];
    const expected: ListItem[] = [
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa' }),
      new ListItem('Some item', { id: 'aaaaaaaaaaaaaaaa' })
    ];

    const result = data.toSorted(sortItems.bind(null, false, true));

    expect(result).toMatchObject(expected);
  });
});
