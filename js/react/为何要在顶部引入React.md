# 为何要在声明 `import React from 'react'`

### 为什么要声明这段代码

在开发 `react` 时，对于函数式组件总是需要在项目顶部书写：

```typescript
import React from 'react'

// or
import * as React from 'react'
```

实际上是因为 react 在编译 jsx 时的需要：

```jsx
const App = () => (
  <div>Hello World!!!</div>
);

// 编译后
var App = function App() {
  return React.createElement(
    "div",
    null,
    "Hello World!!!"
  );
};
```

[jsx 本质是一种语法糖](https://zh-hans.reactjs.org/docs/jsx-in-depth.html)，最终依然用 React.createElement 来创建，也就是开头要引入的原因

### 两者的区别

#### 使用上

```js
import React, { useState } from 'react';
```

对比

```js
import * as React from 'react';
const useState = React.useState
//或者 import { useState } from 'react';
```

很明显第一种会方便些

#### 编译上

示例代码

```typescript
// constant.js
export const a = 1
const b = 2
export default b 

// index.js
import constant from './constant'
console.log(constant)
```

不管是 ts 还是 babel，在将 esm 编译为 cjs 的时候，对于 `export default` 的处理，都会放在一个 `default` 的属性上，即 `module.exports.default = xxx`，上面编译的结果大致为：

```js
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.a = 1;
var b = 2;
exports.default = b;

// index.js
var _constant = require("./constant");
var constant_1 = _constant.__esModule ? _constant : {default: _constant};
console.log(constant_1.default);
```

对于 [react v16.13.0](https://github.com/facebook/react/blob/v16.12.0/packages/react/src/React.js) 之前的版本都是通过 `export default` 导出的，所以会使用 `import React from 'react'` 来导入 react。

但是从  [react v16.13.0](https://github.com/facebook/react/blob/v16.13.0/packages/react/src/React.js) 开始，react 就改成了用 `export` 的方式导出了，如果在 ts 中使用 `import React from 'react'` 则会有错误提示：

```text
TS1259: Module 'xxxx' has no default export.
```

由于没有了 `default` 属性，所以上面编译后的代码 `console.log(constant_1.default)` 输出的是 `undefined`，ts 会提示有错误。

> 关于 export default 的一些问题可以参考
>
> 1. [为什么我不再使用 export default 来导出模块](https://juejin.cn/post/6844903767528177671)
> 2. [聊聊 Webpack4 的 Tree Shaking](https://zhuanlan.zhihu.com/p/260724544)

### 如何处理

最简单的就是改成 `import * as React from 'react'` 这种引入方式，就不会报错。

假如就是想用 `import React from 'react'` 这种方式引入，毕竟使用起来更加友好，
那么 ts 也提供了 [allowSyntheticDefaultImports 配置](https://www.typescriptlang.org/tsconfig#allowSyntheticDefaultImports)
属性来跳过这个检查，简单来说会把 `import` 没有 `exports.default` 的报错忽略。

细心的你肯定还会想，忽略了错误检查，但错误还是在啊，为什么还是能照常使用呢？
先来看看 react 的构建产物：

```js
// react/index.js
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/react.production.min.js');
} else {
  module.exports = require('./cjs/react.development.js');
}
```

`import React from 'react'` 实际导入的都是 cjs 模块的代码，而这段代码经过 babel 编译后会变成（与上面index.js 一样）：

```js
"use strict";

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }; // 不是 esm 模块就会给一个默认的 default 属性
}

console.log(_react.default);
```

也就是编译器便我们解决了兼容问题，如果只打算用 tsc 编译，ts 也给出了一个编译配置：
[esModuleInterop](https://www.typescriptlang.org/tsconfig#esModuleInterop),
开启后编译的结果也和 babel 差不多。 当然，如果编译 `target=es6`，则可以不使用这个。

> 对于 `import * as React from 'react'` 这种命令方式编译结果复杂些，不在这里讨论，有兴趣的可以通过 <https://www.typescriptlang.org/play> 试试

### 自动添加

从 react 17 开始，[官方支持在写 jsx 的时候不引入上述的声明](https://zh-hans.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html#removing-unused-react-imports)，
新的 jsx 转化插件 [@babel/plugin-transform-react-jsx](https://babeljs.io/docs/en/babel-plugin-transform-react-jsx#react-automatic-runtime) 会在打包的时候自动添加，
可以通过 vite 创建一个 react 项目试试，已经不会在报错了。

如果项目使用的是非 ts 项目，对于 <16 的 react 版本，还可以用 非官方插件 [babel-plugin-auto-import](https://github.com/PavelDymkov/babel-plugin-auto-import) 支持

### 总结

1. 使用自动导入方案（推荐）
2. `import * as React from 'react'` （兼容性好）
3. `import React from 'react'` （ts 配合 allowSyntheticDefaultImports）
