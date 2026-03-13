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

import { Kbd, Select, Selection, SelectItem } from '@heroui/react';

import {
  ColorFilterOperator,
  ComparableFilterOperator,
  DateFilterOperator,
  MultiOptionFilterOperator,
  OptionFilterOperator,
  TextFilterOperator
} from './types';

export function SelectBaseFilterOperator<T extends string>({
  children,
  value,
  onChange
}: {
  children?: ReturnType<typeof SelectItem>[];
  value?: T;
  onChange: (value?: T) => unknown;
}) {
  return (
    <Select
      aria-label='operator'
      selectedKeys={value ? [value] : []}
      onSelectionChange={(keys: Selection) => {
        if (keys === 'all') return;

        onChange(keys.keys().next().value as T | undefined);
      }}
    >
      <SelectItem key='=' endContent={<Operator o='=' />}>
        equals
      </SelectItem>
      <SelectItem key='!=' endContent={<Operator o='!=' />}>
        does not equal
      </SelectItem>
      <>{children}</>
    </Select>
  );
}

export function SelectTextFilterOperator({
  value,
  onChange
}: {
  value: TextFilterOperator | undefined;
  onChange: (value: TextFilterOperator | undefined) => unknown;
}) {
  return (
    <SelectBaseFilterOperator value={value} onChange={onChange}>
      <SelectItem
        key={TextFilterOperator.Includes}
        endContent={<Operator o='=|' />}
      >
        includes
      </SelectItem>
      <SelectItem
        key={TextFilterOperator.StartsWith}
        endContent={<Operator o='^=' />}
      >
        starts with
      </SelectItem>
      <SelectItem
        key={TextFilterOperator.EndsWith}
        endContent={<Operator o='$=' />}
      >
        ends with
      </SelectItem>
      <SelectItem
        key={TextFilterOperator.RegexMatches}
        endContent={<Operator o='.*' />}
      >
        matches
      </SelectItem>
    </SelectBaseFilterOperator>
  );
}

export function SelectComparableFilterOperator({
  value,
  onChange
}: {
  value: ComparableFilterOperator | undefined;
  onChange: (value: ComparableFilterOperator | undefined) => unknown;
}) {
  return (
    <SelectBaseFilterOperator value={value} onChange={onChange}>
      <SelectItem
        key={ComparableFilterOperator.LessThan}
        endContent={<Operator o='<' />}
      >
        is less than
      </SelectItem>
      <SelectItem
        key={ComparableFilterOperator.LessThanEqual}
        endContent={<Operator o='<=' />}
      >
        is less than or equals
      </SelectItem>
      <SelectItem
        key={ComparableFilterOperator.GreaterThan}
        endContent={<Operator o='>' />}
      >
        is greater than
      </SelectItem>
      <SelectItem
        key={ComparableFilterOperator.GreaterThanEqual}
        endContent={<Operator o='>=' />}
      >
        is greater than or equals
      </SelectItem>
    </SelectBaseFilterOperator>
  );
}

export function SelectOptionFilterOperator({
  value,
  onChange
}: {
  value: OptionFilterOperator | undefined;
  onChange: (value: OptionFilterOperator | undefined) => unknown;
}) {
  return (
    <SelectBaseFilterOperator value={value} onChange={onChange}>
      <SelectItem
        key={OptionFilterOperator.In}
        endContent={<Operator o='|=' />}
      >
        is one of
      </SelectItem>
      <SelectItem
        key={OptionFilterOperator.NotIn}
        endContent={<Operator o='!|=' />}
      >
        is not one of
      </SelectItem>
    </SelectBaseFilterOperator>
  );
}

export function SelectMultiOptionFilterOperator({
  value,
  onChange
}: {
  value: MultiOptionFilterOperator | undefined;
  onChange: (value: MultiOptionFilterOperator | undefined) => unknown;
}) {
  return (
    <SelectBaseFilterOperator value={value} onChange={onChange}>
      <SelectItem
        key={MultiOptionFilterOperator.Includes}
        endContent={<Operator o='=|' />}
      >
        includes
      </SelectItem>
      <SelectItem
        key={MultiOptionFilterOperator.NotIncludes}
        endContent={<Operator o='!=|' />}
      >
        does not include
      </SelectItem>
    </SelectBaseFilterOperator>
  );
}

export function SelectColorFilterOperator({
  value,
  onChange
}: {
  value: ColorFilterOperator | undefined;
  onChange: (value: ColorFilterOperator | undefined) => unknown;
}) {
  return <SelectBaseFilterOperator value={value} onChange={onChange} />;
}

export function SelectDateFilterOperator({
  value,
  onChange
}: {
  value: DateFilterOperator | undefined;
  onChange: (value: DateFilterOperator | undefined) => unknown;
}) {
  return (
    <SelectBaseFilterOperator value={value} onChange={onChange}>
      <SelectItem
        key={DateFilterOperator.LessThan}
        endContent={<Operator o='<' />}
      >
        is less than
      </SelectItem>
      <SelectItem
        key={DateFilterOperator.LessThanEqual}
        endContent={<Operator o='<=' />}
      >
        is less than or equals
      </SelectItem>
      <SelectItem
        key={DateFilterOperator.GreaterThan}
        endContent={<Operator o='>' />}
      >
        is greater than
      </SelectItem>
      <SelectItem
        key={DateFilterOperator.GreaterThanEqual}
        endContent={<Operator o='>=' />}
      >
        is greater than or equals
      </SelectItem>
      <SelectItem
        key={DateFilterOperator.DayOfWeek}
        endContent={<Operator o='=' />}
      >
        is a
      </SelectItem>
      <SelectItem
        key={DateFilterOperator.NotDayOfWeek}
        endContent={<Operator o='!=' />}
      >
        is not a
      </SelectItem>
    </SelectBaseFilterOperator>
  );
}

function Operator({ o }: { o: string }) {
  return <Kbd className='font-mono'>{o}</Kbd>;
}
