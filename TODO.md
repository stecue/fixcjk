* ~~Use multiple passes to separate fonts and "kerning". (This can be done through PUA.  `"`to`\uEXXX`to`<span>"</span>`.)~~
* ~~Use only left-left, left-right (and right-right?) to deal with consec puncts.~~
* ~~Preserve the tables drawing symbols in SimSun/pre.~~
* ~~Add a "preserved Tags" class. `code`, `tt` are generally safe but the format should be preserved.~~
* Change italic CJK to other fonts.
* ~~Fix the "SAFED by USER" rule.~~
* ~~Fix the "nomore spaces rule" on some pages,e.g. sciencenet.cn.~~
* Fix the "dangling punctuations".
* Add `&#8203;` before and after slash?
* Add a "half-safe" class for `div`?
* Add variable length space to the end of each paragraph? (seems no harm to add a `br` before `p`?)
* Also encapsulate Latin QM if context is in SimSun?
* Use BFS to traverse the DOM tree?
