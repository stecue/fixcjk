#!/bin/bash
#
# Use this script to set the default fallback Noto fonts for CJK characters
# if no "lang" is present.
#
# It should work for any application that honors `fontconfig` settings.
#
# Usage: ./set-default-cjk-fonts.sh --sans 'Noto Sans CJK SC' --serif 'Noto Serif CJK SC'
allinput="$@"
function getFONT {
    #the input should be `getFONT {--sans|--serif|--mono}`
    str_after=`echo ${allinput}|sed -e 's/.*\('$1'.*\).*/\1/g'`
    str_after=`echo ${str_after}|sed -e 's/'$1'[ ]*//g'`
    str_font=`echo ${str_after}|sed -e 's/ *--.*//g'`
    echo $str_font
}
defaultSANS=$(getFONT --sans)
defaultSERIF=$(getFONT --serif)
defaultMONO=$(getFONT --mono)
validate () {
    finput="$1"
    ffamily=$(fc-match "$finput"|tr '"' ':'|cut -d':' -f3)
    if [ x"$ffamily" = "x$finput" ]
    then
        echo "good"
    else
        echo "bad"
    fi
}
if [ x"$(validate "$defaultSANS")" != 'xgood' ]
then
    echo "Bad sans font!"
    exit
elif [ x"$(validate "$defaultSERIF")" != 'xgood' ]
then
    echo "Bad serif font!"
    exit
elif [ x"$(validate "$defaultMONO")" != 'xgood' ]
then
    echo "Bad mono font!"
    exit
else
    echo "Validated fonts are:"
    echo "Default sans for CJK: $defaultSANS"
    echo "Default serif for CJK: $defaultSERIF"
    echo "Default mono for CJK: $defaultMONO"
    echo "Making .conf files..."
fi
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
#We may need to output to a temp file first to avoid complains from fc-*.
outtmp=`mktemp --tmpdir fixcjk.XXXXX`
outconf="60-family-prefer-fixcjk.conf"
cat > $outtmp <<EOF
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>

<!--
  Set fonts to be preferred when the standard aliases "serif", "sans-serif",
  and "monospace" are used.
-->
EOF
tmpsans=`mktemp --tmpdir fixcjk.XXXXX`
latin_sans=`mktemp --tmpdir fixcjk.XXXXX`
tmpserif=`mktemp --tmpdir fixcjk.XXXXX`
latin_serif=`mktemp --tmpdir fixcjk.XXXXX`
tmpmono=`mktemp --tmpdir fixcjk.XXXXX`
latin_mono=`mktemp --tmpdir fixcjk.XXXXX`
tmptmp=`mktemp --tmpdir fixcjk.XXXXX`
#Get the default sans/serif/mono fonts
fc-match -s -f "%{file}\n" sans > $tmpsans
fc-match -s -f "%{file}\n" serif > $tmpserif
fc-match -s -f "%{file}\n" monospace > $tmpmono
#Remove .pfb and .pfa files
for currtmpf in "$tmpsans $tmpserif $tmpmono"
do
    sed -i -e '/\.pfb/d' $currtmpf
    sed -i -e '/\.pfa/d' $currtmpf
done

#check for latin/non-latin fonts
while read nonCJK
do
    ifCJK=`fc-query -f "%{lang}" "$nonCJK"|grep -F 'zh' |wc -l`
    if [ $ifCJK -eq 0 ]
    then
        ffamily=`fc-query -f "%{family}\n" "$nonCJK"|head -n1`
        echo "      <string>${ffamily}</string>" >> ${latin_sans}
    fi
done < $tmpsans
#constructing the preference part of .conf file
cat >> $outtmp <<EOF
  <match target="pattern">
    <test name="family">
      <string>sans-serif</string>
    </test>
    <edit name="family" mode="prepend">
EOF
cat ${latin_sans}|uniq > ${tmptmp}
cat ${tmptmp} > ${latin_sans}
echo "$(cat ${latin_sans}|wc -l) sans latin fonts found..."
cat ${latin_sans} >> $outtmp
echo "      <string>${defaultSANS}</string>" >> ${outtmp}
cat >> $outtmp <<EOF
    </edit>
  </match>
EOF

## Now we repeat this for serif fonts
while read nonCJK
do
    ifCJK=`fc-query -f "%{lang}" "$nonCJK"|grep -F 'zh' |wc -l`
    if [ $ifCJK -eq 0 ]
    then
        ffamily=`fc-query -f "%{family}\n" "$nonCJK"|head -n1`
        echo "      <string>${ffamily}</string>" >> ${latin_serif}
    fi
done < $tmpserif
#constructing the preference part of .conf file
cat >> $outtmp <<EOF
  <match target="pattern">
    <test name="family">
      <string>serif</string>
    </test>
    <edit name="family" mode="prepend">
EOF
cat ${latin_serif}|uniq > ${tmptmp}
cat ${tmptmp} > ${latin_serif}
echo "$(cat ${latin_serif}|wc -l) serif latin fonts found..."
cat ${latin_serif} >> $outtmp
echo "      <string>${defaultSERIF}</string>" >> ${outtmp}
cat >> $outtmp <<EOF
    </edit>
  </match>
EOF

## Now we repeat this for monospace fonts
while read nonCJK
do
    ifCJK=`fc-query -f "%{lang}" "$nonCJK"|grep -F 'zh' |wc -l`
    if [ $ifCJK -eq 0 ]
    then
        ffamily=`fc-query -f "%{family}\n" "$nonCJK"|head -n1`
        echo "      <string>${ffamily}</string>" >> ${latin_mono}
    fi
done < $tmpmono
#constructing the preference part of .conf file
cat >> $outtmp <<EOF
  <match target="pattern">
    <test name="family">
      <string>monospace</string>
    </test>
    <edit name="family" mode="prepend">
EOF
cat ${latin_mono}|uniq > ${tmptmp}
cat ${tmptmp} > ${latin_mono}
echo "$(cat ${latin_mono}|wc -l) monospace latin fonts found..."
cat ${latin_mono} >> $outtmp
echo "      <string>${defaultMONO}</string>" >> ${outtmp}
cat >> $outtmp <<EOF
    </edit>
  </match>
EOF

#Finish the .conf file
cat >> $outtmp <<EOF
</fontconfig>

EOF
mv ${outtmp} ${outconf}
rm ${tmpsans}
rm ${tmpserif}
rm ${tmpmono}
rm ${tmptmp}
rm ${latin_sans}
rm ${latin_serif}
rm ${latin_mono}
popd
echo "All done!"
