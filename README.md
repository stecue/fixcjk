# FixCJK!
*全功能、跨平台的中/日文网页字体设定/调整以及中文网页排版修正/美化脚本，“搞定”CJK！*

## 简介
**[FixCJK!](https://github.com/stecue/fixcjk/)** 是为 Gecko&#8203;/&#8203;Webkit&#8203;/&#8203;Blink 内核浏览器编写的用户脚本，适用平台包括但不限于：Firefox&#8203;/&#8203;Icecat&#8203;/&#8203;Chrome&#8203;/&#8203;Chromium&#8203;/&#8203;Opera，以及各种采用 Webkit&#8203;/&#8203;Blink 内核的“国产”浏览器。主要功能为：

1. 强力后备（fallback）字体设置。忽略浏览器和系统设定，直接设定映射为“无衬线（sans-serif）”和“有衬线（serif）”的实际字体列表。对于没有指定具体字体或者英文操作系统环境中的网页有奇效。目前已支持设定中文与日文字体。韩文字体设定俟有需求时亦可添加。
2. 替换中易宋体为矢量字体。除此之外，本脚本并不替换网页指定的第一顺位的字体。
3. 将中英文混排中错误使用了中易宋体的英文部分设置为使用单独的拉丁字体。默认是 Ubuntu Mono（其字符宽度正好是中易宋体的一半并自带良好的 hinting 信息）。
4. 对于矢量粗体，将使用字体文件提供的真粗体而不是合成伪粗体（最初目的是绕过 Linux 版 Chrome&#8203;/&#8203;Chromium 的[这个 bug](https://bugs.chromium.org/p/chromium/issues/detail?id=448478)）。
5. 设定中日文全角标点字体。对于[弯引号](https://www.zhihu.com/question/19616011)，根据上下文自动识别并设定为全角字体。
6. 中文**全角标点压缩**。弥补中文字体标点不自带 kerning 信息的普遍设计缺陷，使中文网页排版更符合印刷惯例并贴近国家标准。**注意**：自 1.1.80 起，本功能将基于 Noto Sans CJK SC/Noto Serif CJK SC 内嵌的 kerning 信息并加以微调。请**务必**下载并安装 [Noto Sans CJK SC](https://www.google.com/get/noto/help/cjk/) 或 [Noto Serif CJK SC](https://noto-website.storage.googleapis.com/pkgs/NotoSerifCJK-Regular.ttc.zip)，或者相应的[思源黑体](https://github.com/adobe-fonts/source-han-sans/blob/release/OTF/SourceHanSansSC.zip)/[宋体](https://github.com/adobe-fonts/source-han-serif/blob/release/OTF/SourceHanSerifTC_EL-M.zip)。
7. 自动空格：中英文之间自动加空格，类似于[这个扩展](https://chrome.google.com/webstore/detail/%E7%82%BA%E4%BB%80%E9%BA%BC%E4%BD%A0%E5%80%91%E5%B0%B1%E6%98%AF%E4%B8%8D%E8%83%BD%E5%8A%A0%E5%80%8B%E7%A9%BA%E6%A0%BC%E5%91%A2%EF%BC%9F/paphcfdffjnbcgkokihcdjliihicmbpd/reviews?hl=zh-CN)。考虑到习惯，自动加空格可以被设置为仅在“**双击**”之后触发。

其中功能 **1-4** 及 **7** 对所有浏览器的所有版本均有效；功能 **5-6** 只保证在最新 Gecko 和 Webkit/Blink 内核上正常工作。

## 用法
### 脚本安装
较新的浏览器都需要附加组件来安装和管理用户脚本。如果您是 Firefox 用户，请先安装 [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)；Chrome&#8203;/&#8203;Chromium 用户，请先安装 [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)；Opera 用户也请安装 [Tampermonkey](https://addons.opera.com/en/extensions/details/tampermonkey-beta/)。其他浏览器用户请参考相应的文档安装适当的附加组件或者插件。之后，请到 [Greasy Fork](https://greasyfork.org/zh-CN/scripts/19812-fixcjk) 或者 [OpenUserJS](https://openuserjs.org/scripts/stecuegmail.com/FixCJK!) 网站安装本脚本的最新稳定版。如果您喜欢超前体验胜过稳定，或者有意帮忙测试，也可以到[GitHub 上的项目主页](https://github.com/stecue/fixcjk/)获取最新[开发分支版本](https://github.com/stecue/fixcjk/tree/master)。

### 相关设置
请**务必**下载安装 [Noto Sans CJK SC](https://www.google.com/get/noto/help/cjk/) 字体（或者[思源黑体](https://github.com/adobe-fonts/source-han-sans/blob/release/OTF/SourceHanSansSC.zip)/[宋体](https://github.com/adobe-fonts/source-han-serif/blob/release/OTF/SourceHanSerifTC_EL-M.zip)）和 [Ubuntu Mono](https://www.google.com/fonts/specimen/Ubuntu+Mono) 字体。默认设置覆盖了大多数 Windows 和 Linux 设备。如果需要自定义设置（包括中英文字体以及修正选项），请直接修改脚本中从`CJKdefault`到`FixPunct`的变量定义。**注意**：自动更新可能会重置你对脚本做的修改。

### 用户控制
在页面初次加载完成时，本脚本自动进行字体与标点的调整。对于初始加载时没有载入的动态内容以及“自动空格”，可以通过以下四种层次的键盘/鼠标操作控制脚本的页面修正行为。这四种操作的效果是逐层递进的。后面一个层次的鼠标操作也将触发之前一个层次的全部页面修正动作。

**滚动换字体**：用键盘或鼠标滚动页面时，将快速检查新出现的元素并设定、替换相应的字体。

**单击修标点**：在网页内任意一点单击，脚本将检查所有新出现的网页元素并进行中文引号识别及全角标点压缩。重新检查允许最小间隔时间默认为 1 到 2 秒。间隔时间过短的连续点击将被忽略。已经修正过的元素不再处理。

**双击加空格**：中英文之间自动加空格，已有空格的不再添加额外空格。**注意**：从`1.2.0`开始，增加`forceAutoSpaces`选项，开启后在页面载入和滚动时就将添加空格（但可能不彻底——这取决于浏览器的脚本执行速度）。双击将对页面元素进行较为彻底的检查并添加之前遗漏的空格。默认开启此选项。

**长击强力检**：（慎用）长按鼠标左键（>1.5秒）再松开后，将忽略一切内建的定时器，强力检查、修正所有新出现或者尚未被检查到的可疑元素。对于页面动态元素超多、长度几乎可以无穷增长的网页（比如知乎首页），在大量新元素出现后首次执行此操作可能会花费数秒乃至更长的时间。一般来说，Windows平台上的Chrome&#8203;/&#8203;Opera最快、耗时最少，Firefox则慢一些。某些Linux发行版中的Firefox可能会尤其慢，请务必慎用此功能！当然，由于所有的修正动作只需检查新出现或者尚未被检查到的可疑元素，长击强力全面检查之后再次进行滚动、单击、双击或者长击操作，会由于不需要检查之前可能超时造成的遗漏元素而更快、更顺畅地完成。

## 已知问题
1. 由于任何页面元素都可能存在需要修正的文本，脚本需要遍历所有元素。尽管作者一直在优化脚本算法，执行时间仍可能过长。为了尽量少影响网页加载时间，脚本内置了定时机制；超时自动退出运行。所以字体和标点修正效果可能和机器配置以及浏览器有关。按`F12`并选择`控制台`（或 `console`）可查看脚本执行日志信息。
2. 由于脚本注入位置的差异，一些看起来并非动态生成的网页元素（比如本项目在 GitHub 上的[中文 Readme 文件](https://github.com/stecue/fixcjk/blob/master/README.md)）在页面载入完成时也可能尚未被修正。此时一般只需单击网页内的任意一点（包含动态效果或者链接的元素除外）即可修正该网页。也可直接双击，触发从字体到中英文空格的全面修正。

## 意见反馈
任何意见或建议，请 [Email](mailto:stecue@gmail.com)、提 issue 或者在知乎私信[@猫立刻](https://www.zhihu.com/people/mol-le-kel)。
