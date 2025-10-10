# <center>Tasktix</center>

[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=Tasktix_Tasktix&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=Tasktix_Tasktix)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=Tasktix_Tasktix&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=Tasktix_Tasktix)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/f5589385fcd14310bc4f766cba51593c)](https://app.codacy.com/gh/Tasktix/Tasktix/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![DeepSource](https://app.deepsource.com/gh/Tasktix/Tasktix.svg/?label=active+issues&show_trend=true&token=htsvS3wjjtryq3kgw4BYXNYa)](https://app.deepsource.com/gh/Tasktix/Tasktix/)

[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Tasktix_Tasktix&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=Tasktix_Tasktix)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=Tasktix_Tasktix&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=Tasktix_Tasktix)
[![Semgrep](https://github.com/radiantBear/Tasktix/actions/workflows/semgrep.yml/badge.svg)](https://github.com/radiantBear/Tasktix/actions/workflows/semgrep.yml)

Tasktix is a task-tracking tool for power users, providing increased control and
flexibility when creating and scheduling tasks. Most free task tracking tools fall short
when it comes to advanced functionality, either entirely missing them or locking them
behind paywalls. Our goal is to build a comprehensive tool that anyone can use for free
(or even self-host!) to boost efficiency and productivity without those limitations.

## Getting Started

### Dependencies

You will need to install the following software before running Tasktix locally:

- [Docker Engine](https://docs.docker.com/engine/install/) (recommended for Linux) or [Docker Desktop](https://www.docker.com/products/docker-desktop/) (required for MacOS and Windows; optional on Linux for a GUI)
- [Node.js](https://nodejs.org/en/download)

### Setup

Next, you will need to create a `.env` file, filling in the parts `<in_angle_brackets>`

```dotenv
DB_DATABASE=<development_database_name>
DB_PASSWORD=<development_database_root_password>
```

### Usage

To start the development server after following the instructions above, simply run
`npm start`. Any changes you make to the source will be immediately and automatically
reflected on the website. To teardown the Docker container the development server is run
from, run `npm run teardown`. You only need to do this if you want to reclaim the storage
space that's being used by the container image. To simply halt container execution, press
<kbd>Ctrl</kbd> + <kbd>C</kbd> from the shell running `npm start` or run `npm stop`.

### Developing

Some tooling like linting, IntelliSense, etc. requires project `npm` dependencies to be
installed in your development environment. You may want to consider developing using
[VS Code's Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers)
extension or installing just source code on your local machine by running
`npm install --ignore-scripts`.
