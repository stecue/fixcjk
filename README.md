# FixCJK!
_Fix CJK fonts and punctuations for Chrome and Firefox_

This was orignally developed to workaround the [chromium bug](https://bugs.chromium.org/p/chromium/issues/detail?id=448478). However now one can use this userscript to fix and change CJK fonts as well as Latin fonts. This is especially usefull for Linux users where the system font fallback list might be very confusing (Sometime you can hardly predict what is the *actual font* for Sans or Serif in Chrome/Chromium/Firfox!) and common web fonts assigned in the CSS list are often missing.

Another goal of this script is to fix the CJK punctuations. Unicode assigns the same code for some CJK and Latin punctuations while they have different glyphs in CJK than in Latin. I call them "conflicting punctuations", and double and single curved quotation marks are among the most notable examples. Therefore simply using a single Latin/CJK font fallback list set in CSS cannot give the desired results. Currently the CJK quotation marks are identified and treated seperately from other CJK text using the font defined in variable `CJKPunct`. Other less-used conflicting CJK punctuations will be fixed in future versions.

## Usage
Currently, just change variabl definations from `CJKdefault` to `FixPunct`.
