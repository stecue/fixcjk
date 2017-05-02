#!/bin/bash
# Generate a version of FixCJK that only uses Noto Serif instead of Noto Sans.
SERIF_ONLY=FixCJK_serif.user.js
cat FixCJK?.user.js |sed 's/Noto Sans/Noto Serif/g'|sed 's/Source Han Sans/Source Han Serif/g' > $SERIF_ONLY
sed -i -e 's/Microsoft YaHei/Noto Serif CJK SC/g' $SERIF_ONLY
