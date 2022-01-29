# Enum and As Const

### enum

枚举类型，创建一个命名空间的，可以有[数字枚举](https://www.typescriptlang.org/docs/handbook/enums.html#numeric-enums)或者[字符串枚举](https://www.typescriptlang.org/docs/handbook/enums.html#string-enums)

例如：

```typescript
enum Color {
    green = '#0f0',
    blue = '#00f',
    num = 0,
}

// 编译后
"use strict";
var Color;
(function (Color) {
    Color["green"] = "#0f0";
    Color["blue"] = "#00f";
    Color[Color["num"] = 0] = "num";
})(Color || (Color = {}));

// 数字枚举可以双向映射枚举
const zero = Color.num;
const key = Color[zero];
```

### enum 类型 - 联合枚举

当 enum 的每个成员都有枚举值时，则可以作为一个**枚举类型**来使用

```typescript
enum Color {
    green = '#0f0',
    blue = '#00f',
}

// 枚举成员的联合类型
let color: Color;
color = Color.blue; // ✅ ok
color = '#00f'; // ❌ Type '"#00f"' is not assignable to type 'Color'

// 枚举成员类型
interface Type1 {
    color: Color.green
    num: number
}

const type1: Type1 = {
    num: 0,
    color: Color.green // ✅ ok
}
const type2: Type1 = {
    num: 0,
    color: Color.blue // ❌ Type 'Color.blue' is not assignable to type 'Color.green'.
}
```

### const enum

编译阶段会删除这个枚举， 使用的地方直接用具体的值

```typescript
const enum Directions {
    Up,
    Down,
    Left,
    Right
}

let directions = [Directions.Up, Directions.Down, Directions.Left, Directions.Right]
```

编译后

```typescript
var directions = [0 /* Up */, 1 /* Down */, 2 /* Left */, 3 /* Right */];
```

### as const

`as const` 是在 [3.4](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions)
版本引入的 `const` 断言

**const断言**允许TypeScript采用最具体的表达式类型，并创建一个完全只读的对象。

```typescript
// Type '"hello"'
let x = "hello" as const;
x = 'hello';  // ✅ 
x = 'xx'; // ❌ Type '"xx"' is not assignable to type '"hello"'.

// Type 'readonly [10, 20]'
let y = [10, 20] as const;
y[0] = 1; // ❌ Cannot assign to '0' because it is a read-only property.
let y1 = [10, 20];
y1 = [1, 2, 3];  // ✅ Type number[]
const y2 = [10, 20];
y2[2] = 30;  // ✅ Type number[]

// Type '{ readonly text: "hello" }'
let z = {text: "hello"} as const;
z.a = 1; // ❌ Cannot assign to 'text' because it is a read-only property.
z.text = 'xx'; // ❌ Cannot assign to 'text' because it is a read-only property.
let z1 = {text: "hello"}; // ✅ Type '{ text: string }'
const z2 = {text: "hello"}; // ✅ Type '{ text: string }'
```

### Enum vs As Const

1. `enum` 声明的类型，能使用其成员作为**类型**或所有成员的**联合类型**，如

```typescript
enum Colors {
    green = '#0f0',
    blue = '#00f',
}

let color: Colors;
color = Colors.blue; // ✅ ok
color = '#00f'; // ❌ Type '"#00f"' is not assignable to type 'Color'
```

2. 如果用 `const` 来达到同样的效果：

```typescript
const colors = {
    green: '#0f0',
    blue: '#00f',
} as const

// 联合类型
type Colors = (typeof colors)[keyof typeof colors];
let color: Colors;
color = '#00f'; // ✅ ok
color = colors.blue; // ✅ ok
color = colors.green; // ✅ ok
color = '#333';// ❌ Type '"#333"' is not assignable to type 'Colors'.

// 单个成员类型
namespace Color {
    export type green = typeof colors.green;
    export type blue = typeof colors.blue;
}

let color2: Color.blue;
color2 = colors.green; // ❌ Type '"#0f0"' is not assignable to type '"#00f"'.
color2 = '#00f'; // ✅ ok
color2 = colors.blue; // ✅ ok
```

#### 总结

1. 对于 `enum`来说除了少写点代码外，约束更强。例如`'#00f'` 和 `Colors.blue` 不能互换，使用时大家都必须引入 `Colors` 来赋值
2. 对于 `as const` 来说，使用会更加方便，`'#00f'` 和 `Colors.blue` 可以等价，修改方便

### 参考

[Enum vs As Const](https://stackoverflow.com/questions/66862421/enum-vs-as-const)