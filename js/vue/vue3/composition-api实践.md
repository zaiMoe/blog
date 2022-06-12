# composition-api实践

### mixin常见的问题
1. 命名冲突
2. 隐式依赖，mixin和使用它的组件之间没有层次关系。这意味着组件可以使用mixin中定义的数据属性，但是mixin也可以使用假定在组件中定义的数据属性。
3. 上面两点导致代码容易改动引发，以及不好查BUG

#### mixin 使用约束
- mixin模块的name统一以Mixinxxx的方式命名
- mixin中可以给外部调用的属性或方法，统一以name为前缀，如mixinXXXDetStatus，否则内部统一加private或者_开头表示私有，protect表示需要子重写。
- mixin的时候，子组件不可以直接调用外部的组件方法，即不可以使用this.xxx获取非本mixin中不存在的属性或方法

### 实践

1. 封装异步函数作为hooks，外面使用根据ref(data)响应处理，这样就看不出来在写异步函数
2. 利用computed的get、set封装v-model的受控组件

```js
computed(
    get () {  return props.value}, 
    set (val) { checkVal(); this.emit('input', val) }}
)
```

3. vue2的router、route可以通过 Vue.prototype.$router | $router获取
