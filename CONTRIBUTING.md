Every contribution are welcomed as long as few rules are followed.

# TL;DR

- Branch off `devel`.
- Only one feature per commit.
- In case of changes request, amend your commit to avoid multiple commits.
- Run `make test` after coding to ensure Javascript code style is respected
and all tests are passing.
- Write unit tests as much as possible so we can easily check your code.

# How to contribute

- If you're thinking about a new feature, see if there's already an issue open
about it or please open one otherwise.
- One commit per feature.
- Branch off the `devel` branch.
- Test your code with unit tests and use `make test` to run them all.
- If we ask for a few changes, please amend your commit rather than creting new
commits.

## How to start coding ?

1. Edit the config file `server/config/environment/development.js` and enter
the backend that must be used.
2. Run `make install` to install required dependencies.
3. Run `make dev` to start the development server. It should automatically open
the client in your browser when ready.

## Testing

Running `npm test` will run the unit tests with karma.
Notice that no test are available yet. Feel free to add some.

# Branches

- `master` still contains a stable version of the code. Releases are tagged
from this branch.
- `devel` contains all changes in the current development version. Don't use
this code in production since it might break it.

# Licensing for new files

`cerberus-ux` is licensed under GNU GPL v3 license. Anything
contributed to `cerberus-ux` must be released under this license.
