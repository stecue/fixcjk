# 简介
**[FixCJK!](https://github.com/stecue/fixcjk/)** 是适用于简体中文用户的中文字体和标点修正脚本。主要功能为：

1. 强力字体设置。忽略浏览器和系统设置，直接强力设定映射为“无衬线（sans-serif）”和“有衬线（serif）”的实际字体列表。
2. 替换中易宋体为矢量字体。
3. 将中英文混排中错误使用了中易宋体的英文部分设置为使用单独的拉丁字体。默认是Ubuntu Mono（其字符宽度正好是中易宋体的一半并自带良好的 hinting 信息）。
4. 对于矢量粗体，将使用字体文件提供的真粗体而不是合成伪粗体（最初目的是绕过 Linux 版 Chrome/Chromium 的[这个 bug ](https://bugs.chromium.org/p/chromium/issues/detail?id=448478)）。
5. 设定中文全角标点字体。对于[弯引号](https://www.zhihu.com/question/19616011)，根据上下文自动识别并设定为全角字体。
6. 对于连续的两个或三个中文标点进行空白压缩（或者说间距调整）。

# 用法
推荐下载安装 [Noto Sans CJK SC 字体](https://www.google.com/get/noto/help/cjk/)和 [Ubuntu Mono 字体](https://www.google.com/fonts/specimen/Ubuntu+Mono)。默认设置覆盖了大多数 Windows 和 Linux 设备。如果需要自定义设置（包括中英文字体以及修正级别），请直接修改脚本中从`CJKdefault`到`FixPunct`的定义。**注意**：自动更新可能会重置你对脚本做的修改。
