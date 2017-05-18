#!/bin/bash
#
# Run this script at the home path of the FixCJK project 
# to unpack the js source code.
#
# Usage: sh unpack.py
#
pushd .
ujs='FixCJK!.user.js'
if [ ! -e "$ujs" ];then
    echo "Error: User JS not found!"
    exit
fi
if [ ! -d src ];then
    mkdir src
fi
#Make sure we are in the src file before deleting anything
cd src && rm -rf ./*
cp "../$ujs" ./ && unpack.py "$ujs" && rm "$ujs"
#Go back go the initial path
popd
