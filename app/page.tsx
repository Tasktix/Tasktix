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

import FeatureBlock from '@/components/FeatureBlock';

const FEATURES = [
  {
    title: 'Time Tracking',
    description:
      'Track expected vs elapsed time for every task with start and pause buttons.',
    imageBaseName: 'timeTracking'
  },
  {
    title: 'Tag System',
    description:
      'Organize tasks with customizable colored tags for subjects, projects, or contexts.',
    imageBaseName: 'tagSystem'
  },
  {
    title: 'Priority System',
    description:
      'Mark tasks as low, medium, or high priority to stay focused on what matters most.',
    imageBaseName: 'priority'
  },
  {
    title: 'Filtering Feature',
    description:
      "Filter tasks using any (or every!) detail that's tracked — whether that's a tag, the due date, the time you've spent working on it, or anything else.",
    imageBaseName: 'filtering'
  },
  {
    title: 'Manual Sorting',
    description:
      "Tasks are intelligently sorted based on due date and priority. If you need extra control, however, you're also free to arrange them manually.",
    imageBaseName: 'sorting'
  }
];

export default function Page() {
  return (
    <main className='mx-auto max-w-6xl px-4 md:px-6 py-12 space-y-24'>
      <header className='text-center mb-12'>
        <h1 className='text-3xl md:text-4xl font-extrabold '>
          Tasktix — Smarter Task Tracking
        </h1>
        <p className='mt-3 text-lg'>
          Stay organized with time tracking, tagging, and smart filtering.
        </p>
      </header>

      {FEATURES.map((f, i) => (
        <FeatureBlock
          key={f.title}
          {...f}
          align={i % 2 === 0 ? 'default' : 'flipped'}
        />
      ))}
    </main>
  );
}
