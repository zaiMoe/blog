# react css 方案

在 react 项目中写 css，不像 vue 一样，官方直接给了一种 scope 的方案，社区中有非常多的方案，大致可以分为

1. 常规 css 写法，即原生 css 和各种预处理器
2. 原子类 css，即直接写类名，由 css 框架生成各种类名，比如 tailwindcss
3. css in js

虽然方案非常多，各种库和解决方案都几十种，给人一种眼花缭乱的感觉，但实际开发中，一般选择自己喜欢的方案就行，或者项目用什么，就用那种就行。当然，如果是要做技术选型，还是可以进一步分析下，选择适合团队的那种

### 原生 css

这种是学习成本最低的方案，基本上就和普通开发一样，直接写css，结合预处理器（sass、less等），写起来可以非常方便。但是这种方案一般会带来2个问题：

- 类名污染的问题
- 无用类名造成的冗余

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
- 可以支持目前各种已有的 css 工具，比如 less、sass、postcss 等，上手成本低，与原生 css 只有使用上的区别
- 基本上所有的编译工具都支持，例如 [vite 只需要在 css 文件加上 `.moduel.css` 的后缀就能开启](https://vitejs.dev/guide/features.html#css-modules)

### 原子 css

### css in js

## 总结

- [CSS分层](https://www.w3cplus.com/css/css-layers.html)
- [CSS Modules](https://glenmaddern.com/articles/css-modules)
