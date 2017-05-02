#!/bin/bash
#
# Use this script to set the default fallback Noto fonts for CJK characters
# if no "lang" is present.
#
# It should work for any application that honors `fontconfig` settings.
#

if [ `grep -R 'include.*xdg.*fontconfig\/conf.d' /etc/fonts/ |wc -l` -lt 1 ]
then
    echo "Cannot find a proper directory to put fontconfig setting file, nothing will be done..."
    exit
fi
FCDIR=$HOME/.config/fontconfig/conf.d
if [ ! -d "${FCDIR}" ]
then
    mkdir -p "${FCDIR}"
fi
pushd .
cd "${FCDIR}"
popd
