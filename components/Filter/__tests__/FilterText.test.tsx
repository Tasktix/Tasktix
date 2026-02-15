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

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import FilterText, {
  FilterInputText,
  LABEL_COLOR,
  OPERATOR_COLOR,
  PRIMITIVE_COLOR,
  STRING_COLOR
} from '../FilterText';
import {
  ComparableFilterOperator,
  DateFilterOperator,
  MultiOptionFilterOperator,
  OptionFilterOperator,
  TextFilterOperator
} from '../types';

beforeAll(() => {
  vi.stubEnv('TZ', 'UTC');
  vi.useFakeTimers();
});

afterAll(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe('FilterText', () => {
  test('Displays nothing when given a filter state with no filters', () => {
    const { container } = render(
      <FilterText filters={{ id: 1, operator: 'And', filters: [] }} />
    );

    expect(container.firstChild).toBeEmptyDOMElement();
  });

  test('Displays just condition when given a filter state with 1 filter', () => {
    const { container } = render(
      <FilterText
        filters={{
          id: 1,
          operator: 'And',
          filters: [
            {
              id: 1,
              type: 'text',
              label: 'theLabel',
              operator: TextFilterOperator.Equal,
              value: 'theValue'
            }
          ]
        }}
      />
    );

    expect(container.firstChild).toHaveTextContent('theLabel = "theValue"');
  });

  test('Displays conditions joined by the correct operator when given a filter state with multiple filters', () => {
    const { container } = render(
      <FilterText
        filters={{
          id: 1,
          operator: 'And',
          filters: [
            {
              id: 1,
              type: 'text',
              label: 'theLabel',
              operator: TextFilterOperator.Equal,
              value: 'theValue'
            },
            {
              id: 2,
              type: 'color',
              label: 'theColor',
              operator: OptionFilterOperator.NotEqual,
              value: 'Cyan'
            }
          ]
        }}
      />
    );

    expect(container.firstChild).toHaveTextContent(
      'theLabel = "theValue" AND theColor != "Cyan"'
    );
  });

  test('Displays the correct operator between each condition when given a filter state with multiple filters', () => {
    const { container } = render(
      <FilterText
        filters={{
          id: 1,
          operator: 'Or',
          filters: [
            {
              id: 1,
              type: 'text',
              label: 'theLabel',
              operator: TextFilterOperator.Equal,
              value: 'theValue'
            },
            {
              id: 2,
              type: 'color',
              label: 'theColor',
              operator: OptionFilterOperator.NotEqual,
              value: 'Cyan'
            },
            {
              id: 3,
              type: 'number',
              label: 'theNumber',
              operator: ComparableFilterOperator.LessThan,
              value: 15
            }
          ]
        }}
      />
    );

    expect(container.firstChild).toHaveTextContent(
      'theLabel = "theValue" OR theColor != "Cyan" OR theNumber < 15'
    );
  });

  test('Displays parentheses around sub-filter state when filter state is nested', () => {
    const { container } = render(
      <FilterText
        filters={{
          id: 1,
          operator: 'Or',
          filters: [
            {
              id: 1,
              type: 'text',
              label: 'theLabel',
              operator: TextFilterOperator.Equal,
              value: 'theValue'
            },
            {
              id: 2,
              operator: 'And',
              filters: [
                {
                  id: 1,
                  type: 'color',
                  label: 'theColor',
                  operator: OptionFilterOperator.NotEqual,
                  value: 'Cyan'
                },
                {
                  id: 2,
                  type: 'number',
                  label: 'theNumber',
                  operator: ComparableFilterOperator.LessThan,
                  value: 15
                }
              ]
            }
          ]
        }}
      />
    );

    expect(container.firstChild).toHaveTextContent(
      'theLabel = "theValue" OR ( theColor != "Cyan" AND theNumber < 15 )'
    );
  });

  test('Displays operators as dark green', () => {
    const { getByText } = render(
      <FilterText
        filters={{
          id: 1,
          operator: 'And',
          filters: [
            {
              id: 1,
              type: 'text',
              label: 'theLabel',
              operator: TextFilterOperator.Equal,
              value: 'theValue'
            },
            {
              id: 2,
              type: 'color',
              label: 'theColor',
              operator: OptionFilterOperator.NotEqual,
              value: 'Cyan'
            }
          ]
        }}
      />
    );

    expect(getByText('AND')).toHaveClass(OPERATOR_COLOR);
  });

  test('Displays everything in monospace text', () => {
    const { container } = render(
      <FilterText
        filters={{
          id: 1,
          operator: 'And',
          filters: [
            {
              id: 1,
              type: 'text',
              label: 'theLabel',
              operator: TextFilterOperator.Equal,
              value: 'theValue'
            },
            {
              id: 2,
              type: 'color',
              label: 'theColor',
              operator: OptionFilterOperator.NotEqual,
              value: 'Cyan'
            }
          ]
        }}
      />
    );

    expect(container.firstChild).toHaveClass('font-mono');
  });
});

describe('FilterInputText', () => {
  test('Displays nothing for empty text filter inputs', () => {
    const { container } = render(
      <FilterInputText filter={{ id: 1, type: 'undefined' }} />
    );

    expect(container.firstChild).toBeEmptyDOMElement();
  });

  describe('Displays appropriate text for text filter inputs', () => {
    test('Wraps value in quotes and escapes quotes in contents', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'text',
            label: 'theLabel',
            operator: TextFilterOperator.Equal,
            value: 'the"quoted"value'
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent(/"the\\"quoted\\"value"$/);
    });
    test('=', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'text',
            label: 'theLabel',
            operator: TextFilterOperator.Equal,
            value: 'theValue'
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel = "theValue"');
    });
    test('!=', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'text',
            label: 'theLabel',
            operator: TextFilterOperator.NotEqual,
            value: 'theValue'
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel != "theValue"');
    });
    test('=|', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'text',
            label: 'theLabel',
            operator: TextFilterOperator.Includes,
            value: 'theValue'
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel =| "theValue"');
    });
    test('^=', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'text',
            label: 'theLabel',
            operator: TextFilterOperator.StartsWith,
            value: 'theValue'
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel ^= "theValue"');
    });
    test('$=', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'text',
            label: 'theLabel',
            operator: TextFilterOperator.EndsWith,
            value: 'theValue'
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel $= "theValue"');
    });
    test('.*', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'text',
            label: 'theLabel',
            operator: TextFilterOperator.RegexMatches,
            value: 'theValue'
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel .* "theValue"');
    });
  });

  describe('Displays appropriate text for number filter inputs', () => {
    test('Displays the value as a number', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'number',
            label: 'theLabel',
            operator: ComparableFilterOperator.Equal,
            value: 100
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent(/100$/);
    });
    test('=', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'number',
            label: 'theLabel',
            operator: ComparableFilterOperator.Equal,
            value: 1
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel = 1');
    });
    test('!=', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'number',
            label: 'theLabel',
            operator: ComparableFilterOperator.NotEqual,
            value: 1
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel != 1');
    });
    test('<', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'number',
            label: 'theLabel',
            operator: ComparableFilterOperator.LessThan,
            value: 1
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel < 1');
    });
    test('<=', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'number',
            label: 'theLabel',
            operator: ComparableFilterOperator.LessThanEqual,
            value: 1
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel <= 1');
    });
    test('>', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'number',
            label: 'theLabel',
            operator: ComparableFilterOperator.GreaterThan,
            value: 1
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel > 1');
    });
    test('>=', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'number',
            label: 'theLabel',
            operator: ComparableFilterOperator.GreaterThanEqual,
            value: 1
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel >= 1');
    });
  });

  describe('Displays appropriate text for option filter inputs', () => {
    test('Wraps value in quotes and escapes quotes in contents', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'option',
            label: 'theLabel',
            operator: OptionFilterOperator.Equal,
            value: 'the"quoted"value'
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent(/"the\\"quoted\\"value"$/);
    });
    test('For "in" operator, wraps quoted values in brackets', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'option',
            label: 'theLabel',
            operator: OptionFilterOperator.In,
            value: ['the"quoted"value', 'second']
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent(
        /{"the\\"quoted\\"value", "second"}$/
      );
    });
    test('=', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'option',
            label: 'theLabel',
            operator: OptionFilterOperator.Equal,
            value: 'theValue'
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel = "theValue"');
    });
    test('!=', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'option',
            label: 'theLabel',
            operator: OptionFilterOperator.NotEqual,
            value: 'theValue'
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel != "theValue"');
    });
    test('|=', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'option',
            label: 'theLabel',
            operator: OptionFilterOperator.In,
            value: ['valueOne', 'valueTwo']
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent(
        'theLabel |= {"valueOne", "valueTwo"}'
      );
    });
    test('!|=', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'option',
            label: 'theLabel',
            operator: OptionFilterOperator.NotIn,
            value: ['valueOne', 'valueTwo']
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent(
        'theLabel !|= {"valueOne", "valueTwo"}'
      );
    });
  });

  describe('Displays appropriate text for multi option filter inputs', () => {
    test('Wraps values in brackets and each one in quotes and escapes quotes in contents', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'multi-option',
            label: 'theLabel',
            operator: MultiOptionFilterOperator.Equal,
            value: ['the"quoted"value', 'another quoted value']
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent(
        /{"the\\"quoted\\"value", "another quoted value"}$/
      );
    });
    test('=', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'multi-option',
            label: 'theLabel',
            operator: MultiOptionFilterOperator.Equal,
            value: ['valueOne', 'valueTwo']
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent(
        'theLabel = {"valueOne", "valueTwo"}'
      );
    });
    test('!=', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'multi-option',
            label: 'theLabel',
            operator: MultiOptionFilterOperator.NotEqual,
            value: ['valueOne', 'valueTwo']
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent(
        'theLabel != {"valueOne", "valueTwo"}'
      );
    });
    test('=|', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'multi-option',
            label: 'theLabel',
            operator: MultiOptionFilterOperator.Includes,
            value: ['valueOne', 'valueTwo']
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent(
        'theLabel =| {"valueOne", "valueTwo"}'
      );
    });
    test('!=|', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'multi-option',
            label: 'theLabel',
            operator: MultiOptionFilterOperator.NotIncludes,
            value: ['valueOne', 'valueTwo']
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent(
        'theLabel !=| {"valueOne", "valueTwo"}'
      );
    });
  });

  describe('Displays appropriate text for color filter inputs', () => {
    test('Wraps value in quotes', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'color',
            label: 'theLabel',
            operator: OptionFilterOperator.Equal,
            value: 'Amber'
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent(/"Amber"$/);
    });
    test('For "in" operator, wraps quoted values in brackets', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'color',
            label: 'theLabel',
            operator: OptionFilterOperator.In,
            value: ['Amber']
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent(/{"Amber"}$/);
    });
    test('=', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'color',
            label: 'theLabel',
            operator: OptionFilterOperator.Equal,
            value: 'Amber'
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel = "Amber"');
    });
    test('!=', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'color',
            label: 'theLabel',
            operator: OptionFilterOperator.NotEqual,
            value: 'Amber'
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel != "Amber"');
    });
    test('|=', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'color',
            label: 'theLabel',
            operator: OptionFilterOperator.In,
            value: ['Amber']
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel |= {"Amber"}');
    });
    test('!|=', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'color',
            label: 'theLabel',
            operator: OptionFilterOperator.NotIn,
            value: ['Amber']
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel !|= {"Amber"}');
    });
  });

  describe('Displays appropriate text for date filter inputs', () => {
    test('Displays dates in locale format', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'date',
            label: 'theLabel',
            operator: DateFilterOperator.Equal,
            value: new Date('2026-01-01')
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent(/1\/1\/2026$/);
    });
    test('=', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'date',
            label: 'theLabel',
            operator: DateFilterOperator.Equal,
            value: new Date('2026-01-01')
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel = 1/1/2026');
    });
    test('!=', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'date',
            label: 'theLabel',
            operator: DateFilterOperator.NotEqual,
            value: new Date('2026-01-01')
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel != 1/1/2026');
    });
    test('<', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'date',
            label: 'theLabel',
            operator: DateFilterOperator.LessThan,
            value: new Date('2026-01-01')
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel < 1/1/2026');
    });
    test('<=', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'date',
            label: 'theLabel',
            operator: DateFilterOperator.LessThanEqual,
            value: new Date('2026-01-01')
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel <= 1/1/2026');
    });
    test('>', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'date',
            label: 'theLabel',
            operator: DateFilterOperator.GreaterThan,
            value: new Date('2026-01-01')
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel > 1/1/2026');
    });
    test('>=', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'date',
            label: 'theLabel',
            operator: DateFilterOperator.GreaterThanEqual,
            value: new Date('2026-01-01')
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel >= 1/1/2026');
    });
    test('DayOfWeek', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'date',
            label: 'theLabel',
            operator: DateFilterOperator.DayOfWeek,
            value: new Date('2026-01-01')
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel = Thursday');
    });
    test('NotDayOfWeek', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'date',
            label: 'theLabel',
            operator: DateFilterOperator.NotDayOfWeek,
            value: new Date('2026-01-01')
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel != Thursday');
    });
  });

  describe('Displays appropriate text for time filter inputs', () => {
    test('Displays times (in seconds) in hours and minutes', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'time',
            label: 'theLabel',
            operator: ComparableFilterOperator.Equal,
            value: 60 * 60 + 3 * 60 + 12
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent(/1:03$/);
    });
    test('=', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'time',
            label: 'theLabel',
            operator: ComparableFilterOperator.Equal,
            value: 60
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel = 00:01');
    });
    test('!=', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'time',
            label: 'theLabel',
            operator: ComparableFilterOperator.NotEqual,
            value: 60
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel != 00:01');
    });
    test('<', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'time',
            label: 'theLabel',
            operator: ComparableFilterOperator.LessThan,
            value: 60
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel < 00:01');
    });
    test('<=', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'time',
            label: 'theLabel',
            operator: ComparableFilterOperator.LessThanEqual,
            value: 60
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel <= 00:01');
    });
    test('>', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'time',
            label: 'theLabel',
            operator: ComparableFilterOperator.GreaterThan,
            value: 60
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel > 00:01');
    });
    test('>=', () => {
      const { container } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'time',
            label: 'theLabel',
            operator: ComparableFilterOperator.GreaterThanEqual,
            value: 60
          }}
        />
      );

      expect(container.firstChild).toHaveTextContent('theLabel >= 00:01');
    });
  });

  describe('Displays components in color', () => {
    test('Displays label as light green', () => {
      const { getByText } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'text',
            label: 'theLabel',
            operator: TextFilterOperator.Equal,
            value: 'theValue'
          }}
        />
      );

      expect(getByText('theLabel')).toHaveClass(LABEL_COLOR);
    });
    test('Displays operator as dark green', () => {
      const { getByText } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'text',
            label: 'theLabel',
            operator: TextFilterOperator.Equal,
            value: 'theValue'
          }}
        />
      );

      expect(getByText('=')).toHaveClass(OPERATOR_COLOR);
    });
    test('Displays primitive values as pale green', () => {
      const { getByText } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'number',
            label: 'theLabel',
            operator: ComparableFilterOperator.Equal,
            value: 1
          }}
        />
      );

      expect(getByText('1')).toHaveClass(PRIMITIVE_COLOR);
    });
    test('Displays string values as yellow', () => {
      const { getByText } = render(
        <FilterInputText
          filter={{
            id: 1,
            type: 'text',
            label: 'theLabel',
            operator: TextFilterOperator.Equal,
            value: 'theValue'
          }}
        />
      );

      expect(getByText('"theValue"')).toHaveClass(STRING_COLOR);
    });
  });
});
