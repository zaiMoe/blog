# Fiber

在 React15 及以前，`Reconciler` 采用递归的方式创建虚拟 DOM，递归过程是不能中断的。如果组件树的层级很深，递归会占用线程很多时间，造成卡顿。
为了解决这个问题，React16 将递归的无法中断的更新重构为异步的可中断更新，由于曾经用于递归的虚拟DOM数据结构已经无法满足需要。于是，全新的 `Fiber` 架构应运而生。

## Fiber 的含义

1. react15 递归的调用方式，成为 `stack Reconfiler`， react16 的 `Reconciler` 基于 `Fiber 节点` 实现，被称为 `Fiber Reconciler
2. 作为静态的数据结构来说，每个 `Fiber 节点` 对应一个 `React element`，保存了该组件的类型 （函数式组件/类组件/原生组件/...) 、对应的 Dom节点 等信息
3. 作为动态的单元来说，每个 `Fiber 节点` 保存了本次更新中该组件改变的状态、要执行的工作

## Fiber的结构

> <https://github.com/facebook/react/blob/1fb18e22ae66fdb1dc127347e169e73948778e5a/packages/react-reconciler/src/ReactFiber.new.js#L117>

## 工作原理

### 双缓存 Fiber 树

- `currnet Fiber tree`: 当前屏幕上显示内容对应的 `Fiber 树`
  - `current fiber`

- `workInprogresss Fiber tree`: 在内存中构建的 `Fiber 树`
  - `workInProgress fiber`，两个节点通过 `alternate` 属性连接

```js
currentFiber.alternate === workInProgressFiber;
workInProgressFiber.alternate === currentFiber;
```

- `rootFiber`: React 应用的根节点通过使 current 指针在不同 `Fiber` 树的 `rootFiber` 间切换来完成 `current Fiber` 树指向的切换。即当 `workInProgress Fiber` 树构建完成交给 `Renderer` 渲染在页面上后，应用根节点的 `current` 指针指向 `workInProgress Fiber树` ，此时 `workInProgress Fiber树` 就变为 `current Fiber树`。