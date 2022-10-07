# render 阶段

```jsx

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


ReactDOMHydrationRoot.prototype.render = ReactDOMRoot.prototype.render = function(children: ReactNodeList) {
    updateContainer(children, root, null, null);
}

// packages/react-reconciler/src/ReactFiberReconciler.old.js
updateContainer () {
    const current = container.current;
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
