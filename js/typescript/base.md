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

## 扩展一个第三库的类型声明

例如想将项目中的 `RouteConfig` 和 一些菜单配置合并在一起，同时兼容 `RouteConfig` 原本的类型

```typescript
import type { RouteConfig } from 'react-router-config' 

export const routerConfig: RouteConfig[] = [     
  {         
    path: '/xxx',         
    meta: {} // error， 类型不存在，如何扩展     
  } 
] 
```

```typescript
// global.d.ts
import { RouteConfig } from 'react-router-config' 
interface RouteMeta {     title: string } 

declare module 'react-router-config' {     
  interface RouteConfig {         
    meta?: RouteMeta;     
  }
} 
```

## 函数式组件的泛型写法

```tsx
import { FC, PropsWithChildren } from 'react';

export interface Base {
  id: number | string;
}

export interface TableProps<T extends Base> {
  list: T[];
}

export const Table = <T extends Base>({
  list,
  children,
}: PropsWithChildren<TableProps<T>>) => (
  <table>
    {list.map(({ id }) => (
      <tr key={id}>{children}</tr>
    ))}
  </table>
);

// 断言箭头函数为 FC，否则此处无法提示函数组件的 React 专用属性
(Table as FC).displayName = 'Table';

```
