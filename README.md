# FixCJK!
_Fix CJK fonts and punctuations for Chrome and Firefox_

This was orignally developed to workaround a [chromium bug](https://bugs.chromium.org/p/chromium/issues/detail?id=448478). However now one can use this userscript to fix and change CJK fonts as well as Latin fonts. This is especially usefull for Linux users where the system font fallback list might be very confusing (Sometime you just can NOT predict what is the *actual font* for Sans or Serif in Chrome/Chromium/Firfox if you are not an expert on [Fontconfig](https://www.freedesktop.org/software/fontconfig/fontconfig-user.html)!) and common web fonts assigned in the CSS list are often missing. Windows users can also use this script to change/substitue webpage fonts (especially the dated **SimSun** bitmap font) on-the-fly.

Another goal of this script is to fix the CJK punctuations. Unicode assigns the same code for some CJK and Latin punctuations while they have different glyphs in CJK than in Latin. I call them "conflicting punctuations", and double and single curved quotation marks are among the most notable examples. Therefore simply using a single Latin/CJK font fallback list set in CSS cannot give the desired results. Currently, the font for CJK quotation marks as well as other full-width CJK punctuation marks are defined in `CJKPunct`. The letter-space is adjusted for consecutive marks containing CJK quotation marks. More letter-space adjustment might be added in the future.

## Usage
Currently, just change variable definitions from `CJKdefault` to `FixPunct`.
