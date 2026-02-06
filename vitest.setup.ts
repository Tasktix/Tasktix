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

import '@testing-library/jest-dom/vitest';
import React from 'react';
import { vi } from 'vitest';

vi.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => {
    const {
      priority,
      fill,
      blurDataURL,
      placeholder,
      loader,
      quality,
      sizes,
      onLoadingComplete,
      ...rest
    } = props;

    // Explicitly mark as intentionally unused
    void priority;
    void fill;
    void blurDataURL;
    void placeholder;
    void loader;
    void quality;
    void sizes;
    void onLoadingComplete;

    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', {
      ...rest,
      alt: rest.alt ?? ''
    });
  }
}));
