## FixCJK!
*跨平台 Firefox/Chrome/Chromium/Opera 用户脚本*

### 简介
**[FixCJK!](https://github.com/stecue/fixcjk/)** 是适用于简体中文用户的中文字体和标点修正脚本。主要功能为：

1. 强力字体设置。忽略浏览器和系统设置，直接强力设定映射为“无衬线（sans-serif）”和“有衬线（serif）”的实际字体列表。
2. 替换中易宋体为矢量字体。
3. 将中英文混排中错误使用了中易宋体的英文部分设置为使用单独的拉丁字体。默认是 Ubuntu Mono（其字符宽度正好是中易宋体的一半并自带良好的 hinting 信息）。
4. 对于矢量粗体，将使用字体文件提供的真粗体而不是合成伪粗体（最初目的是绕过 Linux 版 Chrome/Chromium 的[这个 bug](https://bugs.chromium.org/p/chromium/issues/detail?id=448478)）。
5. 设定中文全角标点字体。对于[弯引号](https://www.zhihu.com/question/19616011)，根据上下文自动识别并设定为全角字体。
6. 对于连续的两个或三个中文标点进行空白压缩（或者说间距调整）。

### 用法
推荐下载安装 [Noto Sans CJK SC 字体](https://www.google.com/get/noto/help/cjk/)和 [Ubuntu Mono 字体](https://www.google.com/fonts/specimen/Ubuntu+Mono)。默认设置覆盖了大多数 Windows 和 Linux 设备。如果需要自定义设置（包括中英文字体以及修正级别），请直接修改脚本中从`CJKdefault`到`FixPunct`的定义。**注意**：自动更新可能会重置你对脚本做的修改。

### 已知问题

1. 由于采用直接遍历和修改`innerHTML`的方法，标点修正的效率可能会较低。为了尽量少影响网页加载时间，脚本内置了定时机制；超时自动退出运行。所以字体和标点修正效果可能和机器配置以及浏览器有关。按`F12`并选择`控制台`（或 `console`）可查看脚本执行日志信息。
2. 连续三个中文标点的空白压缩仅考虑了包含引号的情况。连续更多中文标点的空白压缩尚未实现（除非可以分成两个或三个一组）。
3. 由于脚本注入位置的差异，部分网页的部分内容（比如本项目在 GitHub 上的[中文 Readme 文件](https://github.com/stecue/fixcjk/blob/master/README.md)）在整个页面载入完成时尚未被修正。此时可尝试单击页面内任意一点。
