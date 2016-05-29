## 0.9.17 (2016-05-29)
Features:
  - Apply CJK filter first to speed up.

Bugfixes:
  - Some minor bugfixes.

## 0.9.15 (2016-05-27)
Features:
  - More fine-grained control of execution time.

## 0.9.14 (2016-05-26)
Features:
  - Add an internal timer to limit the execution time to 3.0 seconds.
  - Do not run CJK punctuation checking on pure Latin pages.

Bugfixes:
  - Some bug fixes related to "）》】".

## 0.9.12 (2016-05-25)
Features:
  - Also squeeze spaces before and after "（）《》".
  - CJKPunct supports fallback list.
  - Allow multiple passes to fully fix punctuations.
  - Add Chinese description.

Bugfixes:
  - Various bugfixes including the picture bug on zhihu.com.

## 0.9.9 (2016-05-23)
Features:
  - Change fonts for some other punctuation marks as well using CSS unicode range (FF 44+).
  - Only consecutive punctuation marks are compressed by default.

Bugfixes:
  - Some minor bug fixes related to unicode.

## 0.9.7 (2016-05-20)
Features:
  - (Not for end user) Use relative letter-spacing.

Bugfixes:
  - HTML symbols (`/&[^&;]+;/`) are correctly treated now.

## 0.9.6 (2016-05-20)
Features:
  - Log execution time to console.

Bugfixes:
  - Punctuation fixing skips HTML elements lik `TITLE` and `HEAD`.

## 0.9.4 (2016-05-19)
Bugfixes:
  - Single and double quotation marks are treated as unified as possbile. Several inconsistency bugs are fixed.

## 0.9.3 (2016-05-19)
Bugfixes:
  - Quotation marks followed by mixed CJK and Latin text are treated as CJK now.
  - Fix a bug leading to unclosed HTML tags. 

## 0.9.2 (2016-05-18)
Features:
  - FixPunct now also delete extra blanck spaces after CJK punctuations
  - FixPunct seems to be stable enough to be turn on by default. Remember to disable the script while editing CJK text.

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
