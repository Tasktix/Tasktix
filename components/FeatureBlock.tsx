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
import { useTheme } from 'next-themes';
/**
 * Props for the FeatureBlock component.
 *
 * @property title - The name of the feature being showcased.
 * @property description - A short explanation of what the feature does.
 * @property imageBaseName - Base filename used to load themed screenshots
 * (e.g. "priority" → "priority.light.png" and "priority.dark.png").
 * @property align - Determines whether the image is placed on the left or right.
 */
type FeatureBlockProps = Readonly<{
  title: string;
  description: string;
  imageBaseName: string;
  align?: 'default' | 'flipped';
}>;
/**
 * Displays a homepage feature section with a screenshot, title, and description.
 *
 * The component automatically selects an appropriate light or dark screenshot
 * based on the active theme from `next-themes`. The align feature determines whether the
 * image appears on the left (default) or the right (flipped) side of the text.
 */
export default function FeatureBlock({
  title,
  description,
  imageBaseName,
  align = 'default'
}: FeatureBlockProps) {
  const { theme } = useTheme();
  const themedSrc =
    theme === 'dark'
      ? `/screenshots/${imageBaseName}.dark.png`
      : `/screenshots/${imageBaseName}.light.png`;

  return (
    <section
      className={`flex flex-col items-center gap-8 md:gap-16
        md:flex-row ${align === 'flipped' ? 'md:flex-row-reverse' : ''}`}
    >
      <div className='w-full md:w-1/2'>
        <div className='rounded-xl border shadow-md overflow-hidden border-default'>
          <HeroImage
            alt={`${title} screenshot`}
            className='w-full h-auto object-contain'
            height={600}
            src={themedSrc}
            width={900}
          />
        </div>
      </div>

      <div className='w-full md:w-1/2 text-center md:text-left'>
        <h2 className='text-2xl md:text-3xl font-semibold text-foreground'>
          {title}
        </h2>
        <p className='mt-3 text-default text-base md:text-lg leading-relaxed'>
          {description}
        </p>
      </div>
    </section>
  );
}
