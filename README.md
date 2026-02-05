# Tasktix

[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=Tasktix_Tasktix&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=Tasktix_Tasktix)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=Tasktix_Tasktix&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=Tasktix_Tasktix)
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

### Usage

To start the development server after following the instructions above, simply run
`npm start`. Any changes you make to the source will be immediately and automatically
reflected on the website. To teardown the Docker container the development server is run
from, run `npm run teardown`. You only need to do this if you want to reclaim the storage
space that's being used by the container image. To simply halt container execution, press
<kbd>Ctrl</kbd> + <kbd>C</kbd> from the shell running `npm start` or run `npm stop`.
