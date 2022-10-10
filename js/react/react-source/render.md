# render 阶段

```jsx

// react 18 已废弃，与 react 17 的工作方式完全相同，称为 Legacy Root
ReactDOM.render(<App/>, root)

// react 18 新功能开启，同时将 FiberRoot 提供给用户，每次需要重新渲染是可以直接 调用 root.render，而 root 是不会变化的。
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


// packages/react-dom/src/client/ReactDOMRoot.js
ReactDOMHydrationRoot.prototype.render = ReactDOMRoot.prototype.render = function(children: ReactNodeList) {
    const root = this._internalRoot;

    // 已被卸载
    if (root === null) {
        throw new Error('Cannot update an unmounted root.');
    }

    /* DEV 环境的校验 */

    // 执行更新
    updateContainer(children, root, null, null);
}

ReactDOMHydrationRoot.prototype.unmount = ReactDOMRoot.prototype.unmount = function(): void {
  const root = this._internalRoot;
  if (root !== null) {
    this._internalRoot = null;
    const container = root.containerInfo;
    flushSync(() => {

      // 也是调用 同个函数 执行更新
      updateContainer(null, root, null, null);
    });
    unmarkContainerAsRoot(container);
  }
};

// packages/react-reconciler/src/ReactFiberReconciler.old.js
// 串联了 react-dom 包和 react-reconciler，调用了 `scheduleUpdateOnFiber(xxx)，进入 react 循环构造的唯一入口
updateContainer () {
    const current = container.current;

    // 获取当前时间戳, 计算本次更新的优先级
    const eventTime = requestEventTime();
    const lane = requestUpdateLane(current);

    const context = getContextForSubtree(parentComponent);
    if (container.context === null) {
        container.context = context;
    } else {
        container.pendingContext = context;
    }

    const update = createUpdate(eventTime, lane);
    update.payload = {element};

    callback = callback === undefined ? null : callback;
    if (callback !== null) {
        update.callback = callback;
    }

    const root = enqueueUpdate(current, update, lane);
    if (root !== null) {
        scheduleUpdateOnFiber(root, current, lane, eventTime);
        entangleTransitions(root, current, lane);
    }

    return lane;
}
```

### requestUpdateLane

```tsx
// packages/react-reconciler/src/ReactFiberWorkLoop.old.js
export function requestUpdateLane(fiber: Fiber): Lane {
  // Special cases
  const mode = fiber.mode;
  if ((mode & ConcurrentMode) === NoMode) {
    return (SyncLane: Lane);
  } else if (
    !deferRenderPhaseUpdateToNextBatch &&
    (executionContext & RenderContext) !== NoContext &&
    workInProgressRootRenderLanes !== NoLanes
  ) {
    return pickArbitraryLane(workInProgressRootRenderLanes);
  }

  const isTransition = requestCurrentTransition() !== NoTransition;
  if (isTransition) {
    /* DEV */

    if (currentEventTransitionLane === NoLane) {
      currentEventTransitionLane = claimNextTransitionLane();
    }
    return currentEventTransitionLane;
  }

  const updateLane: Lane = (getCurrentUpdatePriority(): any);
  if (updateLane !== NoLane) {
    return updateLane;
  }

  const eventLane: Lane = (getCurrentEventPriority(): any);
  return eventLane;
}

```

## 参考

- [Replacing render with createRoot](https://juejin.cn/post/6992435557456412709)
