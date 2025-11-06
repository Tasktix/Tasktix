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

import type { Config } from 'tailwindcss';

import { heroui } from "@heroui/react";

const config: Config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      keyframes: {
        slideLeft: {
          '0%': { right: '-20rem' },
          '100%': { right: '1rem' }
        },
        slideRight: {
          '0%': { right: '1rem' },
          '100%': { right: '-20rem' }
        }
      },
      animation: {
        'slide-from-right': 'slideLeft 0.5s, slideRight 0.5s 4s forwards'
      },
      boxShadow: {
        'l-lg':
          '0 -3px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color)'
      }
    }
  },
  darkMode: 'class',
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              50: '#05281e',
              100: '#0a3f30',
              200: '#115743',
              300: '#1b6e56',
              400: '#29856b',
              500: '#3e9d82',
              600: '#80cbb6',
              700: '#97d7c5',
              800: '#b0e3d4',
              900: '#e8faf5',
              DEFAULT: '#29856b',
              foreground: '#ffffff'
            }
          }
        },
        dark: {
          colors: {
            primary: {
              50: '#05281e',
              100: '#0a3f30',
              200: '#115743',
              300: '#1b6e56',
              400: '#29856b',
              500: '#3e9d82',
              600: '#80cbb6',
              700: '#97d7c5',
              800: '#b0e3d4',
              900: '#e8faf5',
              DEFAULT: '#29856b',
              foreground: '#ffffff'
            }
          }
        }
      }
    })
  ]
};

export default config;
