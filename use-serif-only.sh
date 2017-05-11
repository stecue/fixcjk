#!/bin/bash
# Generate a version of FixCJK that only uses Noto Serif instead of Noto Sans.
SERIF_ONLY=FixCJK_serif.user.js
cat FixCJK_noto.user.js |sed 's/Noto Sans/Noto Serif/g'|sed 's/Source Han Sans/Source Han Serif/g' > $SERIF_ONLY
#Noto Serif CJK SC only has Light instead of DemiLight.
sed -i -e 's/ *DemiLight//g' $SERIF_ONLY
