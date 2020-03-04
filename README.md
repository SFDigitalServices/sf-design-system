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

The design system is distributed as [SCSS] source files, which must be imported and built with a [Sass] compiler.

## Development

The development environment for this project is [Fractal](https://fractal.build/). To run it, clone the repository and run:

1. `npm install` to install the development dependencies
2. `npx gulp fractal` to run the development server and view the Fractal site in your browser

Modifying any of the `.scss`, `.html`, or `.yml` files in the `src` directory should prompt Fractal to refresh your browser automatically.

### Compiling assets

You can compile all of the CSS and JavaScript assets with:

```
npm run build
```

This will create a `public/dist` directory containing `css/all.css` and `js/all.js`.

[sfgov]: https://sf.gov/
[digital services]: https://digitalservices.sfgov.org/
[sass]: https://sass-lang.com/
[scss]: https://sass-lang.com/documentation/syntax#scss
[npm]: https://docs.npmjs.com/about-npm/
