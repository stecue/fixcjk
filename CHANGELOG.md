## 0.13.0 (2016-06-11)
Features:
  - Double-click to add spaces.
  - Use "justify" as the default align.

Bugfixes:
  - Fix a bug in fixing "reverse-paired" marks. The function is too buggy and disabled by default.
  - Blank spaces at the beginning of a line is not deleted anymore.

## 0.12.5 (2016-06-10)
Features:
  - Use the asynchronous feature to fire re-checking after other events are done.
  - Add more timers.
  - Modify SimSun search pattern to match more styles.

Bugfixes:
  - Turn off the debug flags in the "release" version to restore the performance.

## 0.12.3 (2016-06-09)
Features:
  - Add "lang=zh" attibute to fixed DOM nodes. Better layout with Firefox.
  - "Blank space removing" is more accurate.
  - Try to fix mispaired CJK quotation marks.
  - Also "squeeze" individual CJK quotation marks.

Bugfixes:
  - Several bugfixes during code cleaning up.

## 0.12.0 (2016-06-08)
Features:
  - Fixing fonts and letter-spacing are separated, shorter but much better fixing methods can be used.
  - The length limit of consecutive punctuation marks is full removed.

Bugfixes:
  - A lot of bugs have been fixed thanks to the new multi-pass implementation.

## 0.11.5 (2016-06-07)
Bugfixes:
  - Various bugfixes thanks to a partial rewriting/cleaning up.

## 0.11.2 (2016-06-06)
Features:
  - Add a webpage repairing framework. Currently it can fix the picture problem after applying "forced fixing". Other webpage repairings can be added in the future.

Bugfixes:
  - Some previously omitted combinations are taken into account.
  - Fixing is skipped if child(type==3).data contains only blank spaces.

## 0.11.0 (2016-06-05)
Features:
  - Add a safer recursion implementation which is used as default.
  - A new "long-click-to-force-fix-punctuations" feature is added.

## 0.10.8 (2016-06-03)
Features:
  - Code cleaning up. Add a flag (`debug_verbose`) to control whether more information should be shown.

## 0.10.7 (2016-06-02)
Features:
  - Continue to optimize the selection rules in the "click to check" function.

Bugfixes:
  - Various bugs caused by punctuation marks in tags are fixed.

## 0.10.5 (2016-06-01)
Features:
  - Continue to optimize the selection rules in the "click to check" function.

Bugfixes:
  - The "processed ”" is taken into account in the "two consecutive marks" part. More "processed" marks will be considered later.

## 0.10.4 (2016-06-01)
Features:
  - Optimize the selection rules in the "click to check" function.
  - Skip English/Latin sites when adding the onClick event listener.

Bugfixes:
  - Add `float:none` to `style` to prevent position changes of punctuation marks.
  - The onClick listener was conflicting with scripts on some websites, fixed now.
  - Quotation marks winthin tags are now treated correctly.
  - `<BODY>` is now in the `SkippedTags` list.

## 0.10.0 (2016-05-31)
Features:
  - Add an "onClick" event to `document`. Punctuations will be re-checked if click on anywhere of a webpage.

Bugfixes:
  - Fix a bug related to context with blank space.

## 0.9.17 (2016-05-29)
Features:
  - Apply CJK filter first to speed up.

Bugfixes:
  - More punctuation combinations are taken into account.

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
