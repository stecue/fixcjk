#!/bin/bash
# Generate a version of FixCJK that only uses Noto Serif instead of Noto Sans.
cat FixCJK?.user.js |sed 's/Noto Sans/Noto Serif/g'|sed 's/Source Han Sans/Source Han Serif/g' > FixCJK_serif.user.js
