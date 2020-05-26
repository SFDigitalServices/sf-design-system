# The SF Design System

[![CircleCI](https://circleci.com/gh/SFDigitalServices/sf-design-system/tree/master.svg?style=shield)](https://circleci.com/gh/SFDigitalServices/sf-design-system/tree/master)

This is the CSS design system built by and for the [City & County of San Francisco's][sfgov] [Digital Services] team.

## Installation

You can install the SF design system source files with [npm]:

```sh
npm install sf-design-system
```

This will create a `node_modules/sf-design-system` directory and add `sf-design-system` as a dependency in your project's `package.json`.

## Usage

The design system is distributed as both CSS and [SCSS] source files, which must be imported and built with a [Sass] compiler.

### CSS usage

The easiest way to import the CSS is to link directly to it from [unpkg](https://unpkg.com):

```html
<link rel="stylesheet" href="https://unpkg.com/sf-design-system@^2/public/dist/css/sf-design-system.css">
```

If you're importing the CSS with a JavaScript bundler, you can do so with:

```js
import 'sf-design-system/public/dist/css/sf-design-system.css'
```

### Sass usage

1. Ensure that `node_modules` is in your Sass include path, either with `-I` on
   the command line or via the `includePaths` option.
2. Import the files that you need from `sf-design-system`, e.g.

    ```scss
    @import 'sf-design-system/index.scss';
    // or just variables, mixins, and functions
    @import 'sf-design-system/src/scss/support';
    ```

## Development

The development environment for this project is [Fractal](https://fractal.build/). To run it, clone the repository and run:

1. `npm install` to install the development dependencies
2. `npm start` to run the development server and view the Fractal site in your browser

Modifying any of the `.scss`, `.html`, or `.yml` files in the `src` directory should prompt Fractal to refresh your browser automatically.

### Compiling assets

You can compile all of the CSS and JavaScript assets with:

```
npm run build
```

This will create a `public/dist` directory containing `css/all.css` and `js/all.js`.

### Releases

This project uses [primer/publish] to publish an npm release for every push, depending on branch:

| branch | tag | version |
| :----- | :-- | :------ |
| `master` | `latest` | per `package.json` |
| `release-<version>` | `next` | `<version>-rc.<sha>` |
| all others | `canary` | `0.0.0-<sha>` |

To test a canary or release candidate in another project, just `npm install` the published version, e.g.

```sh
# install the most recently published release candidate
npm install sf-design-system@next

# install from a specific commit, e.g https://github.com/SFDigitalServices/sf-design-system/commit/e4c9704
npnm install sf-design-system@0.0.0-e4c9704
```

## License
[MIT](./LICENSE)

[sfgov]: https://sf.gov/
[digital services]: https://digitalservices.sfgov.org/
[sass]: https://sass-lang.com/
[scss]: https://sass-lang.com/documentation/syntax#scss
[npm]: https://docs.npmjs.com/about-npm/
[primer/publish]: https://github.com/primer/publish#readme
