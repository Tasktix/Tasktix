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
 */

import features from '@/public/data/features.json';
import FeatureBlock from '@/components/FeatureBlock';

/* Renders the public-facing marketing homepage at `/about`.
 *
 * This page displays a hero section followed by a series of feature
 * showcase blocks. Feature content is loaded from
 * `/public/data/features.json` to keep the page configurable without
 * modifying application code.
 *
 * Each feature is rendered using the `FeatureBlock` component, which handles
 * themed screenshots (light/dark mode) and optional layout flipping. The layout
 * alternates between left- and right-aligned images to create a visually
 * balanced presentation.
 *
 * @returns The homepage layout containing the hero section and a list of
 * feature showcase blocks.
 */
export default function Page() {
  return (
    <main className='grow mx-auto max-w-6xl px-4 md:px-6 py-12 space-y-24'>
      <header className='text-center mb-12'>
        <h1 className='text-3xl md:text-4xl font-extrabold'>
          Tasktix — Smarter Task Tracking
        </h1>
        <p className='mt-3 text-lg'>
          Stay organized with time tracking, tagging, and smart filtering.
        </p>
      </header>

      {features.map((f, i) => (
        <FeatureBlock
          key={f.title}
          align={i % 2 === 0 ? 'default' : 'flipped'}
          description={f.description}
          imageBaseName={f.imageBaseName}
          title={f.title}
        />
      ))}
    </main>
  );
}
