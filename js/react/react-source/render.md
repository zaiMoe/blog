# render 阶段

```jsx

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
