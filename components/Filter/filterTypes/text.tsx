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

import { Input } from '@heroui/react';

import { SelectTextFilterOperator } from '../SelectOperator';
import { TextFilterOperator } from '../types';

export type TextFieldData = {
  type: 'text';
  label: string;
};

export type TextFieldState = {
  label: string;
  operator: TextFilterOperator | undefined;
  value: string | undefined;
};

export function TextFilterInputs({
  operator,
  value,
  onOperatorChange,
  onValueChange
}: Readonly<{
  operator: TextFilterOperator | undefined;
  value: string | undefined;
  onOperatorChange: (operator: TextFilterOperator | undefined) => unknown;
  onValueChange: (value: string | undefined) => unknown;
}>) {
  const isRegex = operator === TextFilterOperator.RegexMatches;

  return (
    <>
      <SelectTextFilterOperator value={operator} onChange={onOperatorChange} />
      <Input
        className={isRegex ? 'font-mono' : ''}
        endContent={isRegex && '/'}
        startContent={isRegex && '/'}
        value={value}
        onValueChange={onValueChange}
      />
    </>
  );
}
