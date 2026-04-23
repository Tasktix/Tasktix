# Style Guide

## File Structure

- Each React component should be placed by itself in a file
  - Where possible, components should be defined generically for reuse and placed in
    [`components/`](./components/)
  - Components with large JSX can define subcomponents by replacing the file with a folder
    of the same name. This folder should have an `index.tsx` file to allow imports
    directly from the folder
- Unit tests outside [`app/`](./app/) should be placed in a `__tests__` subdirectory at
  the same level as the file tested (e.g. the test file for `components/List/List.tsx`
  should be placed in `components/List/__tests__/`)
- Unit tests in [`app/`](./app/) should be co-located with the file tested (e.g. the test
  file for `app/body.tsx` should be placed in `app/body.test.tsx`)

## Naming

- Component files should be named using `PasalCase.tsx`
- Unit test files should have a name matching the name of the file the tests are for
  (**including case**), with
  a:
  - `.test.ts` extension if the test only includes TypeScript or
  - `.test.tsx` if it contains React components in the test

  (e.g. the component test file for `List.tsx` should be placed in `List.test.tsx`)

- All other files should be named using `camelCase.ts`
