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

'use client';

import { Button, Input, InputProps } from '@heroui/react';
import { useState } from 'react';
import { Check } from 'react-bootstrap-icons';

/**
 * A text input that automatically fills with text. It requires confirmation, via a checkbox
 * button, to confirm the change. The function 'updateValue' is called with the new value to
 * propagate state updates.
 *
 * @param value The text that should automatically fill the field. Will also be used as an input for the function.
 * @param showLabel Shows a "Name" label within the input
 * @param showUnderline Shows an underline within the input
 * @param disabled Whether the input is disabled
 * @param className Classname for applying Tailwind CSS
 * @param classNames Classname for applying Tailwind CSS to individual HTML components
 * @param variant Dictates the style of the input field
 * @param updateValue The function that executes when the user confirms. Must take in a string param.
 */
export default function ConfirmedTextInput({
  value,
  'aria-label': ariaLabel,
  label,
  labelPlacement,
  showUnderline,
  disabled,
  className,
  classNames,
  variant = 'underlined',
  updateValue
}: {
  value: string;
  'aria-label'?: string;
  label?: string;
  labelPlacement?: InputProps['labelPlacement'];
  showUnderline?: boolean;
  disabled?: boolean;
  className?: string;
  classNames?: { input?: string; button?: string };
  variant?: InputProps['variant'];
  updateValue: (value: string) => unknown;
}) {
  const [newValue, setNewValue] = useState(value);

  return (
    <form
      className='flex grow shrink w-full items-end'
      data-testid={`confirmed-input-${label ?? ariaLabel ?? 'value'}`}
      onSubmit={e => {
        e.preventDefault();
        updateValue(newValue);
      }}
    >
      <Input
        aria-label={ariaLabel}
        className={`${disabled && 'opacity-50'} ${className}`}
        classNames={{
          inputWrapper: `${label !== undefined || showUnderline || 'border-transparent'}`,
          input: `${label !== undefined || showUnderline || '-mb-2'} ${classNames?.input}`
        }}
        disabled={disabled}
        label={label}
        labelPlacement={labelPlacement}
        size='sm'
        value={newValue}
        variant={variant}
        onValueChange={setNewValue}
      />
      <Button
        isIconOnly
        className={`rounded-lg w-8 h-8 min-w-8 min-h-8 ${newValue === value ? 'hidden' : ''} ${label !== undefined ? 'mt-4' : ''} ${classNames?.button}`}
        color='primary'
        type='submit'
      >
        <Check />
      </Button>
    </form>
  );
}
