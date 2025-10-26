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

export function getDateDiff(a: Date, b: Date): number {
  return a.getTime() - b.getTime();
}

export function getDayOffset(date: Date): number {
  const day = 1000 * 60 * 60 * 24;
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return Math.floor(getDateDiff(date, today) / day);
}

export function formatDate(date: Date, pretty = true): string {
  const distant: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };

  const close: Intl.DateTimeFormatOptions = {
    weekday: 'long'
  };

  const dayOffset = getDayOffset(date);
  const isThisWeek = dayOffset < 7 && date.getDay() > new Date().getDay();

  if (!pretty) return date.toLocaleDateString('en-US', distant);
  else if (dayOffset === 0) return 'Today';
  else if (dayOffset === 1) return 'Tomorrow';
  else if (dayOffset === -1) return 'Yesterday';
  else if (dayOffset > 0 && (dayOffset < 4 || isThisWeek))
    return date.toLocaleDateString('en-US', close);
  else return date.toLocaleDateString('en-US', distant);
}

export function formatTime(time: number): string {
  const hoursMs = Math.trunc(time / 3600000) * 3600000;
  const minsMs = Math.round((time - hoursMs) / 60000) * 60000;

  let hours = (hoursMs / 3600000).toString();
  let minutes = (minsMs / 60000).toString();

  if (hours.length < 2) hours = `0${hours}`;

  if (minutes.length < 2) minutes = `0${minutes}`;

  return `${hours}:${minutes}`;
}

export function inputToDate(date: string): Date {
  const [year, month, day] = date.split('-');

  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function dateToInput(date: Date): string {
  const year = date.getFullYear().toString();
  let month = (date.getMonth() + 1).toString();
  let day = date.getDate().toString();

  if (month.length < 2) month = `0${month}`;
  if (day.length < 2) day = `0${day}`;

  return `${year}-${month}-${day}`;
}

export function parseTime(time: string): number {
  const timeParts = time.split(':');

  for (const part of timeParts) {
    if (!Number.isInteger(Number(part)))
      throw Error(`Invalid time to parse: ${time}`);
  }

  if (timeParts.length === 3) {
    const [hours, minutes, seconds] = timeParts;

    return (
      ((Number(hours) * 60 + Number(minutes)) * 60 + Number(seconds)) * 1000
    );
  } else if (timeParts.length === 2) {
    const [hours, minutes] = timeParts;

    return (Number(hours) * 60 + Number(minutes)) * 60 * 1000;
  } else if (timeParts.length === 1) {
    const [minutes] = timeParts;

    return Number(minutes) * 60 * 1000;
  }

  throw Error(`Invalid time to parse: ${time}`);
}
