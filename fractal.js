'use strict';

/* Require the path module */
const path = require('path');

/* Create a new Fractal instance and export it for use elsewhere if required */
const fractal = module.exports = require('@frctl/fractal').create();

/* Set the title of the project */
fractal.set('project.title', 'San Francisco Digital Services Design System');

/* Tell Fractal where the components will live */
fractal.components.set('path', __dirname + '/src/components');

/* Tell Fractal where the documentation pages will live */
fractal.docs.set('path', __dirname + '/src/docs');

/* Tell the Fractal web preview plugin where to look for static assets. */
fractal.web.set('static.path', path.join(__dirname, '/public/dist'));

fractal.web.set('builder.dest', __dirname + '/build');

// fractal.components.set('default.preview', '@preview');

// /* Add Twig adapter. */
// const twigAdapter = require('@wondrousllc/fractal-twig-drupal-adapter');
// const twig = twigAdapter({handlePrefix: '@components/'});

// fractal.components.engine(twig);
// fractal.components.set('ext', '.twig'); 

module.exports = fractal;