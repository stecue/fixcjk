#!/bin/bash
# Generate a version of FixCJK that only uses Noto Serif instead of Noto Sans.
NOTO_ONLY=FixCJK_noto.user.js
cp FixCJK?.user.js $NOTO_ONLY
sed -i -e 's/src.local(Microsoft YaHei Bold.*9FBF/src:local(Noto Sans CJK SC Medium)/g' $NOTO_ONLY
sed -i -e 's/src.local(Microsoft YaHei.*9FBF/src:local(Noto Sans CJK SC DemiLight)/g' $NOTO_ONLY
