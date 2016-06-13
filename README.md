## FixCJK!
*全功能、跨平台的中英文网页字体修正和排版美化脚本，“搞定”CJK！*

### 简介
**[FixCJK!](https://github.com/stecue/fixcjk/)** 是为 Gecko / Webkit / Blink 内核浏览器编写的用户脚本，适用平台包括但不限于：Firefox / Icecat / Chrome / Chromium / Opera，以及各种 Webkit / Blink 内核的“国产”浏览器。主要功能为：

1. 强力字体设置。忽略浏览器和系统设置，直接强力设定映射为“无衬线（sans-serif）”和“有衬线（serif）”的实际字体列表。
2. 替换中易宋体为矢量字体。
3. 将中英文混排中错误使用了中易宋体的英文部分设置为使用单独的拉丁字体。默认是 Ubuntu Mono（其字符宽度正好是中易宋体的一半并自带良好的 hinting 信息）。
4. 对于矢量粗体，将使用字体文件提供的真粗体而不是合成伪粗体（最初目的是绕过 Linux 版 Chrome / Chromium 的[这个 bug](https://bugs.chromium.org/p/chromium/issues/detail?id=448478)）。
5. 设定中文全角标点字体。对于[弯引号](https://www.zhihu.com/question/19616011)，根据上下文自动识别并设定为全角字体。
6. 对中文标点进行空白压缩和间距调整，使版面疏密更协调（尤其是标点较多且存在中英文混合排版时）。
7. 中英文之间自动加空格，类似于[这个扩展](https://chrome.google.com/webstore/detail/%E7%82%BA%E4%BB%80%E9%BA%BC%E4%BD%A0%E5%80%91%E5%B0%B1%E6%98%AF%E4%B8%8D%E8%83%BD%E5%8A%A0%E5%80%8B%E7%A9%BA%E6%A0%BC%E5%91%A2%EF%BC%9F/paphcfdffjnbcgkokihcdjliihicmbpd/reviews?hl=zh-CN)。

其中功能 **1-4** 及 **7** 对所有浏览器的所有版本均有效；功能 **5-6** 只保证在最新 Gecko 和 Webkit/Blink 内核上可用。

### 用法
**脚本安装：**较新的浏览器都需要附加组件来安装和使用脚本。如果您是 Firefox 用户，请先安装 [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)；Chrome/Chromium 用户，请先安装 [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)；Opera 用户也请安装 [Tampermonkey](https://addons.opera.com/en/extensions/details/tampermonkey-beta/)。之后，请到 [Greasy Fork](https://greasyfork.org/zh-CN/scripts/19812-fixcjk) 或者 [OpenUserJS](https://openuserjs.org/scripts/stecuegmail.com/FixCJK!) 网站安装本脚本的最新稳定版。

**字体设置：**推荐下载安装 [Noto Sans CJK SC 字体](https://www.google.com/get/noto/help/cjk/)和 [Ubuntu Mono 字体](https://www.google.com/fonts/specimen/Ubuntu+Mono)。默认设置覆盖了大多数 Windows 和 Linux 设备。如果需要自定义设置（包括中英文字体以及修正级别），请直接修改脚本中从`CJKdefault`到`FixPunct`的定义。**注意**：自动更新可能会重置你对脚本做的修改。

**0.10 分支**新增“**点击重检查**”功能。遇到在页面初次载入时尚未出现的动态内容，可在**需要修正的页面元素处**单击。点击后脚本将重新检查所有需要修正的网页元素。点击重检查的允许最小间隔时间默认为 1 到 2 秒。间隔时间过短的连续点击将被忽略。

**0.11 分支**默认启用重写的递归式检测算法并新增“**长单击强制标点修正**”功能。新引擎仅在已知安全的情况下进行标点替换作业，对包含大量 JavaScript 脚本和“事件监听器”的网页（比如[新浪图片](http://photo.sina.com.cn/#dir)）的兼容性大大提高。但是这也可能造成在某些页面元素中标点修正功能失效，即使触发“单击重检查”也无法修正。此时可以在**该页面元素上**（*不是*其他页面空白处）长按鼠标左键（> 0.8 秒）再松开，期间不要移动鼠标位置。脚本被这种“长单击”触发后，将试图强制修正**该页面元素内**的中文标点。**注意：**强制标点修正可能导致该页面元素所包含的各个子元素的事件监听器失效，动态效果消失；但是对于静态页面应当可以放心使用。无论如何，请尽量避免在页面最外层的空白处长单击。因为页面最外层的元素往往包含最多的子元素，长单击最外层可能使得整个页面的动态效果消失。

**0.12 分支**使用了新的标点修正算法。代码更简洁、系统化并覆盖了绝大多数需要进行空白压缩的情形；从根本上避免了大量问题。从这个版本开始，理论上任意长度的连续标点都可以被正确处理。

**0.13 分支**添加了“中英文之间自动加空格”的功能。目前仍处于试验阶段，仅在“**双击**”之后触发。

### 已知问题

1. 由于任何页面元素都可能存在需要修正的文本，脚本需要遍历所有元素。这导致执行时间可能过长。为了尽量少影响网页加载时间，脚本内置了定时机制；超时自动退出运行。所以字体和标点修正效果可能和机器配置以及浏览器有关。按`F12`并选择`控制台`（或 `console`）可查看脚本执行日志信息。
2. 由于脚本注入位置的差异，一些看起来并非动态生成的网页元素（比如本项目在 GitHub 上的[中文 Readme 文件](https://github.com/stecue/fixcjk/blob/master/README.md)）在页面载入完成时也可能尚未被修正。此时一般只需单击**该网页元素内**的任意一点，触发脚本的“点击重检查”功能即可修正该网页。更强力的修正请参考“长单击强制标点修正”功能。
