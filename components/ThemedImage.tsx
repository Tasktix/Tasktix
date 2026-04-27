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

import { Image } from '@heroui/image';
import { useTheme } from 'next-themes';

/**
 * Displays a light mode or dark mode version of the image as appropriate for the user's
 * theme.
 *
 * @param alt The alt text to display for the image
 * @param imageBaseName The base filename used to load the appropriate themed
 * screenshot. For example, an `imageBaseName` of `"timeTracking"` will load
 * `"public/screenshots/timeTracking.light.png"` in light mode and
 * `"public/screenshots/timeTracking.dark.png"` in dark mode.
 * @param hideImageBorder - Whether to show a border/shadow around the feature's image.
 * For use with images that include multiple components and an additional full-image
 * shadow doesn't look right.
 */
export default function ThemedImage({
  alt,
  imageBaseName,
  hideImageBorder
}: {
  alt: string;
  imageBaseName: string;
  hideImageBorder: boolean;
}) {
  const { theme } = useTheme();
  const imageSrc =
    theme === 'dark'
      ? `/screenshots/${imageBaseName}.dark.png`
      : `/screenshots/${imageBaseName}.light.png`;

  return (
    <Image
      alt={alt}
      className={`object-contain ${hideImageBorder || 'shadow-lg shadow-content2'}`}
      src={imageSrc}
    />
  );
}
