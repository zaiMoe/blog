# vue的初始化和实例化

![](./imgs/vue%E7%9A%84%E5%88%9D%E5%A7%8B%E5%8C%96%E5%92%8C%E5%AE%9E%E4%BE%8B%E5%8C%96.png)

## vue的初始化

`src\core\instance\index.js`

```
function Vue (options) {
  this._init(options)
}

// 定义_init方法
initMixin(Vue) 

// 定义$watch、$set、$del方法
stateMixin(Vue)

// 定义$on、$once、$off、$emit
eventsMixin(Vue)

// 定义 _update、$forceUpdate、$destroy
lifecycleMixin(Vue)

// 定义$nextTick、_render
renderMixin(Vue)
```

## 实例化过程_init

执行`this._init(options)`

```js
if (options && options._isComponent) {
    // 子组件mergeOptions，在创建子组件dom的章节再讲
    initInternalComponent(vm, options)
  } else {
    //... mergeOptions(options)
}

vm._renderProxy = vm
vm._self = vm
initLifecycle(vm)
initEvents(vm)
initRender(vm)
callHook(vm, 'beforeCreate') // 触发钩子
initInjections(vm)
initState(vm)
initProvide(vm)
callHook(vm, 'created') // 触发钩子

// 渲染到页面
if (vm.$options.el) {
 vm.$mount(vm.$options.el)
}
```

### 先处理options

包括规范化检查、合并

#### mergeOptions 做了什么

```js
function mergeOptions (
  parent, // 传入的是父级构造器的Ctor.options
  child, // 当前的options，实例的时候传进来的
  vm?) { // 实例本身，可以不传表示不是在实例化的时候调用，会影响合并结果
} 
```

对`parent`和`child`的数据进行预处理（规范化检查），然后根据合并策略，进行合并

##### 合并策略

- 对于 **el、propsData** 选项使用默认的合并策略 defaultStrat（默认用child，child没有则用parent）。
- 对于 **data** 选项，使用 mergeDataOrFn 函数进行处理，最终结果是 data 选项将变成一个函数，且该函数的执行结果为真正的数据对象，子覆盖父。
- 对于**生命周期钩子hook**选项，将合并成数组，使得父子选项中的钩子函数都能够被执行，因此生命周期可以写成数组
- 对于 **directives、filters 以及 components** 等资源选项，父子选项将以原型链的形式被处理，正是因为这样我们才能够在任何地方都使用内置组件、指令等。
- 对于 **watch** 选项的合并处理，类似于生命周期钩子，如果父子选项都有相同的观测字段，将被合并为数组，这样观察者都将被执行。
- 对于 **props、methods、inject、computed** 选项，父选项始终可用，但是子选项会覆盖同名的父选项字段。
- 对于 **provide** 选项，其合并策略使用与 data 选项相同的 mergeDataOrFn 函数。
- 最后，以上没有提及到的选项都将使默认选项 defaultStrat：只要子选项不是 undefined 就使用子选项，否则使用父选项。

- extends：则是调用了`mergeOptions(parent, child.extends)`先进行合并
- mixins: extends后`mixins.forEach(mergeOptions(parent, mixins[i].extends))`进行合并

### 设置渲染函数代理对象

`vm._renderProxy = vm`

开发环境用proxy代理，做一些get的提示处理

### initLifecycle

初始化一些状态和用于保存信息的变量，如

```js
parent.$children.push(vm) // 将当前实例添加到父级的$children中
vm.$parent = parent
vm.$refs = {}
vm._watcher = null
vm._isDestroyed = false
```

#### vm.$parent

todo

### initEvents

todo

### initRender

todo

### initState

```typescript
function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  
  // vm._props = props = {}
  // 检查合法性、检查是否为保留字
  // 是否为root节点，否则不做深度观察，只观察第一层_props.key的
  // 原因：上层已经做了观察，是引用传值，这里的这层观察只是因为此时的key还没合当前的props进行绑定
  // 代理 key, 能通过this直接访问
  if (opts.props) initProps(vm, opts.props)
    
  // 1. 检查key，不能存在于props，必须是一个function,不能是 '_' or '$' 开头
  // 2. 将key放到vm上，并且bind(vm)
  if (opts.methods) initMethods(vm, opts.methods)
    
  // vm._data = data
  // 校验：data是函数、不能在methods、props上重复、不能是保留字
  // 代理 key, 能通过this直接访问
  // observe，观察对象，加入到数据响应系统中
  if (opts.data) {
    initData(vm) 
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
    
  // 检查数据格式是否正确，不与data、props重复
  // 创建计算属性观察者
  // 代理到vm上
  if (opts.computed) initComputed(vm, opts.computed)
    
  // 观察key，创建对应的观察者
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
```

### provide

将`vm.$options.provide`放到 `vm._provided`，提供给后代取

### inject

根据`$parent`往上找到带有`_provided`的值，然后提供给当前组件使用

注意：`provide`和`inject`不是响应式的
