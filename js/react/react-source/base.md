# react 理念

在日常使用的 App 时，有 2 类常见会影响 UI 的快速响应：

- 当遇到大计算量的操作或者设备性能不足导致的页面掉帧
- 发送网络请求后，由于需要等待数据返回才能进一步操作导致的不能快速响应

可以概括为：

- CPU 瓶颈
- IO 瓶颈

## CPU 瓶颈

一般浏览器的刷新频率为 60 Hz，即 16.6ms 刷新一次。而 `js线程` 和 `GUI渲染线程` 是互斥的，所以在每 16.6ms 的时间内，浏览器需要完成：

```text
js 脚本执行 -   样式布局  -   样式绘制
```

当 js 执行时间过长，超过 16.6ms 后就没有时间执行 样式布局 和 样式绘制 了，如果执行的时间越长，浏览器就一直不刷新 UI，所以就会造成卡顿。

因此需要控制 `js脚本执行` 的时长，在每 16.6ms 中预留部分时间，而 `react` 值利用这部分时间更新组件（5ms）。当预留的时间不足时，react 则将线程控制交换给浏览器，而之前为执行完的 js 任务，则等待下一帧到来时继续。

react 实现这一步的关键是，将 同步更新 变为 可中断的 异步更新。

## IO 瓶颈

网络延迟 是没法避免的，但如何在 网络延迟 客观存在的情况下，减少用户对 网络延迟 的感知？

一般情况，对于需要网络加载的情况，我们会给出一个 loading 状态的效果，让用户感知当前网络加载中。但如果请求立刻响应，就会造成 loading 一闪而过的效果，比较影响体验。

所以会设置 300ms 的延迟，如果 300ms 内响应了，则不出现 loading 状态，否则就显示 loading 的状态。

react 的解决方案是采用 Suspense 与配套的 hooks - useDeferredValue

- [Suspense](https://zh-hans.reactjs.org/docs/react-api.html#suspense): 用于组件的异步加载

## 名词解释

- [Scheduler](https://github.com/facebook/react/tree/v18.2.0/packages/scheduler)（调度器）—— 调度任务的优先级，高优任务优先进入Reconciler，react 16 新增
- [Reconciler](https://github.com/facebook/react/tree/v18.2.0/packages/react-reconciler)（协调器）—— 负责找出变化的组件进行更新，每当有更新发生时，Reconciler会做如下工作（更多可以看[官方文档](https://zh-hans.reactjs.org/docs/codebase-overview.html#reconcilers)的介绍）：
  - 调用函数组件、或class组件的render方法，将返回的JSX转化为虚拟DOM
  - 将虚拟DOM和上次更新时的虚拟DOM对比
  - 通过对比找出本次更新中变化的虚拟DOM
  - 通知Renderer将变化的虚拟DOM渲染到页面上
- Renderer（渲染器）—— 负责将变化的组件渲染到页面上，react 支持跨平台，所以有不同的渲染器：
  - [ReactDOM](https://github.com/facebook/react/tree/v18.2.0/packages/react-dom) 负责浏览器环境渲染
  - [ReactNative](https://github.com/facebook/react/tree/v18.2.0/packages/react-native-renderer) 渲染器，渲染App原生组件
  - [ReactTest](https://github.com/facebook/react/tree/v18.2.0/packages/react-test-renderer) 渲染器，渲染出纯Js对象用于测试
  - [ReactArt](https://github.com/facebook/react/tree/v18.2.0/packages/react-art) 渲染器，渲染到Canvas, SVG 或 VML (IE8)

## 不常用 hooks 说明

> <https://zh-hans.reactjs.org/docs/react-api.html#suspense>

- useDeferredValue
- useTransition
- useId
- useImperativeHandle
- useLayoutEffect
- useDebugValue
