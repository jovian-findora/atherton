#!/bin/bash

src_build="/var/www/atherton/react/build"
domain="forge.atherton.finance"
if [ ! -d "${src_build}" ]; then
  echo "No dist bundle to publish for ${src_build}"
else
  rm -rf "/var/www/${domain}";
  mv "${src_build}" "/var/www/${domain}";
fi
