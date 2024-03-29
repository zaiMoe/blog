# react 理念

在日常使用的 App 时，有 2 类常见会影响 UI 的快速响应：

- 当遇到大计算量的操作或者设备性能不足导致的页面掉帧
- 发送网络请求后，由于需要等待数据返回才能进一步操作导致的不能快速响应

可以概括为：

- CPU 瓶颈
- IO 瓶颈

## CPU 瓶颈

一般浏览器的刷新频率为 60 Hz，即 16.6ms 刷新一次。而 `js线程` 和 `GUI渲染线程` 是互斥的，所以在每 16.6ms 的时间内，浏览器需要完成：

`js 脚本执行 -> 样式布局 -> 样式绘制 -> 下一个循环`

当 js 执行时间过长，超过 16.6ms 后就没有时间执行 样式布局 和 样式绘制 了，如果执行的时间越长，浏览器就一直不刷新 UI，所以就会造成卡顿。

因此需要控制 `js脚本执行` 的时长，在每 16.6ms 中预留部分时间，而 `react` 值利用这部分时间更新组件（5ms）。当预留的时间不足时，react 则将线程控制交换给浏览器，而之前为执行完的 js 任务，则等待下一帧到来时继续。

react 实现这一步的关键是，将 同步更新 变为 可中断的 异步更新。

## IO 瓶颈

网络延迟 是没法避免的，但如何在 网络延迟 客观存在的情况下，减少用户对 网络延迟 的感知？

一般情况，对于需要网络加载的情况，我们会给出一个 loading 状态的效果，让用户感知当前网络加载中。但如果请求立刻响应，就会造成 loading 一闪而过的效果，比较影响体验。

所以会设置 300ms 的延迟，如果 300ms 内响应了，则不出现 loading 状态，否则就显示 loading 的状态。

react 的解决方案是采用 Suspense 与配套的 hooks - useDeferredValue

## 名词解释

- [Scheduler](https://github.com/facebook/react/tree/v18.2.0/packages/scheduler)（调度器）—— 调度任务的优先级，高优任务优先进入Reconciler，react 16 新增
  - 在Scheduler中的每的每个任务的优先级使用过期时间表示的，如果一个任务的过期时间离现在很近，说明它马上就要过期了，优先级很高，如果过期时间很长，那它的优先级就低，没有过期的任务存放在timerQueue中，过期的任务存放在taskQueue中，timerQueue和timerQueue都是小顶堆，所以peek取出来的都是离现在时间最近也就是优先级最高的那个任务，然后优先执行它。

- [Reconciler](https://github.com/facebook/react/tree/v18.2.0/packages/react-reconciler)（协调器）—— 负责找出变化的组件进行更新, 工作的阶段被称为 `render` 阶段。因为在该阶段会调用组件的render方法。，每当有更新发生时，`Reconciler` 会做如下工作（更多可以看[官方文档](https://zh-hans.reactjs.org/docs/codebase-overview.html#reconcilers)的介绍）：
  - 调用函数组件、或class组件的render方法，将返回的JSX转化为虚拟DOM
  - 将虚拟DOM和上次更新时的虚拟DOM对比
  - 通过对比找出本次更新中变化的虚拟DOM
  - 通知Renderer将变化的虚拟DOM渲染到页面上
- Renderer（渲染器）—— 负责将变化的组件渲染到页面上,工作的阶段被称为 `commit` 阶段，react 支持跨平台，所以有不同的渲染器：
  - [ReactDOM](https://github.com/facebook/react/tree/v18.2.0/packages/react-dom) 负责浏览器环境渲染
  - [ReactNative](https://github.com/facebook/react/tree/v18.2.0/packages/react-native-renderer) 渲染器，渲染App原生组件
  - [ReactTest](https://github.com/facebook/react/tree/v18.2.0/packages/react-test-renderer) 渲染器，渲染出纯Js对象用于测试
  - [ReactArt](https://github.com/facebook/react/tree/v18.2.0/packages/react-art) 渲染器，渲染到Canvas, SVG 或 VML (IE8)
- `render` 与 `commit` 阶段统称为 `work` ，即 React 在工作中。相对应的，如果任务正在 `Scheduler` 内调度，就不属于 `work` 。

### 优先级模型

## 概念

- v16之前: Legacy Mode，同步地进行Reconcile Fiber，Reconcile任务不能被打断，会执行到底
- v16: Async Mode (异步模式)与 时间分片（Time Slicing）: 后面更名为 `Concurrent Mode` （同步模式），引入了 Fiber，采用 `requestAnimationFrame` 实现时间分片
- v17: [Concurrent Mode (并发模式)](https://17.reactjs.org/docs/concurrent-mode-intro.html)
- v18: Concurrent Render (并发更新)，[example](https://github.com/reactwg/react-18/discussions/65)

`Concurrent Mode` 模式下的更新是异步可中断的更新，除了时间片用完，还有一种中断的可能：正在更新的任务被中断，转而开始一次新的更新。我们可以说后一次的更新打断了正在执行的更新，这就是优先级的概念：后一次任务的优先级更高，打断了正在执行的更低优先级的任务。

1. 如何理解 `Concurrent` 同步？

在操作系统的概念:
> 并发，在操作系统中，是指一个时间段中有几个程序都处于已启动运行到运行完毕之间，且这几个程序都是在同一个处理机上运行，但任一个时刻点上只有一个程序在处理机上运行。

举个通俗的例子来讲就是：

- 你吃饭吃到一半，电话来了，你一直到吃完了以后才去接，这就说明你不支持并发也不支持并行。
- 你吃饭吃到一半，电话来了，你停了下来接了电话，接完后继续吃饭，这说明你支持并发。
- 你吃饭吃到一半，电话来了，你一边打电话一边吃饭，这说明你支持并行。

并发的关键是具备处理多个任务的能力，但不是在同一时刻处理，而是交替处理多个任务。比如吃饭到一半，开始打电话，打电话到一半发现信号不好挂断了，继续吃饭，又来电话了...但是每次只会处理一个任务。

#### 时间切片

本质是实现 JS 任务执行和浏览器渲染合理分配的运行在每一帧上，达到 react 渲染过程不堵塞 UI 的渲染。

在刚执行完一个时间切片准备执行下一个时间切片前，React能够：

1. 判断是否有用户界面交互事件和其他需要执行的代码，比如点击事件，有的话则执行该事件
2. 判断是否有优先级更高的任务需要执行，如果有，则中断当前任务，执行更高的优先级任务。也就是利用时间切片来实现高优先级任务插队。

即时间切片有两个作用：

1. 在执行任务过程中，不阻塞用户与页面交互，立即响应交互事件和需要执行的代码
2. 实现高优先级任务可以插队优先执行

方案：

1. `requestIdleCallback` (rIC)，浏览器 API: 能在浏览器空闲时期执行一个函数，一帧的执行时间存在偏差，导致工作执行不稳定(无交互可能为 49.9ms，有交互可能为 16.6ms，视浏览器空闲而定)；requestIdleCallback不会和帧对齐（不应该期望每帧都会调用此回调，在空闲状态下，requestIdleCallback(callback) 回调函数的执行间隔是 50ms（W3C规定），也就是 20FPS，1秒内执行20次，肯定是不行的。）; 浏览器兼容不好，其中 safari 浏览器根本不支持它。
  ![](./imgs/requestIdleCallback.png)
2. `requestAnimationFrame` (rAF) + `postMessage`，[React 旧方案（v16）](https://github.com/facebook/react/blob/v16.0.0/src/renderers/shared/ReactDOMFrameScheduling.js#L84): rAF 依赖设备的运行流程，通常与浏览器屏幕刷新次数相匹配，而且 rAF 会在 UI 渲染前执行，然后通过 `postMessage` 定义一个宏任务，在 UI 渲染后在执行。 本质是为了模拟 `requestIdleCallback`，在浏览器完成渲染之后，在执行 react 的任务。这种方式会占用剩余的所有的时间，例如 react 在 16 中定义的一帧  33ms（保证30fps） 来看，会在这一帧剩余时间结束前一直执行 react 的任务，可能会导致无法继续响应浏览器任务，并且 `requestAnimationFrame` 运行在后台标签页或者隐藏的 `<iframe>` 里时，`requestAnimationFrame()` 会被暂停调用以提升性能和电池寿命
  ![](./imgs/requestAnimationFrame.png)
3. 高频短间隔调度任务 + `MessageChannel` (message loop)，React 新方案：`MessageChannel` 相比  `setTimeout(fn, 0)` 不会有 4ms 的时间间隔限制，此外不使用 rAF，改成采用了 5ms 间隔的宏任务消息事件来发起任务调度，每 5ms 后，就交出线程，用于执行其他的任务，再次空闲且当前帧还有剩余，则继续执行剩余任务，之后在重复。

- [来深入了解下 requestIdleCallback 呗 ？](https://juejin.cn/post/7033959714794766372)
- [React 之 requestAnimationFrame 执行机制探索](https://juejin.cn/post/7165780929439334437)

#### expirationTime 模型

即过期时间，在 Fiber 中有两层不同的含义，注意区分：

- 解决调度中经典的饥饿（Starvation）问题，假设高优先级任务一直执行，低优先级任务将无法得到执行，我们给低优先级任务设定一个过期时间，一旦过期后，就需要被当做同步任务，立即执行，这与 requestIdleCallback 中的 didTimeout 是异曲同工的。
- 代表 update 优先级，expiration time 越大，优先级越高，会优先执行。如果你在其它资料中阅读到 expiration time 越小优先级越高，不要感到诧异，因为这块有过变更。

在 React 内部是这样划分的优先级：

- Sync 具有最高优先级
- 异步方面，优先级分为 InteractiveExpiration 与 AsyncExpiration，同等时刻触发的 InteractiveExpiration 的优先级大于 AsyncExpiration
- InteractiveExpiration 一般指在 InteractiveEvent 中触发的更新，例如：blur, click, focus，keyDown, mouseDown 等等

![](./img/../imgs/expirationTime-y.png)

[源代码在这](https://github.com/facebook/react/blob/v16.8.6/packages/react-reconciler/src/ReactFiberExpirationTime.js)，计算的伪代码：

```js
const update;
update.expirationTime = currentTime + delayTimeByTaskPriority;
```

- currentTime: 以毫秒为单位表示当前时间
- delayTimeByTaskPriority: 任务优先级对应的延迟时间，例如（不正确，计算过程比较复杂）：
  - 普通异步: 500ms，时间单元 25
  - InteractiveExpiration: 50ms，时间单元 10
- 时间单元: 在这个时间单元内计算出来的 Expiration-Time 都是一样的,这样更新会被合并，支持 `batchedUpdates`

每次 `Fiber Reconciler` 调度更新时，会在所有 `fiber` 节点的所有 `update.expirationTimes`中选择一个 `expirationTimes`（一般选择最大的），作为本次更新的优先级。并从根fiber节点开始向下构建新的fiber树。构建过程中如果某个fiber节点包含update，且没有超过过期时间（可能是在多帧以后的过期时间，如低优先级的异步任务）

```js
update.expirationTimes >= nextFrameTime

/*
nextFrameTime: 等于 requestAnimationFrame 传入的 callback 开始执行时间 + 33ms （30fps），表示当前帧结束时间
*/
```

则该 `update` 对应的 `state` 变化会体现在本次更新中。

expirationTime的缺陷:
如果只考虑中断/继续这样的CPU操作，以expirationTimes大小作为衡量优先级依据的模型可以很好工作。

但对于「高优先级 IO 任务」（Suspense），会一直阻塞了「低优先级 CPU 任务」 的情况(如一个任务会引起 Suspense 下子组件抛出 thenable 对象，那么它就是 IO 任务)，会使得一些低优先级的任务一直被中断无法执行，使得 UI 无法得到更新（例如 setState 更新了，但一直被 Suspense 堵塞）

参考：

- [一文吃透 React Expiration Time](https://juejin.cn/post/7051560069401411615)
- [React17新特性：启发式更新算法](https://juejin.cn/post/6860275004597239815)

#### Lane (s) 模型

Lane (s) 模型是从源码角度来定义的。官方的定义详见 [React v17.0 rc](https://zh-hans.reactjs.org/blog/2020/08/10/react-v17-rc.html) 版本发布，发布里提到的” 改进启发式更新算法 “其实就是替换了优先级模型 – Lane (s) 模型，可见 [PR](https://github.com/facebook/react/pull/18796)。

## 不常用 api 说明

> <https://zh-hans.reactjs.org/docs/react-api.html#suspense>

- useDeferredValue
- useTransition
- useId
- useImperativeHandle
- useLayoutEffect
- useDebugValue
- Suspense

### Suspense

[Suspense](https://zh-hans.reactjs.org/docs/react-api.html#suspense): `React@16.6` 新增, 用于组件的异步加载，在组件没有加载完成前，显示 `fallback` 的状态。
在 `react@18` 之前因为支持不完善，称为 `Legacy Suspense`， 而在 `react@18` 之后可以称为 `Concurrent Suspense`，[支持的场景更多了](https://juejin.cn/post/6998086416836067365)。

## react 仓库说明

react 的 packages 目录

```bash
# react 的核心逻辑，与平台无关的接口，如 组件、hooks、
├─react

# render 相关
├─react-dom
├─react-art
├─react-test-renderer
├─react-noop-renderer
├─react-native-renderer

# reconciler
├─react-reconciler

# 调度器实现
├─scheduler

├─react-devtools
├─react-devtools-core
├─react-devtools-extensions
├─react-devtools-inline
├─react-devtools-shared
├─react-devtools-shell
├─react-devtools-timeline

# 其他
├─react-fetch
├─react-fs
├─react-interactions
├─react-pg
├─react-refresh
├─react-client
├─react-server
├─react-server-dom-relay
├─react-server-dom-webpack
├─react-server-native-relay
├─react-suspense-test-utils
├─shared
├─use-subscription
```

## 调试源码

一般来说可以直接通过 `create-react-app` 创建要给 react 应用，然后直接在页面上打断点调试 `react-dom.development.js`。 不过看了[这篇文章](https://juejin.cn/post/7126501202866470949)后，发现如果能直接关联 react 仓库的代码来调试，会更容易对应到上面说的目录结构

### source-map 方法

1. 先按照 [这篇文章](https://juejin.cn/post/7126501202866470949) 将 react 的 source-map 文件编译出来，有报错的话，文中有解释，并且报错信息也会提出什么插件的原因
2. 将 `build` 命令后，`build/node_modules/` 目录下的 `react`、`react-com`、`seheduler` 分别执行下 `yarn link`
3. 来到 `create-react-app` 创建的项目，在 `yarn install` 之后执行 `yarn link react react-com seheduler`，然后运行就能映射源目录文件了

    ![](./imgs/react-debugger.png)

4. 这里不用按照文章所写的，通过 webapck 的 `external` 配置处理，在当前的 `create-react-app` 中引入了 [source-map-loader](https://webpack.docschina.org/loaders/source-map-loader/)，该 loader 会在 webpack 编译时
