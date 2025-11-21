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

import { Image as HeroImage } from '@heroui/image';

type FeatureBlockProps = {
  title: string;
  description: string;
  imageBaseName: string;
  align?: 'default' | 'flipped';
};

export default function FeatureBlock({
  title,
  description,
  imageBaseName,
  align = 'default'
}: FeatureBlockProps) {
  const isFlipped = align === 'flipped';

  return (
    <section
      className={`flex flex-col items-center gap-8 md:gap-16 
                  md:flex-row ${isFlipped ? 'md:flex-row-reverse' : ''}`}
    >
      {/* IMAGE */}
      <div className="w-full md:w-1/2">
        <div className="rounded-large border border-default shadow-md overflow-hidden">
          {/* LIGHT MODE */}
          <HeroImage
            src={`/screenshots/${imageBaseName}.light.png`}
            alt={`${title} screenshot`}
            width={900}
            height={600}
            className="w-full h-auto object-cover dark:hidden"
          />

          {/* DARK MODE */}
          <HeroImage
            src={`/screenshots/${imageBaseName}.dark.png`}
            alt={`${title} screenshot`}
            width={900}
            height={600}
            className="w-full h-auto object-cover hidden dark:block"
          />
        </div>
      </div>

      {/* TEXT */}
      <div className="w-full md:w-1/2 text-center md:text-left">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        <p className="mt-3 text-gray-600 dark:text-gray-300 text-base md:text-lg leading-relaxed">
          {description}
        </p>
      </div>
    </section>
  );
}
