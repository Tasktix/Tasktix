# Contributing to Tasktix

Thank you for your interest in contributing to **Tasktix**!

Note that while it is recommended that your pull request (PR - for submitting your
changes) links to an issue (which can be used for discussing the bug / feature you're
addressing), you do not need to be assigned to the issue - just create the PR and it will
be reviewed.

This guide explains

- How to set up your environment
- How to write tests for your changes
- What steps are involved in the PR review process

## Code of Conduct

By contributing to this project, you agree to abide by our
[our Code of Conduct](./CODE_OF_CONDUCT.md) and are entitled to be treated by the
standards it lays out. Please see the [enforcement](./CODE_OF_CONDUCT.md#enforcement)
section for information on reporting misconduct.

## Getting Started

### Prerequisites

You will need to install the following software before running Tasktix locally:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended) or
  [Docker Engine](https://docs.docker.com/engine/install/) (optional for Linux if not
  using Dev Containers)
- [Node.js v22](https://nodejs.org/en/download)

### Setup

Start by cloning the repository:

```bash
git clone https://github.com/Tasktix/Tasktix.git
cd Tasktix
```

We recommend installing an ESLint plugin and spellchecking plugin in your preferred IDE to
catch simple errors as they're written. If you're using VS Code, you should be
automatically prompted to install our recommended extensions when first opening the
project.

If you're not planning to develop from a Dev Container, run the following command to
locally install dependencies for IntelliSense and ESLint to use:

```bash
npm install --ignore-scripts
```

Finally, copy [`.env.example`](./.env.example) to `.env` and update the default values to
match your environment.

### Starting the Development Server

To preview your changes, you can spin up a webserver and database via:

```bash
npm start
```

You can then view the project by visiting [127.0.0.1:3000](http://127.0.0.1:3000) in your
browser. Any changes you make to `.ts` or `.tsx` files will be immediately reflected via
Next.js' hot reloading capability.

### Stopping the Development Server

If the server is running as a foregrounded terminal process, pressing <kbd>Ctrl</kbd> +
<kbd>C</kbd> should be sufficient to stop the server. You could also run:

```bash
npm stop
```

To delete the development environment's containers, run:

```bash
npm run teardown
```

**Environment Variables**

- `.env` file required for local development (see `.env.example`)
- Never commit secrets or API tokens.
