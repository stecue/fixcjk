#!/bin/bash
#
# Run this script at the home path of the FixCJK project 
# to repack the js source code.
#
# Usage: sh repack.py
#

pushd .
ujs='FixCJK!.user.js'
if [ ! -d src ];then
    echo "Error: src not found!"
    exit
fi
#Make sure we are in the src file before repacking
cd src && repack.py "$ujs"
popd
#Copy the packed file to the "home" folder of the project
cp -f "src/$ujs" ./
#generate different flavors
for currFlavor in util/use*sh;do
    sh "$currFlavor"
done
