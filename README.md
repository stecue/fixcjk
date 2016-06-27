## FixCJK!
*全功能、跨平台的中英文网页字体设定/调整以及中文网页排版修正/美化脚本，“搞定”CJK！*

### 简介
**[FixCJK!](https://github.com/stecue/fixcjk/)** 是为 Gecko&#8203;/&#8203;Webkit&#8203;/&#8203;Blink 内核浏览器编写的用户脚本，适用平台包括但不限于：Firefox&#8203;/&#8203;Icecat&#8203;/&#8203;Chrome&#8203;/&#8203;Chromium&#8203;/&#8203;Opera，以及各种采用 Webkit&#8203;/&#8203;Blink 内核的“国产”浏览器。主要功能为：

1. 强力字体设置。忽略浏览器和系统设置，直接强力设定映射为“无衬线（sans-serif）”和“有衬线（serif）”的实际字体列表。
2. 替换中易宋体为矢量字体。
3. 将中英文混排中错误使用了中易宋体的英文部分设置为使用单独的拉丁字体。默认是 Ubuntu Mono（其字符宽度正好是中易宋体的一半并自带良好的 hinting 信息）。
4. 对于矢量粗体，将使用字体文件提供的真粗体而不是合成伪粗体（最初目的是绕过 Linux 版 Chrome&#8203;/&#8203;Chromium 的[这个 bug](https://bugs.chromium.org/p/chromium/issues/detail?id=448478)）。
5. 设定中文全角标点字体。对于[弯引号](https://www.zhihu.com/question/19616011)，根据上下文自动识别并设定为全角字体。
6. 中文**全角标点压缩**。弥补中文字体标点不自带 kerning 信息的普遍设计缺陷，使中文网页排版更符合印刷惯例并贴近国家标准。
7. 自动空格：中英文之间自动加空格，类似于[这个扩展](https://chrome.google.com/webstore/detail/%E7%82%BA%E4%BB%80%E9%BA%BC%E4%BD%A0%E5%80%91%E5%B0%B1%E6%98%AF%E4%B8%8D%E8%83%BD%E5%8A%A0%E5%80%8B%E7%A9%BA%E6%A0%BC%E5%91%A2%EF%BC%9F/paphcfdffjnbcgkokihcdjliihicmbpd/reviews?hl=zh-CN)。

其中功能 **1-4** 及 **7** 对所有浏览器的所有版本均有效；功能 **5-6** 只保证在最新 Gecko 和 Webkit/Blink 内核上正常工作。

### 用法
####脚本安装####
较新的浏览器都需要附加组件来安装和使用脚本。如果您是 Firefox 用户，请先安装 [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)；Chrome&#8203;/&#8203;Chromium 用户，请先安装 [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)；Opera 用户也请安装 [Tampermonkey](https://addons.opera.com/en/extensions/details/tampermonkey-beta/)。之后，请到 [Greasy Fork](https://greasyfork.org/zh-CN/scripts/19812-fixcjk) 或者 [OpenUserJS](https://openuserjs.org/scripts/stecuegmail.com/FixCJK!) 网站安装本脚本的最新稳定版。

####字体设置####
推荐下载安装 [Noto Sans CJK SC](https://www.google.com/get/noto/help/cjk/) 字体和 [Ubuntu Mono](https://www.google.com/fonts/specimen/Ubuntu+Mono) 字体。默认设置覆盖了大多数 Windows 和 Linux 设备。如果需要自定义设置（包括中英文字体以及修正级别），请直接修改脚本中从`CJKdefault`到`FixPunct`的定义。**注意**：自动更新可能会重置你对脚本做的修改。

####鼠标操作####
在页面初次加载完成时，本脚本自动进行字体与标点的调整。对于初始加载时没有载入的动态内容以及“自动空格”，可以通过以下三种层次的鼠标操作进行页面修正。这三种操作的效果是逐层递进的。后面一个层次的鼠标操作也将触发之前一个层次的全部页面修正动作。
**滚动换字体：**
**单击修标点：**在网页内任意一点单击，脚本将重新检查所有需要修正的网页元素。重新检查允许最小间隔时间默认为 1 到 2 秒。间隔时间过短的连续点击将被忽略。
**双击加空格：**中英文之间自动加空格，已有空格的不再添加额外空格。考虑到大多数人的习惯，自动加空格仅在“**双击**”之后触发。

### 已知问题

1. 由于任何页面元素都可能存在需要修正的文本，脚本需要遍历所有元素。这导致执行时间可能过长。为了尽量少影响网页加载时间，脚本内置了定时机制；超时自动退出运行。所以字体和标点修正效果可能和机器配置以及浏览器有关。按`F12`并选择`控制台`（或 `console`）可查看脚本执行日志信息。
2. 由于脚本注入位置的差异，一些看起来并非动态生成的网页元素（比如本项目在 GitHub 上的[中文 Readme 文件](https://github.com/stecue/fixcjk/blob/master/README.md)）在页面载入完成时也可能尚未被修正。此时一般只需单击网页内的任意一点，触发脚本的“点击重检查”功能即可修正该网页。
