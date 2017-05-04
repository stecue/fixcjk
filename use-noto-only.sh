#!/bin/bash
# Generate a version of FixCJK that only uses Noto Serif instead of Noto Sans.
NOTO_ONLY=FixCJK_noto.user.js
cat FixCJK?.user.js |sed 's/Microsoft YaHei/Noto Sans/g' > $NOTO_ONLY
sed -i -e 's/Microsoft YaHei/Noto Serif CJK SC/g' $NOTO_ONLY
