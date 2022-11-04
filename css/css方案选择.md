# css 方案选择

在 react 项目中写 css，不像 vue 一样，官方直接给了一种 scope 的方案，社区中有非常多的方案，大致可以分为

1. 常规 css 写法，即原生 css 和各种预处理器
2. 原子类 css，即直接写类名，由 css 框架生成各种类名，比如 tailwindcss
3. css in js

虽然分为上面3大类，但社区提供的方案非常多，各种库和解决方案，使用文章也非常多，在是初期做选择时，给人一种眼花缭乱的感觉，不知道改选择那种。下面会进行一些方案的介绍，来看看那种更适合自己的需求和使用习惯！

### 原生 css

这种是学习成本最低的方案，基本上就和普通开发一样，直接写css，结合预处理器（sass、less等），写起来可以非常方便。但是这种方案一般会带来2个问题：

- 全局污染
- 命名混乱

#### 类名污染

##### 传统方案

传统方案可以用过有语义化的命名约定和 CSS 层的分离，来避免类名污染和提高代码的组织管理，也诞生过许多的方案，例如

- OOCSS
- AMCSS
- ITCSS
- AMCSS
- SMACSS
- BEM

比如 BEM 的命名：

```css
/* .模块名__元素名--修饰器名 */
.card {}
.card__head {}
.card__menu {}
.card__menu-item {}
.card__menu-item--active {}
.card__menu-item--disable {}
```

但是这些方案在使用时可能会增加使用的负担，例如 BEM 需要制定命名规范，也需要开发人员去学习，否则还是可能造成在某些地方写了相同的类名。因此一搬适用于组件库开发这类团队，因为人员相对稳定一些，对于业务团队，项目一半迭代快，人员流动大的，会增加上手成本。并且由于 css 都是全局性的，也有可能与第三方库造成冲突

##### [CSS Mmodule](https://github.com/css-modules/css-modules)

CSS Module 是利用 webpack 等构建工具使 class 带有作用域，会在编译后，将 class 带了一段类似 hash 的值，来实现 class 的局部作用域，使用：

```jsx

// index.module.css
.title {
    font-size: 20px;
    font-weight: bold;
}

// index.js
import styles from 'index.module.css'
const html = `<div class="${styles.title}"></div>`

// 编译后
const html = "<div class='styles__title__3xrQQ'></div>"
```

采用 CSS Module 后：

- 消除了全局命名的问题，在写 className 时可以随意起名字，不用担心命名冲突
  可以减少嵌套，层级结构清晰，也容易复用
- 可以支持目前各种已有的 css 工具，比如 less、sass、postcss 等，上手成本低，与原生 css 只有使用上的区别，几乎 0 学习成本
- 基本上所有的编译工具都支持，例如 [vite 只需要在 css 文件加上 `.moduel.css` 的后缀就能开启](https://vitejs.dev/guide/features.html#css-modules)

另外提一下 Vue 的 css 解决方案：

```html
<style scoped>
/* 局部样式 */
</style>

<style>
/* 全局样式 */
</style>
```

加上了 `scoped` 也是类似 css module 的方案，但不需要特殊的写法, 使用上最接近原生的体验的，非常的简洁自然，如果是用 Vue 开发的，可以直接使用。

### 原子 css

关于 原子化css 大家可能想到的就是 Bootstrap，Bootstrap 虽然是一种组件化的 css，但也提供了一些[原子类的css](https://getbootstrap.com/docs/5.1/utilities/api/#api-explained)，例如：

```css
.m-0 {
  margin: 0;
}
.text-red {
  color: red;
}
```

而 原子化css 的特点有：

- 是一种 CSS 的架构方式
- 以单个效果构成一个 class

常见的库有 [Tailwind CSS](https://tailwindcss.com/)，[Windi CSS](https://cn.windicss.org/) 以及 [Tachyons](https://tachyons.io/) 等

在使用上则变成了：

```html
<div class="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4">
  <div class="shrink-0">
    <img class="h-12 w-12" src="/img/logo.svg" alt="ChitChat Logo">
  </div>
  <div>
    <div class="text-xl font-medium text-black">ChitChat</div>
    <p class="text-slate-500">You have a new message!</p>
  </div>
</div>
```

[Tailwind Demo](https://tailwindcss.com/docs/utility-first)

这种方式，其优点是：

- 可以在不写一行 css 的情况下，完成基本的页面设计
- 减少很多 css 的代码量，非常好的减小了 css 的体积，少了很多冗余的 css
- 不需要再为class取个什么名字而苦恼，可维护性，可复用性更强

但也能明显看出其缺点：

- 需要熟悉这套写法，要记忆很多类名（WS 和 vs code 都有插件提示）
- 对于复杂的视觉效果，需要写很多的类名，不方便阅读，也不方便维护（比如上面的demo）
- 打包后的体积从未消失，只是换了一个方式(html)存在

从个人的使用体验来说，只能说真香，css 写久了其实就会发现很多样式需要经常写，比如布局中(flex, grid)，父子元素都需要起类名，加一个 css 文件去写，挺麻烦的，因此在用 Tailwind 之前，也会在团队中封装了一些原子css来减少一些css的书写，但对于其他新加入维护的新同事来说（可以来自其他团队），会不清楚这套类名定义，有一定的上手成本。而采用 tailwind css 来统一各个团队的标准，可以无压力的上手。

原子化 css 确实提升的开发体验，所以也受到了更多人的青睐。对于上面提到的难维护，难阅读的情况也确实存在，我自己对于超过 7 个 class 的复杂 UI，一般就会提取成一个css文件来实现，方便后续调整。

### css in js

react 官方给出了[一种 style 的写法](https://zh-hans.reactjs.org/docs/dom-elements.html#style)：

```jsx
const divStyle = {
  color: 'blue',
  backgroundImage: 'url(' + imgUrl + ')',
};

function HelloWorldComponent() {
  return <div style={divStyle}>Hello World!</div>;
}
```

这是一种 `css in js` 的方案：
> JSS是一种比CSS更强大的抽象。 它使用JavaScript作为语言以声明和可维护的方式描述样式。 它是一个高性能的JS到CSS编译器，它在运行时和服务器端工作。 这个核心库是低级别和框架无关的。 它大约是6KB（缩小和压缩），并且可以通过插件API进行扩展。

`css in js` 能利用 js 的能力来增强css，但官方提供的这种方案并不支持所有的 `CSS` 功能，例如选择器，伪选择器。同时引入了新的学习成本（驼峰化名称，写法繁琐等），于是有了更多的方案：

- [JSS](https://cssinjs.org/)
- [styled-jsx](https://github.com/vercel/styled-jsx)
- [styled-components](https://styled-components.com/)
- [Emotion](https://emotion.sh/docs/introduction)

`css in js` 的优点：

- 组件化思考，不需要维护一份 css 样式文件，而且可以非常方便的通过检测创建的变量使用使用，来删除无用的 css，不会造成冗余
- 可以利用 js 的全部功能来增强CSS，轻松地在JS和CSS之间共享常量和函数。
- 可以解决css污染，都是支持局部样式和全局样式的方案

但至于选择那种，并没有统一的方案，参考下 npm trends:

![](./static/common/css-%E6%96%B9%E6%A1%88%E9%80%89%E6%8B%A9.png)

目前最受欢迎的是 styled-components，他提供了一些比较灵活的使用方案，相对来说学习成本会高一些。而我会更加喜欢 styled-jsx，毕竟作为一个经常写业务的，需要考虑团队成员的学习和维护成本。

## 总结

写了那么多，对于一开始而言，也不知道那种比较好，这种时候一般选择自己喜欢的方案就行。在实际工程项目用什么，就用那种就行。比如我由于常年写业务，所以更加喜欢 `css module` 这种低学习成本，更加贴近原生的书写方案，常用的方案是 `css module + less/scss + classnames + tailwind/windicss`。

## 参考

- [CSS分层](https://www.w3cplus.com/css/css-layers.html)
- [CSS Modules](https://glenmaddern.com/articles/css-modules)
- [重新构想原子化 CSS](https://antfu.me/posts/reimagine-atomic-css-zh)
- [「译文」：CSS-in-JS 你所应该知道的一切](https://juejin.cn/post/6844903873962835982)
- [React拾遗：从10种现在流行的 CSS 解决方案谈谈我的最爱 （上）](https://juejin.cn/post/6844903633109139464)
- [中后台 CSS Modules 最佳实践](https://juejin.cn/post/7097312790511091719)
- [「译」为什么我们正在放弃 CSS-in-JS](https://juejin.cn/post/7158712727538499598)
