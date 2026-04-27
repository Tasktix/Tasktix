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

import { useTheme } from 'next-themes';

/**
 * Displays a light mode or dark mode version of the video as appropriate for the user's
 * theme.
 *
 * @param videoBaseName The base filename used to load the appropriate themed
 * video. For example, a `videoBaseName` of `"usage"` will load
 * `"public/screenshots/usage.light.mp4"` in light mode and
 * `"public/screenshots/usage.dark.mp4"` in dark mode.
 * @param posterBaseName The base filename used to load the appropriate themed
 * poster (placeholder image while the video loads). For example, a `posterBaseName` of
 * `"usage-preview"` will load
 * `"public/screenshots/usage-preview.light.jpg"` in light mode and
 * `"public/screenshots/usage-preview.dark.jpg"` in dark mode.
 */
export default function ThemedVideo({
  videoBaseName,
  posterBaseName
}: {
  videoBaseName: string;
  posterBaseName: string;
}) {
  const { theme } = useTheme();
  const videoSrc =
    theme === 'dark'
      ? `/screenshots/${videoBaseName}.dark.mp4`
      : `/screenshots/${videoBaseName}.light.mp4`;
  const posterSrc =
    theme === 'dark'
      ? `/screenshots/${posterBaseName}.dark.jpg`
      : `/screenshots/${posterBaseName}.light.jpg`;

  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      aria-label='Video showing Tasktix in use'
      className='grow my-16'
      poster={posterSrc}
      preload='metadata'
    >
      <source src={videoSrc} type='video/mp4' />
    </video>
  );
}
