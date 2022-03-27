# vnode的创建

![](./imgs/vnode%E7%9A%84%E5%88%9B%E5%BB%BA_img1.png)

### 例子

```js
new Vue({
    el: '#app',
    data: {a: 1}
})

new Vue({
    data: {a: 1}
}).$mount('#app')
```

### 编译过程简介

- 词法分析(扫描)：从左向右逐行扫描源程序的字符，输出有意义的token（词法单元的标记）序列
  - Tokenzier
  - 有限状态机(DFA)
- 语法分析(解析Parser): 根据语言规则(字面量，变量，操作符，预计，注释，数据类型，函数，关键字)，解析成(与上下文法无关)AST（抽象语法树，Abstract Syntax Tree）
- 语义分析：
  - 收集变量信息，比如作用域，类型等，放在符号表中(hash-map)
  - 进行语义检查(类型检查，类型转换)等（文法有关）操作
  - 上下文无关文法(GFC)  
- 中间代码生成(IR)：在`源程序`翻译成`目标代码`的过程中，一个编译器可能**构成出一个或者多个中间表示**。这些中间表示可以有多种形式。`语法树`是一种中间表示形式，他们通常在语法分析和语义分析中使用。
  - 在IR之前我们通常认为是编译的**前端**，而IR之后泽是编译的**后端**
  - 初衷是提高编译器的开发效率
  - 将AST转成一串IR定义的代码，特点：易于生成、能够轻松翻译为目标机器上的语言
- 编译优化：改进中间代码，去掉无关代码，依赖等
- 目标代码生成：**代码**生成以`中间表示形式`作为输入，并把它映射为**目标语言**

参考vue资料里的四则运算，有一个编译前端的部分

## 从`$mount`开始

`_init -> vm.$mount -> mountComponent -> new Watcher`

### 运行版的mount

位于`src\platforms\web\runtime\index.js`

```typescript
Vue.prototype.$mount = function (el, hydrating) {
    el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating) // mountComponent
}
```

就只直接调用`mountComponent`取生成dom并挂载在页面上

### 完全版的mount

位于`src\platforms\web\entry-runtime-with-compiler.js`
中间多了线生产`render`函数的步骤：
生成渲染函数`render`给vm，然后调用运行版的`mount -> mountComponent`

> 即`mountComponent`的渲染条件是需要`render`函数

### 生成render函数

![](./imgs/vnode%E7%9A%84%E5%88%9B%E5%BB%BA_img2.png)

1. 先获取`template`

- 如果 `template` 选项不存在，那么使用 `el` 元素的 `outerHTML` 作为模板内容
- 如果 `template` 选项存在
  - 且 `template` 的类型是字符串
    - 如果第一个字符是 `#`，那么会把该字符串作为 `css` 选择符去选中对应的元素，并把该元素的 `innerHTML` 作为模板
    - 如果第一个字符不是 `#`，那么什么都不做，就用 `template` 自身的字符串值作为模板
  - 且 `template` 的类型是元素节点，则使用元素的`innerHTML`作为模板
- 否则提示错误

2. 然后调用`compileToFunctions`生成解析成ast并生成渲染函数
`compileToFunctions`之后调用的是`createCompiler`

##### compileToFunctions的由来

`src\platforms\web\compiler\index.js`在此处调用`createCompiler(baseOptions)`导出

`createCompiler`: 传入`baseCompile->
createCompilerCreatir(baseComplie) -> createCompile` -> 编辑器的创建者，对编译器作一些封装，使得不同的平台不需要传入相同的参数（偏函数的方式）,

```js
{
    compile, // 封装对baseComplie产生错误的处理，并返回baseCompile的结果
    // 对compile的结果进一步封装，转换中间代码为真正可执行的render函数
    comileToFunctions: createCompleToFuntionFn(compile)
}
```

```typescript
function createCompileToFunctionFn (compile): Function {
  const cache = Object.create(null)
  
  return function compileToFunctions (template: string,options,vm): CompiledFunctionResult {
     // 查看是否已经缓存过了
   const key = options.delimiters
     ? String(options.delimiters) + template
     : template
   if (cache[key]) {
     return cache[key]
   }
   
   // 编译拿到ast、render（string code）、staticRenderFns
   const compiled = compile(template, options)
   
   const res = {}
   const fnGenErrors = []
   res.render = createFunction(compiled.render, fnGenErrors) // new Function('with(this) {return code}')
   res.staticRenderFns = compiled.staticRenderFns.map(code => {
     return createFunction(code, fnGenErrors)
   })
   
   return (cache[key] = res)
  }
}
```

#### baseCompile

入口: `src/compiler/index.js`

> 将字符串转换成ast(parse)，然后优化（optimize），最后生成渲染函数（generate）

如果手写渲染函数则可以跳过`createCompiler`这部，也就是直接走`mountComponent`

```typescript
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
) {  
const ast = parse(template.trim(), options)  if (options.optimize !== false) {
    optimize(ast, options)
  }
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }})
```

![](./imgs/vnode%E7%9A%84%E5%88%9B%E5%BB%BA_img3.png)

#### parse

调用`parseHTML`，解析**为vue的token**

元素描述对象可能会增加这些

```js
{
 type: 1, // 1为标签(包括自定义组件标签)，2为字面量表达式的文本节点，3为纯文本或注释
    tag: 'div',
    key: '', // key的值
 if: true, // 带有v-if
 ifConditions: [], // v-if时，v-else，v-else-if元素存放的位置
 else: true, // 带有v-else
 elseif: true // 带有v-else-if
 res: {}, // v-for的数据
 once: true, // v-once
}
```

详细解析见：<http://caibaojian.com/vue-design/appendix/ast.html>

##### start

1. start 钩子函数是当解析 html 字符串遇到开始标签时被调用的。
2. 模板中禁止使用 <style> 标签和那些没有指定 type 属性或 type 属性值为 text/javascript 的 <script> 标签。
3. 在 start 钩子函数中会调用前置处理函数，这些前置处理函数都放在 preTransforms 数组中，这么做的目的是为不同平台提供对应平台下的解析工作。
4. 前置处理函数执行完之后会调用一系列 process* 函数继续对元素描述对象进行加工。
5. 通过判断 root 是否存在来判断当前解析的元素是否为根元素。
6. slot 标签和 template 标签不能作为根元素，并且根元素不能使用 v-for 指令。
7. 可以定义多个根元素，但必须使用 v-if、v-else-if 以及 v-else 保证有且仅有一个根元素被渲染。
8. 构建 AST 并建立父子级关系是在 start 钩子函数中完成的，每当遇到非一元标签，会把它存到 currentParent 变量中，当解析该标签的子节点时通过访问 currentParent 变量获取父级元素。
9. 如果一个元素使用了 v-else-if 或 v-else 指令，则该元素不会作为子节点，而是会被添加到相符的使用了 v-if 指令的元素描述对象的 ifConditions 数组中。
10. 如果一个元素使用了 slot-scope 特性，则该元素也不会作为子节点，它会被添加到父级元素描述对象的 scopedSlots 属性中。
11. 对于没有使用条件指令或 slot-scope 特性的元素，会正常建立父子级关系。

后面的end、charts、comment看vue资料里的`parse-index`

##### parseHTML

`src/compiler/parser/html-parser.js`

词法解析：解析html字符串为**符合html的token**

会在解析成功的时候，会更具解析的类型调用`options`中的回调：

```js
// ...其他选项参数
  start (tagName, attrs, unary, start, end) {},
  end (tagName, start, end) {},
  chars (text) {},  
  comment (text) {}
```

#### optimize

优化抽象语法树，检测子节点中是否是纯静态节点,
-检测到纯静态节点则标记`static = true`,提升为常量，重新渲染的时候不在重新创建节点,**在 patch 的时候直接跳过静态子树**

```typescript
export function optimize (root, options: CompilerOptions) {
  if (!root) return
  
  // 哪些静态的标签
  isStaticKey = genStaticKeysCached(options.staticKeys || '')
  
  isPlatformReservedTag = options.isReservedTag || no

   // 标记静态节点，为下面的标记静态根节点服务的
   // 没有key、for/if、slot啥的，且子元素也是静态的
   // 不包括文本节点
  markStatic(root)
    
  // 标记是否是静态根节点
  // 判断是否是纯文本节点，是就跳过，在下一节点使用
  // 简单解释，纯文本节点直接比较字符串是都一样就行了，使用其他方式，会增加内存和运行的开销
  markStaticRoots(root, false)
}
```

#### generate

最终输出

```js
 {
    // _c 就是 createElement的封装（见下面）
    render: `with(this) {return  _c('div', {attrs:{"id":'app'}}, [_v(_s(message))], [0|1|2]) }`,
    staticRender: ......
 }
```

demo

```typescript
Vue.component('button-counter', {
    data: function () {return {count: 0}},
    template: `<div>
        <span>{{count}}</span>
        <button v-on:click="count++">You clicked me {{ count }} times.</button>
        </div>`
    })
    /*
    new Vue({
        el: "#app",
        render: h => {
            let res = h(
                'div', 
                {attrs: {class: 'static-class'}},
                [
                    h('p', 'test p2'),
                    h('button-counter')
                ])
            return res;
        }
    })*/
    
    new Vue({
        el: '#app',
        template: `<div>
            <p>test p2<p/>
            <button-counter :init="10"></button-counter>
        </div>`
    })
/*
_c('div',
{staticClass:\"app1\"},
[
    _c('p',[_v(\"test p2\")]),
    _v(\" \"),
    _c('button-counter',{attrs:{\"init\":10}})
],1)
*/
```

渲染函数的参数`h`就是`createElement`的别名，会创建一个`Vnode`，`Vnode`是比较复杂的，所以通过`createElement`来辅助创建`Vnode`,不然太反人类了。

```typescript
function generate(ast, options) {
// 初始化一些方法和属性，给下一步使用，比如标记是否是组件标签
var state = new CodegenState(options); 

// 生成render 函数需要的 string code
// _c('div',{attrs:{"id":'app'}},[_v(_s(message))], [0|1|2])
var code = ast ? genElement(ast, state) : '_c("div")';
return {
        render: ("with(this){return " + code + "}"),
        staticRenderFns: state.staticRenderFns
}}


function CodegenState(options) {
    // ...
 this.transforms = pluckModuleFunction(options.modules, 'transformCode');
 this.dataGenFns = pluckModuleFunction(options.modules, 'genData');
    
    // 指令处理函数
 this.directives = extend(extend({}, baseDirectives), options.directives);
 var isReservedTag = options.isReservedTag || no;
    
    // 元素是否为组件。
 this.maybeComponent = function(el) {return !(isReservedTag(el.tag) && !el.component);};
 this.onceId = 0;
 this.staticRenderFns = []; // 静态根节点
 this.pre = false; // 是否使用了pre标签
};

function genElement(el, state) {
 if (el.parent) {
  el.pre = el.pre || el.parent.pre;
 }
 // 字母函数参考 http://caibaojian.com/vue-design/appendix/vue-prototype.html
 
 // 将静态节点放入state.staticRenderFns.push(`with(this){return xxx`)
 // return _m(index,boolean)
 if (el.staticRoot && !el.staticProcessed) {return genStatic(el, state)} 
 
 // 也就是相当于渲染静态节点，同上
    else if (el.once && !el.onceProcessed) {return genOnce(el, state)} 
 
 // _l(el.for, fn(item,index,key)) // 类似Ext.each(obj, cb(item, index, key))
    else if (el.for && !el.forProcessed) {return genFor(el, state)} 
 
 // 三目运算符的计算，为空的时候_e,createEmptyVNode
    else if (el.if && !el.ifProcessed) {return genIf(el, state)} 
 
 // 处理template模板，返回[xxx,xxx,xxx]子节点的描述信息，见下
    else if (el.tag === 'template' && !el.slotTarget && !state.pre) {return genChildren(el, state) || 'void 0'} 
    
 // todo
 else if (el.tag === 'slot') {return genSlot(el, state)} 
    else {
  var code;
  if (el.component) { // todo
   code = genComponent(el.component, el, state);
  } else {
   var data;
   if (!el.plain || // 没有key，属性的标签，则始终为true，processElement阶段添加
   (el.pre && state.maybeComponent(el))) {
    data = genData$2(el, state); // 获取h的第二个参数
   }
 
   // 
   var children = el.inlineTemplate ? null : genChildren(el, state, true);
   code = "_c('" + (el.tag) + "'" + (data ? ("," + data) : '') + (children ? ("," + children) : '') + ")";
  }
  // module transforms
  console.log(state.transforms)
  for (var i = 0; i < state.transforms.length; i++) {
   code = state.transforms[i](el, code);
  }
  return code
 }
}

// 将各种属性v-model,class编程一个字符串对象
function genData (el, state): string {
 var data = '{';
    //... 省略
 // attributes
 if (el.attrs) {
  data += "attrs:{" + (genProps(el.attrs)) + "},";
 }
 data = data.replace(/,$/, '') + '}';
    //... 省略
 return data
}

// _c('div',{attrs:{"id":'app'}},[_v(_s(message))], [0|1|2])
function genChildren(el, state, checkSkip, altGenElement, altGenNode) {
 // ...
 
 normalizationType = 0|1|2 // _createElement的第4个参数
 return ("[" + (children.map(function(c) {
  return gen(c, state);
 }).join(',')) + "]" + (normalizationType ? ("," + normalizationType) : ''))
}
```

### mountComponent

位于`src\core\instance\lifecycle.js`

两个阶段：`_render`和`_update`

```typescript
function mountComponent(vm, el, hydrating) {
    vm.$el = el
    // ... 对render不存在的处理
    callHook(vm, 'beforeMount')
    let updateComponent = () => {
      let vnode = vm._render(); // 调用render生成vnode
      vm._update(vnode, hydrating) // vnode -> DOM
    }
   
    // 创建观察者，触发数据属性get从而收集依赖
    // 调用 updateComponent 并求值
    new Watcher(vm, updateComponent, noop, {
      before () {
        if (vm._isMounted && !vm._isDestroyed) {
          callHook(vm, 'beforeUpdate')
        }
      }
    }, true /* isRenderWatcher */)
    
    if (vm.$vnode == null) {
      vm._isMounted = true
      callHook(vm, 'mounted')
    }
    return vm
}
```

### _render返回Vnode

![](./imgs/vnode%E7%9A%84%E5%88%9B%E5%BB%BA_img4.png)

```typescript
Vue.prototype._render = function() {
    const { render, _parentVnode } = vm.$options

    vm.$vnode = _parentVnode // 将占位node指向$vnode

 // ···
 try {
  // vm._renderProxy === vm
  // vm.$createElement 手写render函数时的`h`
  vnode = render.call(vm._renderProxy, vm.$createElement);
 } catch (e) {}
 
 if (Array.isArray(vnode) && vnode.length === 1) vnode = vnode[0];
 // ···
 
    // 将占位符vnode保存到渲染vnode的parent属性中
 vnode.parent = _parentVnode
 return vnode
}
```

#### _createElement

上面中`render.call(vm, $createElement)`实际就是调用`_createElement`

```typescript
function initRender(vm) {

    // 模板编译时候用的
    // createElement 主要是对 _createElement 的一个封装
    vm._c = function(a, b, c, d) { return createElement(vm, a, b, c, d, false); }
    
    // 手写render时候的h，多了些校验
    vm.$createElement = function (a, b, c, d) { return createElement(vm, a, b, c, d, true); };
}
```

demo

```typescript
render(h) {
  return h(
    "div",
    [
      [
        [h("h1", "title h1")],
        [h('h2', "title h2")]
      ],
      [
        h('h3', 'title h3')
      ]
    ]
  );
}
```

###### 解析`_createElement`

1. 如果`tag`是普通`html`标签，就返回普通`vnode`
2. 反正调用`createComponent`，返回一个组件`vnode`

```typescript
_createElement (
  context,
  tag, 
  data, // 属性，不能是有__ob__的对象
  children, // 子节点
  normalizationType // 用户创建的为2，即总是要序列化
) {
 // ... data检查
 // ...tag检查
 // children检查
 // 如果是编译生成的，直接将children扁平化，如上面的情况，如果是手写的见下面
 if (normalizationType === ALWAYS_NORMALIZE) { // 手写render函数
   children = normalizeChildren(children)
 } else if (normalizationType === SIMPLE_NORMALIZE) { //编译render函数
   children = simpleNormalizeChildren(children)
 }

 if (typeof tag === 'string') { // 普通元素转化
  if (config.isReservedTag(tag)) {  // 标签为div
   vnode = new VNode(tag, data, children, undefined, undefined, context)
  } else if (组件的string tag) {
            Ctor = resolveAsset(context.$options/* 当前vm(组件所在的template) */, 'components', tag/* button-counter */)
            vnode = createComponent(Ctor , data, cintext, children, tag)
        }
 } else if (是组件, Ctor=resolveAsset(xxx,xxx,xxx)){ // 拿到组件对象
  vnode = createComponent(Ctor)
 }
 
 return vnode;
}
```

###### 普通标签转化vnode

```typescript
function normalizeChildren (children) {
 return isPrimitive(children)  //原始类型 typeof为string/number/symbol/boolean之一
    ? [createTextVNode(children)]  // 转为数组的文本Vnode
    : Array.isArray(children)  // 如果是数组
      ? normalizeArrayChildren(children)
      : undefined
}

// 返回[VNode, VNode, VNode]
function normalizeArrayChildren(children) {
  const res = []  // 存放结果
  
  for(let i = 0; i < children.length; i++) {  // 遍历每一项
    let c = children[i]
    if(isUndef(c) || typeof c === 'boolean') { // 如果是undefined 或 布尔值
      continue  // 跳过
    }
    
    if(Array.isArray(c)) {  // 如果某一项是数组
      if(c.length > 0) {
        c = normalizeArrayChildren(c) // 递归结果赋值给c，结果就是[VNode]
        // ... 合并相邻的文本节点
        res.push.apply(res, c)  // 放入res中
      }
    } else {
      // ...
      res.push(c) // 文本节点就穿件VNode，不然直接放入
    }
  }
  return res
}
```

###### 组件转化VNode

1. 创建子类构造函数
2. 安装组件钩子函数
3. 实例化(创建) 组件VNode

```typescript
function createComponent (
   Ctor, // 组件对象，通过组件id,name得到
   tag,  // 组件对象
      data,  // undefined
      context,  // 当前vm实例
      children  // undefined
) {

  // 核心逻辑1：创建子类构造函数
 if (isObject(Ctor)) {
  // 转为Vue的子类，Vue.options._base = Vue， 
  // 会然后返回一个新的构造函数，它拥有Vue完整的功能
   Ctor = baseCtor.extend(Ctor)
 }
 
 
  // 其他逻辑(可跳过)：
  // 1. 异步组件
  // 2. 如果在创建组件构造函数之后应用了全局mixin，则解析构造函数options
  // 3. 将组件 v-model 转换成 props & events
  // 4. 提取props
  // 5. 函数式组件
  // 6. 对事件监听的处理
  // 7. 抽象组件处理
 const listeners = data.on  // 父组件v-on传递的事件对象格式
 data.on = data.nativeOn  // 组件的原生事件
    
    // 核心逻辑2：安装组件钩子函数,有4个，用于创建、销毁等
 installComponentHooks(data) 
    
 // ...
 // 核心逻辑3：实例化 VNode
   const name = Ctor.options.name || tag  // 拼接组件tag用
   const vnode = new VNode(  // 创建组件VNode
  `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,  // 对应tag属性
  data, // 有父组件传递自定义事件和挂载的hook对象
  undefined,  // 对应children属性
  undefined,   // 对应text属性
  undefined,   // 对应elm属性
  context,  // 当前实例
  {  // 对应componentOptions属性
    Ctor,  // 子类构造函数
    propsData, // props具体值的对象集合
    listeners,   // 父组件传递自定义事件对象集合
    tag,  // 使用组件时的名称
    children // 插槽内的内容，也是VNode格式
  },  
  asyncFactory
   )
   
   return vnode
}

```

**installComponentHooks 介绍**
`src/core/vdom/create-component.js`中：

```js

const componentVNodeHooks = {
  init (vnode: VNodeWithData, hydrating: boolean): ?boolean {
    // 实例化vnode，并挂载到dom上
  },
  prepatch (oldVnode: MountedComponentVNode, vnode: MountedComponentVNode) {
    // 处理props等
  },
  insert (vnode: MountedComponentVNode) {
    // ...
  },
  destroy (vnode: MountedComponentVNode) {
    // 销毁命令
  }
}
```

 组件生成的`VNode`如下：

```js
{
  tag: 'vue-component-1-app',
  context: {...},
  componentOptions: {
    Ctor: function(){...},
    propsData: undefined,
    children: undefined,
    tag: undefined,
    children: undefined
  },
  data: {
    on: undefined,  // 为原生事件
    data: {
      init: function(){...},
      insert: function(){...},
      prepatch: function(){...},
      destroy: function(){...}
    }
  }
}
```

如果是通过`vue-loader`打包的组件，本身对象是

```js
{
  beforeCreate: [ƒ]
  beforeDestroy: [ƒ]
  components: {Child: {…}}
  name: "app"
  render: ƒ ()
  staticRenderFns: []
  __file: "src/App.vue"
  _compiled: true
}
```

#### VNode

虚拟dom树，是使用JavaScript的对象来对真实Dom的一个描述。用于最后的patch过程，更新真实的dom树，减少不必要的更新。

![](./imgs/vnode%E7%9A%84%E5%88%9B%E5%BB%BA_img5.png)

Fragment: 抽象节点，`template`,不是真实节点，只把子节点渲染到页面上
Portal: 就是把子节点渲染到给定的目标

[vnode的详细解析见](https://juejin.cn/post/6844903903058722830)

### 虚拟Vnode映射成真实DOM

```js
export function mountComponent(vm, el) {
  vm.$el = el
  ...
  callHook(vm, 'beforeMount')
  ...
  const updateComponent = function () {
    let vnode = vm._render();
    vm._update(vnode); // 最后一步
  }
  ...
}


function lifecycleMixin() {
    Vue.prototype._update = function (vnode, hydrating) {
  var vm = this;
  var prevEl = vm.$el;
  var prevVnode = vm._vnode; // prevVnode为旧vnode节点
  // 通过是否有旧节点判断是初次渲染还是数据更新
  if (!prevVnode) {
   // 初次渲染
   vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false)
  } else { // 数据更新
   vm.$el = vm.__patch__(prevVnode, vnode);
  }
        
        // ...
 }
}
```

接下来就是最复杂patch过程

参考：

- [Vue技术内幕](http://caibaojian.com/vue-design/art/86vue-vdom-patch.html)
