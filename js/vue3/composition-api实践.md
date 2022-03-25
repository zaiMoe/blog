# composition-api实践


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