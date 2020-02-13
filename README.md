# Jasmine Bazel Test Runner README
Allows Jasmine unit tests to be run from the editor using Bazel commands

## Features
Adds 2 CodeLenses to `describe` and `it` statements in files with the extension `.spec.ts`

### Run Test
Runs the test using `bazel test`

### Debug Test
Runs the test using `ibazel run`

## Configuration

### `terminal`
Choose between `active`, `dedicated`, or `new`, terminal for running the commands in.

### `cd`
If `true`, adds a `cd ${workspace.uri.path}` to the command, allowing the command to succeed in terminals that are open to places other than the workspace directory.

### `matcher`
A regular expression that will be additionally searched for matching function calls.
The first capture group of the regex will be used as the specFilter.

### `ruleName`
The name of the bazel rule to invoke in the package that owns the current source file.
Defaults to `specs`

### `noHistory`
Prefixes the cmdline with a space character which prevents it from appearing in your bash history.