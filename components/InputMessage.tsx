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

export interface InputMessage {
  message: React.ReactNode | string;
  color: 'default' | 'success' | 'warning' | 'danger';
}

/**
 * Displays a message with a specific color. Intended for use in HeroUI `<Input />`
 * components' message field to allow for a broader range of messages to be displayed, not
 * just error messages.
 *
 * @param data.message The message to display
 * @param data.color The semantic color to display the message with
 */
export default function Message({ data }: { data: InputMessage }) {
  return <span className={`text-${data.color}`}>{data.message}</span>;
}
