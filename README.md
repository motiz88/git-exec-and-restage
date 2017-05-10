# git-exec-and-restage

[![Greenkeeper badge](https://badges.greenkeeper.io/motiz88/git-exec-and-restage.svg)](https://greenkeeper.io/)

[![npm](https://img.shields.io/npm/v/npm.svg)](https://www.npmjs.com/package/git-exec-and-restage)
[![Travis branch](https://img.shields.io/travis/motiz88/git-exec-and-restage/master.svg)](https://travis-ci.org/motiz88/git-exec-and-restage)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

> Safely amend Git commits after applying auto-fixing tools

`git-exec-and-restage` executes a command for you on a set of files. This
command may modify the files (imagine a linter in auto-fix mode, like `prettier
--write` or `eslint --fix`). If the files were fully staged before the command
ran, the changes will be automatically added to the Git index; if they were
_partially_ changed the Git index will remain untouched.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Contribute](#contribute)
- [License](#license)

## Install

```sh
npm install git-exec-and-restage
```

## Usage

Manually e.g. with `prettier`:

```sh
git-exec-and-restage prettier --write -- file1.js file2.js
```

Automatically e.g. with `lint-staged`:

### `package.json`

```json
{
  "scripts": {
    "precommit": "lint-staged"
  },
  "lint-staged": {
    "*.js": ["git-exec-and-restage eslint --fix --"]
  }
}
```

## Contribute

PRs accepted.

## License

MIT © Moti Zilberman
