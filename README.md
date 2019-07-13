[![CircleCI](https://circleci.com/gh/SFDigitalServices/sf-design-system/tree/master.svg?style=svg)](https://circleci.com/gh/SFDigitalServices/sf-design-system/tree/master)

# SFGOV Pattern Library.

This project is based off [Fractal](https://fractal.build/), with an [adapter for Twig.](https://github.com/WondrousLLC/fractal-twig-drupal-adapter)

## Dependencies

- [NodeJS](https://nodejs.org/)

## Getting Started

1. `npm install`

2. `gulp fractal` (You might need to re-install with `npm install gulp -g`)

### Documentation

- Edit the preview layout's `<head>` in `/components/preview.twig`.
- Edit pattern markup and placeholder data in `components`.
- Edit styles, JS and images in `public`
- Add or edit Markdown files to `docs` to document the usage and context of each pattern.

All changes in `/public/` automatically compile to `/public/dist`.
