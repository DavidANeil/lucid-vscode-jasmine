# Jasmine Bazel Test Runner README
Allows Jasmine unit tests to be run from the editor using Bazel commands

## Features
Adds 3 CodeLenses to `describes` and `it` statements in files with the extension `.spec.ts`

### Run Test
Runs the test using `bazel test`

### Debug Test
Runs the test using `ibazel run`

### Watch Test
Runs the test using `ibazel test`