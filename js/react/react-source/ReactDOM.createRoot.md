# ReactDOM.createRoot

## createRoot

```js

const root = ReactDOM.createRoot(document.getElementById('root'));

// 这里采用的是并发模式创建
createRootImpl(container, options /* 此时是 undefined */);

// packages/react-dom/src/client/ReactDOMRoot.js
createRoot() {


    // 相当于 createFiberRoot，创建一个并发模式的 fiberRoot 给 root
    const root = createContainer(
        container,
        ConcurrentRoot, // 1，代表根节点
        null,
        isStrictMode, // false
        concurrentUpdatesByDefaultOverride, // false
        identifierPrefix, // 空字符 ''
        onRecoverableError, // 报错函数，默认console.error
        transitionCallbacks // null
    )

    // 将创建的root.current挂载到container的`__reactContainer$${randomKey}`属性上
    markContainerAsRoot(root.current, container);

    // 在根节点上进行事件委托处理，如click、scroll，见下1.2
    listenToAllSupportedEvents(container);

    // this._internalRoot = internalRoot; 没有其他逻辑
    return new ReactDOMRoot(root);
}

// packages/react-reconciler/src/ReactFiberRoot.old.js
createFiberRoot () {

    // 创建一个 FiberRootNode 
    const root: FiberRoot = new FiberRootNode(/*...*/)

    // 根据 tag 创建一个 RootFiber， 见下1.1
    const uninitializedFiber = createHostRootFiber(
        tag,
        isStrictMode,
        concurrentUpdatesByDefaultOverride,
    );
    root.current = uninitializedFiber;

    // rootFiber.stateNode指向FiberRoot，可通过stateNode.containerInfo取到对应的dom根节点div#root
    uninitializedFiber.stateNode = root;

    if (enableCache) {
        const initialCache = createCache();
        retainCache(initialCache);
        root.pooledCache = initialCache;
        retainCache(initialCache);
        const initialState: RootState = {
        element: initialChildren,
        isDehydrated: hydrate,
        cache: initialCache,
        };
        uninitializedFiber.memoizedState = initialState;
    } else {
        const initialState: RootState = {
        element: initialChildren,
        isDehydrated: hydrate,
        cache: (null: any), // not enabled yet
        };
        uninitializedFiber.memoizedState = initialState;
    }       

    // 
    initializeUpdateQueue(uninitializedFiber);

    return root;
}

// packages/react-reconciler/src/ReactFiber.old.js
createHostRootFiber () {

    // mode = 1, dev & 开启 devtool 时，mode = 3
    // 创建一个 FiberNode 节点
    return createFiber(HostRoot /* 3 */, null, null, mode);
}


// 以下只展示一些相关的属性，没展示的用...忽略掉
function FiberRootNode(
  containerInfo,
  tag, // 是 ConcurrentRoot = 1
  hydrate,
  identifierPrefix,
  onRecoverableError,
) {
  // ...
  this.tag = tag;  // 根节点类型
  // 存储dom 根节点，如<div id='app'></div>
  this.containerInfo = containerInfo;
  // 指向上面的RootFiber（uninitializedFiber）
  this.current = null;
  // ...
}
```

### 1.1 `fiberRoot` 和 `rootFiber` 的关系

- `FiberRoot`: 通过 `new FiberRootNode` 生成, 是整个应用的根节点，绑定在真实DOM节点的`_reactRootContainerxxx` 属性上，React 应用的根节点通过使 current 指针在不同 `Fiber` 树的 `rootFiber` 间切换来完成 `current Fiber` 树指向的切换。即当 `workInProgress Fiber` 树构建完成交给 `Renderer` 渲染在页面上后，应用根节点的 `current` 指针指向 `workInProgress Fiber树` ，此时 `workInProgress Fiber树` 就变为 `current Fiber树`。

- `RootFiber`: 指的是根节点对应的 `FiberNode`，与 `App`、`div` 等都有对应的 `Fiber` 节点，在每次重新渲染的时候会重新构建。

![](./imgs/FiberRoot%26RootFiber.webp)

### 1.2 listenToAllSupportedEvents

- [合成事件](https://reactjs.org/docs/events.html)

```jsx
function App() {

  function onClickCapture() {
    console.log('我是捕获阶段')
  }
  function onClick() {
    console.log('我是冒泡阶段')
  }
  return <div onClickCapture={onClickCapture} onClick={onClick}>app</div>
}
```
