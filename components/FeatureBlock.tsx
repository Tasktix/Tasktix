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

import ThemedImage from './ThemedImage';

type FeatureBlockProps = Readonly<{
  title: string;
  description: string;
  imageBaseName: string;
  hideImageBorder?: boolean;
  align?: 'default' | 'flipped';
}>;

/**
 * Highlights a key application feature with a themed screenshot and a descriptive
 * explanation. Displays the feature image alongside supporting text, with an
 * optional layout flip to alternate the visual arrangement when used in a list.
 *
 * The displayed screenshot automatically switches between light and dark
 * variants based on the active theme using the provided `imageBaseName`.
 *
 * @param title - The name of the feature being highlighted.
 * @param description - A concise explanation of the feature's capabilities or value.
 * @param imageBaseName - The base filename used to load the appropriate themed
 * screenshot. For example, an `imageBaseName` of `"timeTracking"` will load
 * `"public/screenshots/timeTracking.light.png"` in light mode and
 * `"public/screenshots/timeTracking.dark.png"` in dark mode.
 * @param hideImageBorder - Whether to show a border/shadow around the feature's image.
 * For use with images that include multiple components and an additional full-image
 * shadow doesn't look right.
 * @param align - Controls whether the image appears before (`default`) or after
 * (`flipped`) the text content.
 */
export default function FeatureBlock({
  title,
  description,
  imageBaseName,
  hideImageBorder = false,
  align = 'default'
}: FeatureBlockProps) {
  return (
    <section
      className={`flex flex-col items-center gap-8 md:gap-16
        md:flex-row ${align === 'flipped' ? 'md:flex-row-reverse' : ''}`}
    >
      <div className='w-full md:w-1/2'>
        <ThemedImage
          alt={`${title} screenshot`}
          hideImageBorder={hideImageBorder}
          imageBaseName={imageBaseName}
        />
      </div>

      <div className='w-full md:w-1/2 text-center md:text-left'>
        <h2 className='text-2xl md:text-3xl font-light text-foreground'>
          {title}
        </h2>
        <p className='mt-3 text-content4-foreground text-base md:text-lg leading-relaxed'>
          {description}
        </p>
      </div>
    </section>
  );
}
