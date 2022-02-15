# vi / vim

### 配色设置

1. 选择 vim 自带的主题： 参考 <https://www.jianshu.com/p/4eb71eada87d>
2. 在 [vimcolorschemes](https://vimcolorschemes.com/) 上找一个

下面以 vimcolorschemes 上的 [onedark](https://github.com/joshdick/onedark.vim) 为例

1. 将 github 上 `colors/onedark.vim` 复制到 `~/.vim/colors/`
2. 将 github 上 `autoload/onedark.vim` 复制到 `~/.vim/autoload/`
3. `touch ~/.vimrc`
4. 编辑 `.vimrc`, 输入

```bash
syntax on
colorscheme onedark
```

> 主要就是 readme 中的说明书即可。

如果打开的时候遇到报错，确保配置是从 github 上下载的最新文件，一开始 github 打不开，从 gitee 上下载的文件，有奇怪的报错，后面从新下载就解决了

### 标准模式

- 复原/前进 之前的动作: u / ctrl+r
- . : 重复上一个命令动作
- hjkl： 左下上
- ctrl + [fb]: 下/上页
- number + <space>: 移动 n 个字符
- number + <entry>: 移动 n 行
- 0 / ctrl+$: 光标移动到首/尾
- HML: 移动到屏幕的 首/中/尾 位置
- G: 移动到文件末尾
- gg: 移动到文件第一行
- /? + word: 向后 / 前 寻找单词 word,  n/N 表示 下/上一个
- :n1,n2s/word1/word2/gc: 在 [n1,n2] 中寻找 word 并全部替换为 word2，[1,$]表示首位寻找，c表示十分确认替换
- del和backspace: x / X, 表示向前或者向后删除一个字符
- 删除一整行: dd
- 复制: yy一整行
- 粘贴: p / P 向 后 / 前 一列 粘贴
- 现实行号: `set nu`

### vim 额外功能

- v: 字符串选中
- V: 选中行
- ctrl+v: 矩形选择
- y: 复制选中区域
- d: 删除选中区域
- p: 粘贴

```shell
set mouse-=a # 鼠标复制
```
