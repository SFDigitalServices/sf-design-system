#!/bin/bash

set -eo pipefail

# add terminus to path
export PATH="$PATH:/home/circleci/vendor/bin"

git config --global user.email "$GH_EMAIL"
git config --global user.name "$GH_NAME"

git clone $CIRCLE_REPOSITORY_URL $CIRCLE_BRANCH
cd $CIRCLE_BRANCH

git checkout $CIRCLE_BRANCH || git checkout --orphan $CIRCLE_BRANCH

GITHUB_REPO="$CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME"
GIT_COMMIT_MSG=$(git log --pretty=format:"%h: %s" -n 1)
NPM_PACKAGE_VERSION=$(npx fx package.json .version)
GIT_TAG="v$NPM_PACKAGE_VERSION"
SHORT_SHA="${CIRCLE_SHA1:1:7}"

# tag $SOURCE_BRANCH with version
if [ $CIRCLE_BRANCH == $SOURCE_BRANCH ]; then
  echo "Attempting to git tag as '$GIT_TAG'. Failure probably means the tag already exists.  Be sure to bump the package.json version."
  git tag -a $GIT_TAG -m "version [$GIT_TAG] $GIT_COMMIT_MSG"
  git push origin $GIT_TAG
fi

ssh-add -D
ssh-add ~/.ssh/id_rsa_$PANTHEON_SSH_FINGERPRINT
ssh-keyscan -H -p $PANTHEON_CODESERVER_PORT $PANTHEON_CODESERVER >> ~/.ssh/known_hosts

# static site build and deploy
npm install
NODE_ENV=production npm run export
cp -r src .. # copy out src to bring back in later for distribution branch
cp -r .circleci ..
git rm -rf .
rm -rf node_modules
rm -rf public
mv export/* .
mv ../.circleci . # move circleci config to ignore triggering builds when pushing to gh-pages

git remote add pantheon $PANTHEON_REMOTE
git add -A

terminus -n auth:login --machine-token="$TERMINUS_MACHINE_TOKEN"

if [ $CIRCLE_BRANCH == $SOURCE_BRANCH ]; then
  git commit -m "automated static site deploy: $GIT_COMMIT_MSG" --allow-empty
  git push origin -f $SOURCE_BRANCH:$TARGET_BRANCH # push to gh-pages
  git push -f pantheon $SOURCE_BRANCH # push to pantheon master

  # copy src back in, remove unnecessary things, commit, tag, and push distribution branch
  GIT_DIST_TAG=$GIT_TAG-dist
  GIT_DIST_MSG="distribution build. version [$GIT_DIST_TAG] $GIT_COMMIT_MSG"
  cp -r ../src .
  rm -rf *.txt
  rm -rf components themes *.html
  git add -A
  git commit -m "$GIT_DIST_MSG" --allow-empty
  git push origin -f "$SOURCE_BRANCH:distribution"
  git tag -a $GIT_DIST_TAG -m "$GIT_DIST_MSG"
  git push origin $GIT_DIST_TAG
else
  site_id="ci-$CIRCLE_BUILD_NUM"
  git commit -m "build branch '$CIRCLE_BRANCH' to pantheon remote $site_id: $GIT_COMMIT_MSG" --allow-empty

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
    echo "No need to remove multidevs. Count: $MD_COUNT"
  fi

  terminus multidev:create $PANTHEON_SITENAME.dev $site_id
  git push -f pantheon $CIRCLE_BRANCH:ci-$CIRCLE_BUILD_NUM
  terminus auth:logout

  site_url="https://$site_id-sfdesignsystem.pantheonsite.io"

  # usage: hub METHOD url "{data}"
  function github {
    curl -u "${GH_ACCESS_USER-aekong}:$GH_ACCESS_TOKEN" \
      -X "${1-POST}" -H "Content-Type: application/json" \
      -d "$3" \
      "https://api.github.com/repos/${GITHUB_REPO}${2}"
  }

  github POST "/statuses/$CIRCLE_SHA1" '{"context":"preview site","state":"success","target_url":"'"$site_url"'","description":"preview deployed"}'

  # comment on commit with review site
  # github POST "/commits/$CIRCLE_SHA1/comments" '{"body":"'"review site: $site_url"'"}'
fi
