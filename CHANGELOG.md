## 0.9.1 (2016-05-18)
Bugfixes:
  - Improvement on the "FixPunct" function. CJK quotation marks seems normal now.

## 0.9.0 (2016-05-18)
Features:
  - (Not Stable Yet!) Add an EXPERIMENTAL implementation to fix CJK quotation marks. Set "FixPunct" to "true" if you want to try. Turn off the script before entering editing area!

Bugfixes:
  - Several regressions related to the quotation format of font-family lists are fixed.

## 0.8.8 (2016-05-17)
Features:
  - (NOT for end users) Add a "debugging" flag to turn on/off font colors.

Bugfixes:
  - Fix a bug that SimSun might be used if the CSS-assigned Latin font cannot be found.

## 0.8.7 (2016-05-17)
Bugfixes:
  - Fix "SimSun" matching for some GB2312 encoded webpages.
  - Fix pattern matching for font lists with redundant/unpaired quotation marks.

## 0.8.5 (2016-05-16)
Features:
  - Check font definitions before applying settings.
