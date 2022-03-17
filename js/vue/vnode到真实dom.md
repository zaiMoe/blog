# vnode到真实dom

![21de098782f1e770ec6e94d14e1ec9ae.png](evernotecid://C54A0D32-226D-4A54-A746-72B250392753/appyinxiangcom/18327894/ENResource/p45)

![ebbd9a6830e53207e33bbb2b391f4d35.png](evernotecid://C54A0D32-226D-4A54-A746-72B250392753/appyinxiangcom/18327894/ENResource/p46)

当数据变化时，会触发渲染函数，执行

```typescript
vm._update(vm._render(), hydrating)
```

`_render`的作用就是生成`VNode`，而`_update`则是将`vnode`渲染为真实`dom`,这一个过程称为`patch`

## _update

### activeInstance

当前执行update时的上下文的Vue实例，在更新结束的时候会回到父实例

```typescript
export let activeInstance: any = null
export let isUpdatingChildComponent: boolean = false
function setActiveInstance(vm: Component) {
  const prevActiveInstance = activeInstance
  activeInstance = vm
  return () => {
    activeInstance = prevActiveInstance
  }
}
```

### _update

```typescript
function lifecycleMixin (Vue: Class<Component>) {
  Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
    const vm: Component = this
    const prevEl = vm.$el
    const prevVnode = vm._vnode
    const restoreActiveInstance = setActiveInstance(vm) // 设置当前的上下文
 
    vm._vnode = vnode
    // __patch__ 见下面
    
    restoreActiveInstance() // 更新结束，回到父实例
    
    if (prevEl) {prevEl.__vue__ = null}
    if (vm.$el) {vm.$el.__vue__ = vm}

    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el
    }
  }
}
```

## patch

### patch的策略

可参考[react](https://zh-hans.reactjs.org/docs/reconciliation.html)中的对diff算法的说明:
由于直接比价两个树，复杂度为[`O(n^3 )`](https://www.zhihu.com/question/66851503)，
React 和 Vue 做优化的前提是“放弃了最优解“，本质上是一种权衡，有利有弊，他们假设是：

- 检测VDOM的变化只发生在同一层
- 检测VDOM的变化依赖于用户指定的key

进而得到启发式的解：
2. 不同类型的元素，会产生两个不同的dom树
3. 开发者可以通过设置 key 属性，来告知渲染哪些子元素在不同的渲染下可以保存不变

那么在比较过程中会有：

1. 不同的元素，则直接删除旧结点，添加新结点，而不会比较两颗子树
2. 对比同一类型的元素，仅更新属性
3. 同一类型的结点会继续对子节点进行递归比较：

- 如果同一位置的结点不同，则跳步骤1
- 但可以用key表示，只是位置移动了，则会复用key相同的dom，只对位子进行移动
- 文本结点或者注释结点，如果字符串不一样直接替换，不需要递归

总的操作就是替换、删除、新增

### patch的由来

`src/core/vdom/patch.js`

```typescript
createPatchFunction () {
    // ... 省略patch过程调用的函数，后面用到在写
    
    return function patch (oldVnode, vnode, hydrating, removeOnly) {}
}
```

`src/platforms/web/runtime/index.js`

```typescript
Vue.prototype.__patch__ = inBrowser ? patch : noop
```

### 一些概念

#### 1. 组件的两个vnode

- 占位符 vnode：vm.$vnode 只有组件实例才有。在 _render 过程中赋值，在父组件中的组件标签vnode，如`vue-component-button-counter`
- 渲染 vnode：vm._vnode 可以直接映射成真实 DOM。在_update 过程中赋值
- 它们是父子关系：vm._vnode.parent = vm.$vnode

### patch

``` typescript
function patch (oldVnode, vnode, hydrating, removeOnly) {
 if (isUndef(vnode)) { // vnode不存在则直接销毁组件
   if (isDef(oldVnode)) invokeDestroyHook(oldVnode)return
    }

 let isInitialPatch = false
 const insertedVnodeQueue = []
 if (isUndef(oldVnode)) { // 没有旧结点，直接新创建
   isInitialPatch = true
   createElm(vnode, insertedVnodeQueue)
 } else {
   const isRealElement = isDef(oldVnode.nodeType) // 第一个渲染的时候为vm.$el，是dom
   if (!isRealElement && sameVnode(oldVnode, vnode)) { // 相同的vnode结点(key和tag一样)
  patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly) // diff过程
   } else {
        // 新旧结点不同，见下面
        
        // 更新父占位符，子组件创建过程会有parent属性
        if(vnode.parent) {}
      }
 }

 invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
 return vnode.elm
}
```

#### createElm

1. 如果是组件vnode，走组件vnode的实例化，然后插入
2. 如果是html标签，则创建dom结点，并递归创建子节点，然后插入
3. 如果是注释和文本结点，创建后直接插入

```typescript
function createElm (
vnode,insertedVnodeQueue,
parentElm,refElm,
nested,ownerArray,index
) {

 // 是否是组件vnode，见下面
 if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
   return
 }
 
 if (isDef(tag)) { // 是html标签
  vnode.elm = nodeOps.createElement(tag, vnode) // 创建真实dom结点
  createChildren(vnode, children, insertedVnodeQueue) // 递归createElm子节点
  insert(parentElm, vnode.elm, refElm) // 插入
 } else if (vnode.isComment) { // 注释，直接插入
  vnode.elm = nodeOps.createComment(vnode.text)
  insert(parentElm, vnode.elm, refElm)
 } else { // 文本结点，直接插入
      vnode.elm = nodeOps.createTextNode(vnode.text)
      insert(parentElm, vnode.elm, refElm)
    }

}
```

##### 组件的挂载

```typescript
  function createComponent (vnode/*组件vnode*/, insertedVnodeQueue, parentElm, refElm) {
    let i = vnode.data
    if (isDef(i)) {
       // ... 执行componentInstance（init钩子，在创建组件vnode的时候注入）
        // 实例化组件，得到 _render、_update，并执行mount
      vnode.componentInstance(vnode)

       // 上面执行完成，但不存在parent(可挂在的)节点，所以子组件的vnode不会插入到真dom上
      if (isDef(vnode.componentInstance)) {
      
        // 赋值vnode.elm = vnode.componentInstance.$el(子组件的$el 到 占位vnode(ButtonCounter))
        // 然后调用creathooks钩子，执行updateAttr、指令等
        initComponent(vnode, insertedVnodeQueue) // 设置占位vnode的elm
         // 将子组件的dom append 到parentElm下，代替当前的占位vnode，具体过程见diff
        insert(parentElm, vnode.elm, refElm)
        // ...
        return true
      }
    }
  }
```

##### 组件hook

```typescript
// src/core/vdom/create-component.js
import {activeInstance} from '../instance/lifecycle'

// init钩子
const componentVNodeHooks = {
  init(vnode: VNodeWithData, hydrating: boolean): ?boolean {
    if (vnode.componentInstance && !vnode.componentInstance._isDestroyed && vnode.data.keepAlive) {
      // keepAlive 相关...
    } else {
      // 创建一个 Vue 的实例，见下面
      const child = vnode.componentInstance = createComponentInstanceForVnode(vnode, activeInstance)
      // 如果是组件，此时el也undefined，不在这里挂载，init执行结束，回到上面
      child.$mount(vnode.el, hydrating) 
    }
  },
}
```

###### 实例化组件

`createComponentInstanceForVnode`
里面实际上返回了一个`vue`实例

```typescript
return new vnode.componentOptions.Ctor({
    _isComponent: true,
    _parentVnode: vnode, // 当前的组件vnode
    parent // 当前组件实例 activeInstance
})
```

- `componentOptions.Ctor`来自 创建`vnode`的函数`createComponent`时加入
- 所以这里`new`的时候又回到了 `_init()`，但和之前的流程有个分支不一样

```typescript
Vue.prototype._init = function (options?: Object) {
  const vm: Component = this
  if (options && options._isComponent) {
    initInternalComponent(vm, options)     // 子组件mergeOptions，见下
  } else {
    // mergeOptions...
  }
  
  // ...
  initLifecycle(vm) // 将组件实例放入非抽象父组件.$children
  if (vm.$options.el) {vm.$mount(vm.$options.el)} // 如果是子组件，则没有el，也就是不在这里挂载，回到上hook
}

export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  // 创建 vm.$options 对象
  const opts = vm.$options = Object.create(vm.constructor.options)
  const parentVnode = options._parentVnode
  opts.parent = options.parent // 正在实例化的vue组件本身
  opts._parentVnode = parentVnode // 保存组件占位符vnode
  
  // 传递绑定在父占位符上的props/事件等
  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag
  
  if (options.render) {  
  opts.render = options.render  
  opts.staticRenderFns = options.staticRenderFns
  }
}
```

#### 新旧结点不同

在上面`patch`函数中，如果存在`oldVnode`和`vnode`，并且结点不同，则进入进入这里。一般情况下不会走到这里，除非这么写：

```vue
<template>
  <div v-if="flag">true</div>
  <ul v-else>
    <li>1</li>
    <li>2</li>
  </ul>
</template>
```

看代码

```typescript
function patch () {
    // ... 新旧结点不同
    if (!isRealElement && sameVnode(oldVnode, vnode)) { 
        // 新旧vnode相同
    } else {
        // 创建一个空的旧vnode（children为空）
        if (isRealElement) { oldVnode = emptyNodeAt(oldVnode)} 

        const oldElm = oldVnode.elm
        const parentElm = nodeOps.parentNode(oldElm) // 旧vnode的父dom

        // 创建新结点
        createElm( vnode, 
        insertedVnodeQueue, 
        parentElm, // 插入旧vnode的父节点中
        nodeOps.nextSibling(oldElm)) // 插入位置，空的时候直接append。否则insertbefore

        // 更新父占位vnode的elm(上面的例子不是组件vndoe，所以没有)， <my-comp/> 就是占位符
        if (isDef(vnode.parent)) {...} 
        // 详情见 https://juejin.cn/post/6844904155056701453#heading-3

        // 删除旧结点或者销毁
        if (isDef(parentElm)) {removeVnodes([oldVnode], 0, 0)} 
       else if (isDef(oldVnode.tag)) { invokeDestroyHook(oldVnode)}
     }
}

```

### 新旧结点相同

在上面`patch`函数中，如果存在`oldVnode`和`vnode`，并且是相同结点的话，就会进入`patchVnode`过程，比较子节点的更新。

```typescript
function patch (oldVnode, vnode）{
    if (isUndef(oldVnode)) {    
        // ...  
    } else {  
    if (!isRealElement && sameVnode(oldVnode, vnode)) { // 新旧vnode相同
      patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly)
    } else {
        // 新旧结点不同
    }
   }
}
```

#### patchVnode

```typescript
function patchVnode (
    oldVnode,
    vnode,
    insertedVnodeQueue,
    ownerArray,
    index,
    removeOnly
  ) {
    if (oldVnode === vnode) {
      return
    }

    const elm = vnode.elm = oldVnode.elm

 // 省略
 // 1. 异步结点的处理
    // 2. 静态结点的复用

    let i
    const data = vnode.data
    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      i(oldVnode, vnode) // prepatch钩子
    }

    const oldCh = oldVnode.children
    const ch = vnode.children
    if (isDef(data) && isPatchable(vnode)) {
   // update钩子，里面有指令update，属性更新等
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
      if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
    }
 
 // 非文本结点，才会比较子节点
    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
     // 子节点不同则diff比较,，见下面
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
      } else if (isDef(ch)) { // 只有ch存在，表示旧节点不需要了
        if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue) // 批量将ch插入elm下
      } else if (isDef(oldCh)) { // 只有旧节点，则说是删除操作
        removeVnodes(oldCh, 0, oldCh.length - 1) // 清除elm所有的子节点
      } else if (isDef(oldVnode.text)) { // 不满足上面，可能旧节点是文本节点，那么就清空文本
        nodeOps.setTextContent(elm, '')
      }
    } else if (oldVnode.text !== vnode.text) { // 文本结点就是字符串的比较
      nodeOps.setTextContent(elm, vnode.text) // 直接修改textContent
    }
    if (isDef(data)) { // postpatch钩子
      if (isDef(i = data.hook) && isDef(i = i.postpatch)) i(oldVnode, vnode)
    }
  }
```

### diff过程

`src/core/vdom/patch.js`
实际上调用的就是`updateChildren``函数

#### 扫描过程

![0081b8702a64359e744f4e432fd59482.png](evernotecid://C54A0D32-226D-4A54-A746-72B250392753/appyinxiangcom/18327894/ENResource/p43)

遍历整个`newVnode[]`,`oldVnode[]`, 从两头向中间比较，`newVnode[]`或`oldVnode[]`中任意一组都扫描过了结束遍历。比较的场景如下：

##### 1. 旧节点对应位置不存在

1. oldStartIndex || oldEndIndex 所在节点不存在： ++oldStartIndex || --oldEndIndex

##### 2. 对应位置的节点一样

1. newStartIndex === oldStartIndex：
    - dom没有变化，patch(children);
    - ++newStartIndex,++oldStartIndex
2. newEndIndex === oldEndIndex,：
    - 同上;
    - --newStartIndex,--oldStartIndex

##### 3. 节点位置移动的情况

![536a70ef75d80f0e0afe60b5fb4803fb.png](evernotecid://C54A0D32-226D-4A54-A746-72B250392753/appyinxiangcom/18327894/ENResource/p42)

![1ebf28f5165fc45d4d3ca280102e9bdb.png](evernotecid://C54A0D32-226D-4A54-A746-72B250392753/appyinxiangcom/18327894/ENResource/p41)

1. newEndIndex === oldStartIndex：
    - 先判断节点右移，patchVnode(children)，处理完子节点
    - **移动oldStartIndex节点到oldEndndex的下一个兄弟节点之前**;
    - ++oldStartIndex,--newEndIndex
2. newStartIndex === oldEndIndex：
    - 节点左移，patchVnode(children)，处理完子节点
    - **移动oldEndIndex节点**到oldStartIndex的位置之前
    - ++newStartIndex,--oldEndIndex

##### 4. 首位两两不等

![224a76fd060b888186dd810fc48dd467.png](evernotecid://C54A0D32-226D-4A54-A746-72B250392753/appyinxiangcom/18327894/ENResource/p44)

先判断在`old VNode`中是否存在`newStartIndex`节点：

1. 建立索引表`kyes: [oldStartIndex,oldEndIndex]`
2. 根据`sameVnode`方法判断索引表中是否存在`newStartIndex`节点
3. 如果不存在，则创建新节点，插入到`oldStartIndex`节点之前，如`8`号位置的节点
4. 如果存在，表示也是移动的节点，如上面的`4`号节点：
    - patchVnode(children)，处理完子节点
    - 令`oldCh[idxInOld]` = undefined，表示这个`oldVNode`已经比较过，下次直接跳过（上面步骤1的情况）
    - 将上面找到的`idxInOld`节点移动到`oldStartIndex`节点之前
5. newStartIndex++，继续往下对比

##### 5. 比较结束之后还有剩余

1. `oldStartIdx > oldEndIdx`：`new VNode`没比较完，则将剩余`[newEndIndex,newEndIndex]`个节点添加到`newEndIndex+1`的位置之前
2. newStartIdx > newEndIdx ：oldVnode比较长，删除[oldStartIndex,oldEndIndex]间的节点，已经设置为undefined的会忽略

### 注意

1. 创建节点的函数`createElm`，如果用过其他方式删除页面上的dom节点（例如自己进行dom操作的话），将会导致插入失败，插入函数是

```
if (targetDom.parentNode === parent) {
    parent.insertBefore(newDom, targetDom);
}
```

其他方式从页面移除`targetDom`，就不会插入失败
