# 基础知识

## this

```typescript
// TypeScript input with 'this' parameter
function fn(this: SomeType, x: number) {
  /* ... */
}

```

this编译后会被擦出

```js
function fn(x) {
  /* ... */
}
```

其作用就是可以检测出 this 的使用是否正确，例如

```typescript

class MyClass {
  name = "MyClass";
  getName(this: MyClass) {
    return this.name;
  }
}
const c = new MyClass();
// OK
c.getName();
 
// Error, would crash
const g = c.getName;

// The 'this' context of type 'void' is not assignable to method's 'this' of type 'MyClass'.
console.log(g()); // this 指向 window，如果没有 this: MyClass 则不会报错
```

### 参考

- [this-parameters、this-types](https://www.typescriptlang.org/docs/handbook/2/classes.html#this-parameters)
- [详解Typescript里的This](https://zhuanlan.zhihu.com/p/104565681)
