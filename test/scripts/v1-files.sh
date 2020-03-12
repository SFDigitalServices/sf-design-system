#!/bin/bash

missing=()
for path in $(cat test/fixtures/v1-files.txt); do
  if [ ! -e $path ]; then
    missing+=("$path")
  fi
done

count=${#missing[@]}
if [ $count != 0 ]; then
  [[ $count = 1 ]] && s="" || s="s"
  echo "Missing the following $count file$s:"
  for path in $missing; do
    echo "- $path"
  done
  exit 1
fi

