# render 阶段

## 概念

- v16: Async Mode (异步模式)
- v17: Concurrent Mode (并发模式)
- v18: Concurrent Render (并发更新)

## 源码解析

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
updateContainer (
  element: ReactNodeList,
  container: OpaqueRoot,
  parentComponent: ?React$Component<any, any>,
  callback: ?Function,
) {
    const current = container.current;

    // 获取当前时间戳, 计算本次更新的优先级
    const eventTime = requestEventTime();

    // 返回一个 number 16
    const lane = requestUpdateLane(current); 
    if (enableSchedulingProfiler) {
        markRenderScheduled(lane);
    }

    // 初次渲染时没有，返回一个 Object.freeze({});
    const context = getContextForSubtree(parentComponent /* null */);
    if (container.context === null) {
        container.context = context;
    } else {
        container.pendingContext = context;
    }

    // 一个更新对象 {eventTime, lane, tag,payload,next,callback}
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
  
  const mode = fiber.mode; // 3
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

### enqueueUpdate

```tsx
export function enqueueUpdate<State>(
  fiber: Fiber,
  update: Update<State>,
  lane: Lane,
): FiberRoot | null {
  const updateQueue = fiber.updateQueue;
  if (updateQueue === null) {
    // Only occurs if the fiber has been unmounted.
    return null;
  }

  const sharedQueue: SharedQueue<State> = (updateQueue: any).shared;

  // class 组件的一个更新模式，省略
  if (isUnsafeClassRenderPhaseUpdate(fiber)) {
    const pending = sharedQueue.pending;
    if (pending === null) {
      update.next = update;
    } else {
      update.next = pending.next;
      pending.next = update;
    }
    sharedQueue.pending = update;
    return unsafe_markUpdateLaneFromFiberToRoot(fiber, lane);
  } else {
    return enqueueConcurrentClassUpdate(fiber, sharedQueue, update, lane);
  }
}


```

## lane 模型

### ExpirationTime

`react 16` 使用 `ExpirationTime` 来表示任务的优先级

### lane

```tsx
// packages/react-reconciler/src/ReactFiberLane.old.js
export const TotalLanes = 31;

export const NoLanes: Lanes = /*                        */ 0b0000000000000000000000000000000;
export const NoLane: Lane = /*                          */ 0b0000000000000000000000000000000;

export const SyncLane: Lane = /*                        */ 0b0000000000000000000000000000001;

export const InputContinuousHydrationLane: Lane = /*    */ 0b0000000000000000000000000000010;
export const InputContinuousLane: Lane = /*             */ 0b0000000000000000000000000000100;

export const DefaultHydrationLane: Lane = /*            */ 0b0000000000000000000000000001000;
export const DefaultLane: Lane = /*                     */ 0b0000000000000000000000000010000;

const TransitionHydrationLane: Lane = /*                */ 0b0000000000000000000000000100000;
const TransitionLanes: Lanes = /*                       */ 0b0000000001111111111111111000000;
const TransitionLane1: Lane = /*                        */ 0b0000000000000000000000001000000;
const TransitionLane2: Lane = /*                        */ 0b0000000000000000000000010000000;
const TransitionLane3: Lane = /*                        */ 0b0000000000000000000000100000000;
const TransitionLane4: Lane = /*                        */ 0b0000000000000000000001000000000;
const TransitionLane5: Lane = /*                        */ 0b0000000000000000000010000000000;
const TransitionLane6: Lane = /*                        */ 0b0000000000000000000100000000000;
const TransitionLane7: Lane = /*                        */ 0b0000000000000000001000000000000;
const TransitionLane8: Lane = /*                        */ 0b0000000000000000010000000000000;
const TransitionLane9: Lane = /*                        */ 0b0000000000000000100000000000000;
const TransitionLane10: Lane = /*                       */ 0b0000000000000001000000000000000;
const TransitionLane11: Lane = /*                       */ 0b0000000000000010000000000000000;
const TransitionLane12: Lane = /*                       */ 0b0000000000000100000000000000000;
const TransitionLane13: Lane = /*                       */ 0b0000000000001000000000000000000;
const TransitionLane14: Lane = /*                       */ 0b0000000000010000000000000000000;
const TransitionLane15: Lane = /*                       */ 0b0000000000100000000000000000000;
const TransitionLane16: Lane = /*                       */ 0b0000000001000000000000000000000;

const RetryLanes: Lanes = /*                            */ 0b0000111110000000000000000000000;
const RetryLane1: Lane = /*                             */ 0b0000000010000000000000000000000;
const RetryLane2: Lane = /*                             */ 0b0000000100000000000000000000000;
const RetryLane3: Lane = /*                             */ 0b0000001000000000000000000000000;
const RetryLane4: Lane = /*                             */ 0b0000010000000000000000000000000;
const RetryLane5: Lane = /*                             */ 0b0000100000000000000000000000000;

export const SomeRetryLane: Lane = RetryLane1;

export const SelectiveHydrationLane: Lane = /*          */ 0b0001000000000000000000000000000;

const NonIdleLanes: Lanes = /*                          */ 0b0001111111111111111111111111111;

export const IdleHydrationLane: Lane = /*               */ 0b0010000000000000000000000000000;
export const IdleLane: Lane = /*                        */ 0b0100000000000000000000000000000;

export const OffscreenLane: Lane = /*                   */ 0b1000000000000000000000000000000;
```

## 参考

- [Replacing render with createRoot](https://juejin.cn/post/6992435557456412709)
- [React 为什么使用 Lane 技术方案](https://juejin.cn/post/6951206227418284063)
