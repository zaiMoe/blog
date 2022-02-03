# vi / vim

## vi

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
