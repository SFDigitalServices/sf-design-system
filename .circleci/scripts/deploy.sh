#!/bin/bash

set -eo pipefail

export PATH=$PATH:/home/circleci/vendor/bin # add terminus to path

git config --global user.email $GH_EMAIL
git config --global user.name $GH_NAME

git clone $CIRCLE_REPOSITORY_URL $CIRCLE_BRANCH

ssh-add -D
ssh-add ~/.ssh/id_rsa_$PANTHEON_SSH_FINGERPRINT
ssh-keyscan -H -p $PANTHEON_CODESERVER_PORT $PANTHEON_CODESERVER >> ~/.ssh/known_hosts

cd $CIRCLE_BRANCH
git checkout $CIRCLE_BRANCH || git checkout --orphan $CIRCLE_BRANCH
GIT_COMMIT_MSG=$(git log --pretty=format:"%h: %s" -n 1)
cp -r .circleci .. # save circleci config
npm install
NPM_PACKAGE_VERSION=$(npm view sf-design-system version)
GIT_TAG=v$NPM_PACKAGE_VERSION
SHORT_SHA=$(git log --pretty=format:"%h" -n 1)
export NODE_ENV=production # exit properly on gulp errors
./node_modules/gulp/bin/gulp.js export # gulp task defined in gulpfile.babel.js to export static reference site
cp -r src .. # copy out src
git rm -rf .
rm -rf node_modules
rm -rf public
mv export/* .
mv ../.circleci . # move circleci config to ignore triggering builds when pushing to gh-pages

git remote add pantheon $PANTHEON_REMOTE
git add -A

terminus -n auth:login --machine-token="$TERMINUS_MACHINE_TOKEN"

if [ $CIRCLE_BRANCH == $SOURCE_BRANCH ]; then
  git commit -m "automated static site deploy: ${GIT_COMMIT_MSG}" --allow-empty
  git push origin -f $SOURCE_BRANCH:$TARGET_BRANCH # push to gh-pages
  git push -f pantheon $SOURCE_BRANCH # push to pantheon master
  git checkout $SOURCE_BRANCH
  git tag -a $GIT_TAG -m "version ${GIT_TAG}: ${GIT_COMMIT_MSG}"
  git push origin $GIT_TAG
else
  git commit -m "build ${CIRCLE_BRANCH} to pantheon remote ci-${CIRCLE_BUILD_NUM}: ${GIT_COMMIT_MSG}" --allow-empty
  # terminus commands
  # do some cleanup
  terminus multidev:list $PANTHEON_SITENAME --format=list --fields=name > multidevs.txt # capture multidevs to file
  MD_COUNT="$(< multidevs.txt wc -l)" # capture the multidev count (# lines in file from above)
  if [ $MD_COUNT -gt 5 ]; then
    echo "Removing older multidevs"
    # remove first 3 multidevs in file list
    head -3 multidevs.txt |
    while read multidev; do
      terminus multidev:delete  --delete-branch -y -- $PANTHEON_SITENAME.$multidev
    done
  else
    echo "No need to remove multidevs.  Count: $MD_COUNT"
  fi
  terminus multidev:create $PANTHEON_SITENAME.dev ci-$CIRCLE_BUILD_NUM
  git push -f pantheon $CIRCLE_BRANCH:ci-$CIRCLE_BUILD_NUM
  terminus auth:logout
fi

# copy src back in, remove unnecessary things, commit, tag, and push
mv ../src .
rm -rf components themes *.html *.txt
git add .
git commit -m "distribution build: ${GIT_COMMIT_MSG}" --allow-empty
git push origin -f $CIRCLE_BRANCH:distribution
git tag -a $GIT_TAG-$SHORT_SHA -m "version ${GIT_TAG}-${SHORT_SHA}: ${GIT_COMMIT_MSG}"
git push origin $GIT_TAG-$SHORT_SHA