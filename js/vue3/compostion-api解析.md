# compostion-api 解析

### install过程

1. Vue.config.optionMergeStrategies.setup // setup的合并策略
2. setVueConstructor(Vue) // 设置 __composition_api_installed__
3. mixin(vue)

#### mixin(vue)

```typescript
// src/mixin.ts

Vue.mixin({
    beforeCreate: functionApiInit, // 执行setup
    mounted() {
      updateTemplateRef(this) // 将vm.refs同步到ref(null)中
    },
    updated() {
      updateTemplateRef(this)
      if (this.$vnode?.context) {
        updateTemplateRef(this.$vnode.context)
      }
    },
})
```

##### functionApiInit

```typescript
function functionApiInit(this: ComponentInstance) {
    const vm = this
    const $options = vm.$options
    const { setup, render } = $options

    if (render) {
      // keep currentInstance accessible for createElement
      $options.render = function (...args: any): any {
        // 设置当前的 vue实例，以便 getCurrentInstance 访问到当前实例，render结束后还原，所以setup中异步函数调用 getCurrentInstance 为null
        
        return activateCurrentInstance(
        
        // vue2->创建一个 类似vue3 的 instance对象 作为vm
        toVue3ComponentInstance(vm), 
        () =>
          render.apply(this, args)
        )
      }
    }

    const { data } = $options
    // 重写 data
    $options.data = function wrappedData() {
      initSetup(vm, vm.$props) // 调用setup
      return isFunction(data)
        ? (
            data as (this: ComponentInstance, x: ComponentInstance) => object
          ).call(vm, vm)
        : data || {}
    }
  }
```

##### initSetup

```typescript
function initSetup(vm: ComponentInstance, props: Record<any, any> = {}) {
    const setup = vm.$options.setup!
    const ctx = createSetupContext(vm) // 创建 ctx 中所有的key: root/refs/parent/emit 等
    const instance = toVue3ComponentInstance(vm)
    instance.setupContext = ctx

    // 将props 添加 __ob__ 的被observer的空对象
    def(props, '__ob__', createObserver())

    // 绑定slot，此时为空，当父slots有值时，会跟着变化，attrs也一样（文档说明 https://v3.cn.vuejs.org/guide/composition-api-setup.html#context）
    resolveScopedSlots(vm, ctx.slots)

    let binding: ReturnType<SetupFunction<Data, Data>> | undefined | null
    activateCurrentInstance(instance, () => {
      binding = setup(props, ctx) // 调用setup，获取返回值
    })

    if (!binding) return
    
    // 返回一个渲染函数
    if (isFunction(binding)) {
      const bindingFunc = binding
      vm.$options.render = () => {
        resolveScopedSlots(vm, ctx.slots)
        return activateCurrentInstance(instance, () => bindingFunc())
      }
      return
    } else if (isPlainObject(binding)) {
      if (isReactive(binding)) {
        binding = toRefs(binding) as Data
      }

      vmStateManager.set(vm, 'rawBindings', binding)
      const bindingObj = binding

      Object.keys(bindingObj).forEach((name) => {
        let bindingValue: any = bindingObj[name]

        if (!isRef(bindingValue)) {
          if (!isReactive(bindingValue)) {
          
          // key 是一个函数，则像 methods 一样处理：bind(vm)
            if (isFunction(bindingValue)) {
              const copy = bindingValue
              bindingValue = bindingValue.bind(vm)
              Object.keys(copy).forEach(function (ele) {
                bindingValue[ele] = copy[ele]
              })
            } else if (!isObject(bindingValue)) {
              bindingValue = ref(bindingValue) //其他数据包一层 ref
            } else if (hasReactiveArrayChild(bindingValue)) {
               // 如果属性值是一个普通对象且有子属性值为经过 reactive 后的数组，则要将这个普通对象也要转换为经过 reactive 包装才行，所以我们在开发时要避免如下情况：
               // obj: { arr: reactive([1, 2, 3, 4]) }
            
 
              // creates a custom reactive properties without make the object explicitly reactive
              // NOTE we should try to avoid this, better implementation needed
              customReactive(bindingValue)
            }
          } else if (isArray(bindingValue)) {
            bindingValue = ref(bindingValue)
          }
        }
        
        // 如同名字，可以通过 vm.xxx 进行读取
        // 就是做一个defineProperty处理， 对于ref对象，返回 xxx.value
        // 其他的就返回 xxx
        asVmProperty(vm, name, bindingValue)
      })

      return
    }
  }
```

### API 解析

##### reactive

```typescript
export function reactive<T extends object>(obj: T): UnwrapRef<T> {
  if (!isObject(obj)) {
    return obj
  }

  if ( !(isPlainObject(obj) || isArray(obj)) || isRaw(obj) ||!Object.isExtensible(obj)) {
    return obj as any
  }
  
// 对 `object` 和 `array` 进行响应式处理，调用 `vue.observable` 或者 `new vue` 来创建响应式对象
  const observed = observe(obj)
  
  // 深度遍历每个属性做一层拦截处理，对于ref对象，读取的时候返回.value，set的时候设置.value
  setupAccessControl(observed)
  return observed as UnwrapRef<T>
}
```

##### ref

```typescript
export function ref(raw?: unknown) {
  if (isRef(raw)) {
    return raw
  }

// RefKey = value
  const value = reactive({ [RefKey]: raw })
  
  // 使用 Object.seal 封闭属性，不能添加新属性，防止对返回值做某些处理
  // 最后调用 RefIeml 代理 value 的为下面的get/set
  return createRef({
    get: () => value[RefKey] as any,
    set: (v) => ((value[RefKey] as any) = v),
  })
}
```

##### watch / watchEffect

> createWatcher 创建
底层调用 `vm.$watch(getter, callback, options)` 实现，其中`getter`是传入的观察对象`target`做了处理：

- isRef: `getter => target.value`
- isReactive: `getter => target`
- isArray: 遍历对象，进行一次取值（数组元素必须是 `ref/reactive/function`，不然不处理）
- isFunciton: `getter = target`

###### createScheduler

```typescript
const createScheduler = <T extends Function>(fn: T): T => {
    // sync = true， 依赖变更了就直接调用，因此直接返回 fn
    if (isSync ||  vm === fallbackVM) {return fn}
    return ((...args: any[]) => 
    
    // 根据 flushMode 创建调用任务
    queueFlushJob(vm,() => { fn(...args) },
        flushMode as 'pre' | 'post'
      )) as unknown as T
  }
  
  let callback = createScheduler(cb)
```

###### watchEffect

则是做一层包装，将 cb 包装成 getter、而`$watch`的第二个参数callback则为`noopFn`

##### computed

```typescript
export function computed<T>(
  getterOrOptions: ComputedGetter<T> | WritableComputedOptions<T>
): ComputedRef<T> | WritableComputedRef<T> {
  const vm = getCurrentScopeVM()
  let getter: ComputedGetter<T>
  let setter: ComputedSetter<T> | undefined

    // 处理参数、fn、get/set的参数
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }

  let computedSetter
  let computedGetter

  if (vm && !vm.$isServer) {
    const { Watcher, Dep } = getVueInternalClasses()
    let watcher: any
    
    // 创建一个 componted watcher
    computedGetter = () => {
      if (!watcher) {watcher = new Watcher(vm, getter, noopFn, { lazy: true })}
      if (watcher.dirty) { watcher.evaluate()} // 需要进行一次求值
      if (Dep.target) {watcher.depend()} // 然后才能收集到依赖的vm
      return watcher.value
    }

    computedSetter = (v: T) => {if (setter) {setter(v)}}
  } else {
    // vm不存在的情况（vue<2.6.x），从 new Vue(computed: { get/set })
  }

    // 返回一个ref对象
  return createRef<T>(
     {get: computedGetter, set: computedSetter}, 
     !setter
  )
}
```

### 参考

<https://juejin.cn/post/6918365587248775175>
<https://juejin.cn/post/6986284618617978910>

### 问题

1. 为什么有时 getCurrentInstance() 为何返回 null
2. 为何ref在渲染是会自动 浅解包
3. ref(null) 为何会自动绑定 refs？
4. reactive 一个 ref对象，为何自动解包
