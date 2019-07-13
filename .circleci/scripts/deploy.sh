#!/bin/bash

set -eo pipefail

if [ $CIRCLE_BRANCH == $SOURCE_BRANCH ]; then
  git config --global user.email $GH_EMAIL
  git config --global user.name $GH_NAME

  git clone $CIRCLE_REPOSITORY_URL gh-pages
  cd gh-pages
  git checkout $TARGET_BRANCH || git checkout --orphan $TARGET_BRANCH
  git rm -rf .
  cd ..

  ./node_modules/gulp/bin/gulp.js build
