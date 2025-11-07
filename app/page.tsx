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
      'Track expected vs elapsed time for every task with quick Start and Pause buttons.',
    imageBaseName: 'Time-Tracking'
  },
  {
    title: 'Tag System',
    description:
      'Organize tasks with customizable colored tags for subjects, projects, or contexts.',
    imageBaseName: 'Tag-System'
  },
  {
    title: 'Priority System',
    description:
      'Mark tasks as Low, Medium, or High priority to stay focused on what matters most.',
    imageBaseName: 'Priority'
  },
  {
    title: 'Filtering Feature',
    description:
      'Filter tasks by tag, priority, or due date to manage your workload efficiently.',
    imageBaseName: 'filtering'
  },
  {
    title: 'Manual Sorting',
    description:
      'Reorder tasks manually by dragging and dropping them within each section.',
    imageBaseName: 'Sorting'
  }
];

export default function Page() {
  return (
    <main className='mx-auto max-w-6xl px-4 md:px-6 py-12 space-y-24 bg-white dark:bg-[#0d1117]'>
      <header className='text-center mb-12'>
        <h1 className='text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100'>
          Tasktix — Smarter Task Tracking
        </h1>
        <p className='mt-3 text-gray-600 dark:text-gray-300 text-lg'>
          Stay organized with time tracking, tagging, and smart filtering.
        </p>
      </header>

      {FEATURES.map((f, i) => (
        <FeatureBlock key={f.title} index={i} {...f} />
      ))}
    </main>
  );
}
