# vue实例销毁过程

从 Patch -> removeVnodes开始：

removeVnodes调用两个方法来destroy

- removeAndInvokeRemoveHook
- invokeDestroyHook

## moveAndInvokeRemoveHook

1. 这个函数最重要的步骤就是调用`removeNode`将dom从父节点中移出，**此时dom树上取不到此dom了**
2. 递归调用子组件上的钩子  -- todo
3. 移出hook  -- todo

## invokeDestroyHook

1. 执行钩子`beforeDestroy`
2. 从`parent.$children`中移除自己
3. 取消相关的事件监听watcher
4. 移除vnode的指令、refs关联
5. 执行钩子`destroyed`
6. 解除el.**vue**
7. 解除$vnode.parent
