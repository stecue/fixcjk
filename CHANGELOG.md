## 1.3.15 (2019-07-10)
Bugfixes:
  - Fixed the incompatibility issue with Greasemonkey 4 (using a workaround for now).

## 1.3.14 (2019-03-14)
Bugfixes:
  - Disabled FixCJK on *.wolframcloud.com

## 1.3.13 (2018-12-03)
Bugfixes:
  - Disabled FixCJK on bilibili players.

## 1.3.12 (2018-06-09)
Bugfixes:
  - Disabled FixCJK on some windows live websites.

## 1.3.11 (2018-01-10)
Bugfixes:
  - Fixed issue #129.

## 1.3.10 (2017-11-24)
Features/Bugfixes:
  - Added "Source Han Serif Regular" according to issue #127.

## 1.3.9 (2017-05-19)
Features/Bugfixes:
  - Speed slightly increased by labeling the newest elements first.
  - Other bugfixes.

## 1.3.7 (2017-05-11)
Features/Bugfixes:
  - Use font-face to disable YaHei for ASCII characters.
  - Add use-noto-only.sh to generte the "Noto Sans" only flavor.
  - Use better method to only fire ReFix after scolling is stopped.

## 1.3.5 (2017-04-19)
Bugfixes:
  - Changed the implementation of "SkippedLangs" so that the inital lang=en pages
    can still be checked by long click or double click.

## 1.3.4 (2017-04-18)
Bugfixes:
  - Fix a bug that prevents recognizing ending "”(\u201D)".

## 1.3.3 (2017-04-17)
Bugfixes:
  - Correct font list (Thanks to @Explorare)
  - Drop using unicode PUA in font signatures to fix issue #113.
  - Some bugfixes related to the `FixPunct`.
  - Partial support for "space between PMs CJK characters".

## 1.3.0 (2017-04-16)
Features/Bugfixes:
  - Official support for Janpanese font settings.

## 1.2.15 (2017-04-14)
Bugfixes:
  - Fix some bugs which prevent correct rendering for lang=ja elements in 1.2.12.
  - Use "Element.closest()" to get the accurate lang attribute.

## 1.2.12 (2017-04-13)
Features:
  - Kana fonts can be set now.(`KanaSans` and `KanaSerif`)
  - Japanese fonts can be set for `lang=ja` elements as well.
  - Turn `usePaltForCJKText` to `on` by default because it only affects kanas and
    won't affect other CJK characters.
  - add `LatinDefault` so that the font won't fallback to `LatinInSimSun` if not found.

## 1.2.9 (2017-04-11)
Features/Bugfixes:
  - Use custom attributes to avoid messing up with HTML classes.
  - Do not getAfterHTML and getBeforeHTML for the right- and left-floated elements.
  - Add "skipJaLang" option to control whether to skip Japanese contents or not.
  - Add Source Han to the font fallback list.

## 1.2.3 (2017-04-08)
Features/Bugfixes:
  - Force justify aligment on zhihu.com.
  - More flexible noWrappingClasses.
  - Add `scrollToFixAll` option.

## 1.2.0 (2017-04-06)
Features:
  - Smarter punctuation mark kerning based on Noto Sans/Source Hans's "palt" property.
  - Further speed optimization.
  - Enable autosapce by default. No need to double-click.
  - More settings such as the size of space and "enable palt for all CJK text".

Bugfixes:
  - Disable script on Japanese webpages. (Issue #100)
  - Force applying PM fonts to work with webpages using "!important".
  - Some bugs caused by the old PM engine.
  - Other bugfixes. See "Issues" for more.

## 1.1.10 (2017-03-09)
Bugfixes:
  - Remove "// @match             file:///*" to enable the script again with greasemonkey.

## 1.1.9 (2016-08-23)
Bugfixes:
  - Compatible with MathJax.

## 1.1.8 (2016-07-27)
Features/Bugfixes:
  - Add "PT Sans" and "PT Serif" to the font list.
  - More "excludes".

## 1.1.7 (2016-07-23)
Bugfixes:
  - No longer label as CJK if only quotation marks are detected.

## 1.1.6 (2016-07-22)
Bugfixes:
  - Restore the ability to use SimSun or SimHei if NotoSans is not installed.

## 1.1.5 (2016-07-17)
Bugfixes:
  - Avoid multiple wraps for "font" elements.

## 1.1.4 (2016-07-13)
Bugfixes:
  - Check more before adding "FontsFixedE137" in Round 3.

## 1.1.3 (2016-07-12)
Bugfixes:
  - Do not wrap CJK if not puncts to fix and no spaces to add.
  - Disable running on dnf.qq.com/main.shtml pages for now.
  - Double check SimSun2Fix.

## 1.1.2 (2016-07-05)
Bugfixes:
  - Add more tags to the "SkippedTagsForMarks" list.

## 1.1.1 (2016-07-02)
Bugfixes:
  - Fix the broken anchors to javascripts.

## 1.1.0 (2016-07-01)
Features:
  - (For Debugging Only) Long-click to force testing and labeling all elements.

Bugfixes:
  - Fix the performance issue of `addSpaces()`.
  - Improve the performance of `labelCJK()`.

## 1.0.5 (2016-06-29)
Bugfixes:
  - Hidden elements can be deteced now, even if they are hidden inside an inline element.
  - Disable punct/space fixing for "contentEditable" elements.
  - No longer adding extra spaces in some cases.
  - Restrict the use of recursive CJK labeling to prevent overshoot.
  - Add more timer to mitigate the slow checking on some websites.

## 1.0.0 (2016-06-27)
Features:
  - A new "event-listener-friendly" algorithm is implemented. Dynamic contents should not be broken by the script any more.
  - Scroll to apply font settings.
  - The "Long-click to force correction" method is no longer needed and dropped.
  - "See through" tags to accurately determine what corrections should be applied.
  - Much faster rechecking and refixing.

Bugfixes:
  - Numerial bugfixes thanks to the new structure and algorithm.

## 0.15.0 (2016-06-19)
Features:
  - Add a "banned classes" mechanism to better control elements.
  - More site-specific rules.

## 0.14.3 (2016-06-17)
Features:
  - Limit the tags that can be ignored while adding spaces to prevent unwanted effects.
  - Ignore some tags such as `math` to speed up.
  - Use custom settings for mediawiki contents.

Bugfixes:
  - `&nbsp;` is taken into account as `[\s]` or `[\u0020\u00A0]`.
  - Do not add extra spaces between CJK and Latin quotation marks if the context is in SimSun.

## 0.14.0 (2016-06-15)
Features:
  - Rewrite SimSun selector and more SimSun fonts can be captured.
  - Rewrite the "signature" mechenism and the SimSun/mono filter for space adding.
  - New replacing method of SimSun/SimHei. More ASCII/UNICODE figures are supported.
  - Use `span` instead of blank spaces while inserting spaces.
  - Do not replace SimSun if font-size > 18px.

Bugfixes:
  - Several bugfixes thanks to the new selector.

## 0.13.2 (2016-06-15)
Bugfixes:
  - Fix a regression which prevents "forced recheck".

## 0.13.1 (2016-06-13)
Bugfixes:
  - Use narrow non-break space instead of thin space.

## 0.13.0 (2016-06-11)
Features:
  - Double-click to add spaces.
  - Use "justify" as the default align.
  - Also squeeze the first CJK quotation marks.

Bugfixes:
  - Fix a bug in fixing "reverse-paired" marks. The function is too buggy and disabled by default.
  - Blank spaces at the beginning of a line is not deleted anymore.
  - Elements without text nodes can also be fixed.

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
