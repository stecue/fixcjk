# FixCJK-Util
The folder contains a set utilities to build and configure FixCJK!.user.js.

## `use-noto-only.sh` and `use-serif-only.sh`
Scripts to generate "Noto-only" version of FixCJK. Do not ran them directly, ran `unpack.sh` and `repack.sh` in the home folder instead.

## `unpack.sh` and `repack.sh`
Unpack FixCJK!.user.js to seperate functions and folders and repack them. Usefull if you want to hack the code. Do not run the scripts here but run them in the home folder instead.

You need to have python3 installed and the actuall work is done by the scripts in [ujsrepack](https://github.com/stecue/ujsrepack). Install [unpack.py](https://github.com/stecue/ujsrepack/blob/master/unpack.py) and [repack.py](https://github.com/stecue/ujsrepack/blob/master/repack.py) to a folder in your `PATH` variable.

## `set-default-cjk-fonts.sh`
Set the default CJK fonts for Linux. It will generate a per-user fontconfig setting file and won't affect the system settings.
