# Contributing to Tasktix

Thank you for your interest in contributing to **Tasktix**!

Note that while it is recommended that your pull request (PR) links to an issue (which can
be used for discussing the bug/feature you're addressing), you do not need to be
assigned to the issue - just create the PR and it will be reviewed.

This guide explains

- How to set up your environment
- How to write tests for your changes
- What steps are involved in the PR review process

## Code of Conduct

By contributing to this project, you agree to abide by
[our Code of Conduct](./CODE_OF_CONDUCT.md) and are entitled to be treated according to
the standards it lays out. Please see the [enforcement](./CODE_OF_CONDUCT.md#enforcement)
section for information on reporting misconduct.

## Security

- Never commit `.env`, API keys, or other secrets to this repository
- Securely report vulnerabilities as laid out in [our security policy](./SECURITY.md)

## Setup

Check out [our setup guide](./docs/setup.md) to learn how to set up this project for local
development.

## Branches

By default, you cannot push changes directly to the `main` branch on GitHub. Instead, you
need to create a new branch, commit your changes there, and submit a PR to merge your
changes into `main`. Tasktix uses the features branch strategy. For further reading on
these concepts, [refer to GitHub's branching documentation](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-branches).

## Pull Requests

All PRs must:

- Follow the Code of Conduct
- Be narrowly scoped
  - A PR should only address 1 bug/feature/change
  - Large features should be split into several steps and, therefore, PRs
- Pass linting, testing, and code quality checks
- Follow the PR template
- Update documentation affected by the changes
- Include screenshots or logs if UI/UX changes are made
- Receive **2 maintainers' approval** before being squashed & merged

### Reviews

- Check functionality, clarity, and test coverage
- Leave actionable comments
- Follow the Code of Conduct and avoid personal critique

### PR Titles

This project uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#specification)
for PR titles that become the squashed commits' title. PR titles are linted by Danger; you
must choose from one of the following types to describe your PR, which should not replace
the leading verb in your title:

- `feat`: A new feature is implemented
- `fix`: A bug is resolved
- `perf`: Only performance improvements; no external/user impact (besides quicker responses)
- `docs`: Only documentation changes; no external/user impact
- `style`: Only UI stylistic changes; no external/user impact
- `refactor`: Only code structure changes; no external/user impact
- `test`: Only test coverage improvements; no external/user impact
- `chore`: Misc. changes that don't fit other categories; no external/user impact

This should be followed by an exclamation point (`!`) if your PR introduces breaking (i.e.
non-backward compatible) changes. In all cases, this prefix should then be followed by a
colon and space (`: `) and a title explaining the purpose of the PR.

### Documentation

Each new feature or fix must:

- Update the README or `docs/` files as appropriate
- Add or update [JSDoc docstrings](https://jsdoc.app/#block-tags) for functions/classes
- Include code comments explaining non-obvious logic
  - Intuitive, readable structuring is preferred. Comments are a last resort for
    complicated functionality that cannot be reasonably simplified further

### Style and Linting

Style checks and linting will run in CI and must pass before your PR will be approved. To
avoid surprises in CI, run the following command before creating your PR:

```bash
npm run lint
```

## Testing

All PRs must include tests to validate their change. Coverage should always exceed
**80%**; PRs without 100% coverage must provide justification for the untested code. To
run all tests on the repo to validate your PR will pass testing, simply use:

```bash
npm test
```

- **Vitest** should be used for unit tests. To run just Vitest tests, run:
  ```bash
  npm run test:vi
  ```
- **Cypress** should be used for end-to-end tests. To view Cypress tests live for easy
  development/iteration, run:

  > [!NOTE]
  >
  > Cypress **does not** work in dev containers.
  >
  > - If you are using a local dev container: simply open a terminal in the directory
  >   where the project lives on your host machine to run these commands. (Note that this
  >   will tear down your dev container while the tests are running. If you are iterating
  >   on tests, it is likely best to open the project in an IDE on your host machine
  >   rather than the dev container.)
  > - If you are using GitHub Codespaces: clone the repo, check out your branch, and
  >   change the [base URL in Cypress' config](./cypress.config.ts#L26) to match the
  >   website preview URL from the codespace. Then run `npm run cy:open` on your host
  >   machine to open Cypress and run tests against the Codespace.

  ```bash
  npm run start:test
  npm run cy:open
  npm run stop:test
  ```

  Or, for quick runs, run:

  ```bash
  npm run test:cy
  ```
