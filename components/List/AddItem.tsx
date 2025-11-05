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

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Selection,
  useDisclosure
} from "@heroui/react";
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Check, Plus } from 'react-bootstrap-icons';

import { default as api } from '@/lib/api';
import { addSnackbar } from '@/components/Snackbar';
import ListItem from '@/lib/model/listItem';
import { getBorderColor, getPriorityColor } from '@/lib/color';

import TimeInput from '../TimeInput';
import DateInput2 from '../DateInput2';

export default function AddItem({
  sectionId,
  hasTimeTracking,
  hasDueDates,
  nextIndex,
  addItem
}: {
  sectionId: string;
  hasTimeTracking: boolean;
  hasDueDates: boolean;
  nextIndex: number;
  addItem: (_: ListItem) => unknown;
}) {
  const zeroMin = new Date();

  zeroMin.setTime(0);
  const startingInputValues = {
    name: '',
    dateDue: new Date(),
    priority: new Set(['Low']),
    expectedMs: 0
  };

  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onOpenChange: onModalOpenChange
  } = useDisclosure();
  const [values, setValues] = useState<{
    name: string;
    dateDue?: Date;
    priority: Selection;
    expectedMs?: number;
  }>(startingInputValues);
  const focusInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isSliderOpen) focusInput.current?.focus();
  }, [isSliderOpen]);

  function setName(name: string): void {
    setValues({
      name,
      dateDue: values.dateDue,
      priority: new Set(values.priority),
      expectedMs: values.expectedMs
    });
  }
  function setDueDate(date: Date): void {
    setValues({
      name: values.name,
      dateDue: date,
      priority: new Set(values.priority),
      expectedMs: values.expectedMs
    });
  }
  function setPriority(priority: Selection): void {
    setValues({
      name: values.name,
      dateDue: values.dateDue,
      priority,
      expectedMs: values.expectedMs
    });
  }
  function setExpectedDuration(expectedMs: number): void {
    setValues({
      name: values.name,
      dateDue: values.dateDue,
      priority: new Set(values.priority),
      expectedMs
    });
  }

  function createItem(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const priorityKey =
      values.priority === 'all' ? 'Low' : values.priority.keys().next().value;
    const priority =
      priorityKey === 'High' || priorityKey === 'Medium' ? priorityKey : 'Low';

    values.dateDue?.setHours(23, 59, 59, 0);
    const newItem = { ...values, sectionId, priority, sectionIndex: nextIndex };

    if (!hasTimeTracking) delete newItem.expectedMs;
    if (!hasDueDates) delete newItem.dateDue;

    api
      .post('/item', newItem)
      .then(res => {
        setValues(startingInputValues);

        const id = res.content?.split('/').at(-1);
        const item = new ListItem(values.name, {
          priority,
          expectedMs: newItem.expectedMs,
          sectionIndex: nextIndex,
          dateDue: newItem.dateDue,
          id
        });

        addItem(item);

        setIsSliderOpen(false);
      })
      .catch(err => addSnackbar(err.message, 'error'));
  }

  return (
    <span>
      <span className='hidden lg:flex justify-between items-center overflow-y-visible'>
        <span className='overflow-x-clip'>
          <form
            className={`flex gap-4 pr-4 transition-transform${isSliderOpen ? '' : ' translate-x-full'}`}
            onSubmit={createItem}
          >
            <Input
              ref={input => {
                focusInput.current = input;
              }}
              className='w-44 -mt-2'
              classNames={{
                label: 'pb-1',
                inputWrapper: 'border-foreground/50'
              }}
              label='Name'
              placeholder='Add item...'
              size='sm'
              tabIndex={isSliderOpen ? 0 : 1}
              value={values.name}
              variant='underlined'
              onValueChange={setName}
            />
            {hasDueDates ? (
              <DateInput2
                className='w-24 -mt-4'
                classNames={{
                  label: '-pb-1',
                  inputWrapper: 'border-foreground/50'
                }}
                color='primary'
                label='Due'
                size='sm'
                tabIndex={isSliderOpen ? 0 : 1}
                value={values.dateDue}
                variant='underlined'
                onValueChange={setDueDate}
              />
            ) : null}
            <Select
              className={'w-28 -mt-4'}
              classNames={{
                trigger: getBorderColor(getPriorityColor(values.priority)),
                mainWrapper: '-mt-6'
              }}
              color={getPriorityColor(values.priority)}
              label={<span className='ml-2 text-foreground'>Priority</span>}
              labelPlacement='outside'
              placeholder='Select...'
              selectedKeys={values.priority}
              size='sm'
              tabIndex={isSliderOpen ? 0 : 1}
              variant='underlined'
              onSelectionChange={setPriority}
            >
              <SelectItem key='High' color='danger' value='High'>
                High
              </SelectItem>
              <SelectItem key='Medium' color='warning' value='Medium'>
                Medium
              </SelectItem>
              <SelectItem key='Low' color='success' value='Low'>
                Low
              </SelectItem>
            </Select>
            {hasTimeTracking ? (
              <TimeInput
                className='w-12 -mt-2'
                classNames={{
                  label: 'pb-1',
                  inputWrapper: 'border-foreground/50'
                }}
                label='Time'
                size='sm'
                tabIndex={isSliderOpen ? 0 : 1}
                value={values.expectedMs}
                variant='underlined'
                onValueChange={setExpectedDuration}
              />
            ) : null}
            <Button
              isIconOnly
              color='primary'
              tabIndex={isSliderOpen ? 0 : 1}
              type='submit'
              variant='ghost'
            >
              <Check size={'1.25em'} />
            </Button>
          </form>
        </span>
        <Button
          isIconOnly
          color={isSliderOpen ? 'danger' : 'primary'}
          tabIndex={0}
          variant='ghost'
          onPress={() => {
            setIsSliderOpen(!isSliderOpen);
            if (isSliderOpen) setValues(startingInputValues);
          }}
        >
          <Plus
            className={`transition-transform ${isSliderOpen ? ' -rotate-45' : ''}`}
            size={'1.5em'}
          />
        </Button>
      </span>
      <span className='flex lg:hidden'>
        <Button
          isIconOnly
          color='primary'
          tabIndex={0}
          variant='ghost'
          onPress={onModalOpen}
        >
          <Plus size={'1.5em'} />
        </Button>
        <Modal isOpen={isModalOpen} onOpenChange={onModalOpenChange}>
          <ModalContent>
            {onClose => (
              <>
                <ModalHeader className='justify-center'>Add Item</ModalHeader>
                <form onSubmit={createItem}>
                  <ModalBody className={`flex flex-row justify-center gap-4`}>
                    <Input
                      autoFocus
                      className='w-44 -mt-2'
                      classNames={{
                        label: 'pb-1',
                        inputWrapper: 'border-foreground/50'
                      }}
                      label='Name'
                      placeholder='Add item...'
                      size='sm'
                      value={values.name}
                      variant='underlined'
                      onValueChange={setName}
                    />
                    {hasDueDates ? (
                      <DateInput2
                        className='w-24 -mt-4'
                        classNames={{
                          label: '-pb-1',
                          inputWrapper: 'border-foreground/50'
                        }}
                        color='primary'
                        label='Due'
                        size='sm'
                        value={values.dateDue}
                        variant='underlined'
                        onValueChange={setDueDate}
                      />
                    ) : null}
                    <Select
                      className={'w-28 -mt-4'}
                      classNames={{
                        trigger: getBorderColor(
                          getPriorityColor(values.priority)
                        ),
                        mainWrapper: '-mt-6'
                      }}
                      color={getPriorityColor(values.priority)}
                      label={
                        <span className='ml-2 text-foreground'>Priority</span>
                      }
                      labelPlacement='outside'
                      placeholder='Select...'
                      selectedKeys={values.priority}
                      size='sm'
                      variant='underlined'
                      onSelectionChange={setPriority}
                    >
                      <SelectItem key='High' color='danger' value='High'>
                        High
                      </SelectItem>
                      <SelectItem key='Medium' color='warning' value='Medium'>
                        Medium
                      </SelectItem>
                      <SelectItem key='Low' color='success' value='Low'>
                        Low
                      </SelectItem>
                    </Select>
                    {hasTimeTracking ? (
                      <TimeInput
                        autoFocus={false}
                        className='w-12 -mt-2'
                        classNames={{
                          label: 'pb-1',
                          inputWrapper: 'border-foreground/50'
                        }}
                        label='Time'
                        size='sm'
                        value={values.expectedMs}
                        variant='underlined'
                        onValueChange={setExpectedDuration}
                      />
                    ) : null}
                  </ModalBody>
                  <ModalFooter>
                    <Button color='danger' variant='light' onPress={onClose}>
                      Cancel
                    </Button>
                    <Button color='primary' type='submit' onPress={onClose}>
                      Add
                    </Button>
                  </ModalFooter>
                </form>
              </>
            )}
          </ModalContent>
        </Modal>
      </span>
    </span>
  );
}
