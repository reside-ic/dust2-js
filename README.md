# dust2-js

JavaScript* for [dust2](https://github.com/mrc-ide/dust2)

**TypeScript*

## Testing

Run tests: `npm run test`.

Run tests with coverage: `npm run coverage`

## Formatting

Run formatting check without making changes: `npm run format-check`.

Run formatting with automatic corrections applied: `npm run format-write`.

Formatting uses [prettier](https://prettier.io/), and is configured in the `prettier` section of `package.json`.

## Lint

Code linting is done separately from format checks, with `npm run lint`.

Lint config is in `eslint.config.js`.

## Build

Build for distribution with `npm run build`.

## Documentation

Docs are built with [Typedoc](https://typedoc.org) with the [copy-doc](https://www.npmjs.com/package/@reside-ic/typedoc-plugin-copy-doc) plugin.
Pushes to the main  branch update a Github Pages site at https://reside-ic.github.io/dust2-js with the latest docs. New code which is exported
should be documented with [TSDoc](https://tsdoc.org) comments.


