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
cp -r .circleci .. # save circleci config
npm install
./node_modules/gulp/bin/gulp.js export # gulp task defined in gulpfile.babel.js
git rm -rf .
rm -rf node_modules
rm -rf public
mv export/* .
mv ../.circleci . # move circleci config to ignore triggering builds when pushing to gh-pages

git remote add pantheon $PANTHEON_REMOTE
git add -A

terminus -n auth:login --machine-token="$TERMINUS_MACHINE_TOKEN"

if [ $CIRCLE_BRANCH == $SOURCE_BRANCH ]; then
  git commit -m "Automated deploy to gh pages: ${CIRCLE_SHA1}" --allow-empty
  git push origin -f $SOURCE_BRANCH:$TARGET_BRANCH
  git push -f pantheon $TARGET_BRANCH:master # push to pantheon master
else
  git commit -m "build ${CIRCLE_BRANCH} to pantheon remote ci-${CIRCLE_BUILD_NUM}: ${CIRCLE_SHA1}" --allow-empty
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