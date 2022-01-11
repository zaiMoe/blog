# ts知识点记录

### 文件声明
#### "module": "esnext" 解析
使用  "module": "esnext"  选项：TypeScript 保留  import()  语句，该语句用于 Webpack Code Splitting。

#### strictNullChecks
```
// 不开启的时候 strictNullChecks
type  aa  =  undefined  extends  Function  ?  number  :  string // number

// 开启严格校验
type  aa  =  undefined  extends  Function  ?  number  :  string // string

// 可用以下方法排除
NonNullable<aa> // 元素
type NonNullable<T> = T extends null | undefined ? never : T;
```

### d.ts
#### 如果一个文件不含`import`  或者  `export`的话，会被当成全局声明的变量
```
// a.ts
const a = 233;

// b.ts
const b = a; // OK
```

### 访问修饰符有哪些及其作用
- 公共（Public），类的所有成员，其子类以及该类的实例都可以访问。
- 受保护（Projected），该类及其子类的所有成员都可以访问它们。 但是该类的实例无法访问。
- 私有（Private），只有类的成员可以访问它们。

### interface/type的区别
![3a4938b01c29f40ab56a46096a7809ed.png](en-resource://database/1196:1)

https://beta-pro.ant.design/docs/type-script-cn

建议:   能用 interface 实现，就用 interface , 如果不能才用 type.

### any 和 unknown 的区别
两者最大的区别就是unknown只是个top type(任何类型都是他的subtype），而any即是top type又是 bottom type（他是任何类型的subtype), 这导致any基本上就是放弃了任何类型检查。


### enum / as const / const enum
#### enum
枚举类型，创建一个命名空间的，可以有[数字枚举](https://www.typescriptlang.org/docs/handbook/enums.html#numeric-enums)或者[字符串枚举](https://www.typescriptlang.org/docs/handbook/enums.html#string-enums)

例如：
```typescript
enum Color {
  green = '#0f0',
  blue = '#00f'
}

// 编译后
"use strict";
var Color;
(function (Color) {
    Color["green"] = "#0f0";
    Color["blue"] = "#00f";
})(Color || (Color = {}));

// 可以直接作为 类型 使用
// error: Type '{ green: string; red: string; }' is not assignable to type 'Color'.
const newColor: Color = {
    green: Color.green,
    red: '#'
}
```

#### const enum: 
编译阶段会删除这个枚举， 使用的地方直接用具体的值

#### as const: 


#### 参考
[Enum vs As Const](https://stackoverflow.com/questions/66862421/enum-vs-as-const)

### 分布式条件类型
#### naked type parameter（裸类型）
没有被数组/元组/函数/类/Promise..所包裹类型

#### 分布式条件类型
对于属于裸类型参数的检查类型，条件类型会在实例化时期自动分发到联合类型上。实例化指条件判断(联合裸类型的条件判断)。分发指将裸类型拆分，单独进行判断，形成新的联合类型
```
//  type  A1  =  1
type  A1  =  'x'  extends  'x'  ?  1  :  2;

//  type  A2  =  2
type  A2  =  'x'  |  'y'  extends  'x'  ?  1  :  2;  

//  A3  =  1  |  2
type  P<T>  =  T  extends  'x'  ?  1  :  2;
type  A3  =  P<'x'  |  'y'>  
```

### 直接使用类作为类型，和使用typeof 类作为类型，有什么区别呢？
```
/**
 * 定义一个类
 */
class People {
  name: number;
  age: number;
  constructor() {}
}

// p1可以正常赋值
const p1: People = new People();
// 等号后面的People报错，类型“typeof People”缺少类型“People”中的以下属性: name, age
const p2: People = People;

// p3报错，类型 "People" 中缺少属性 "prototype"，但类型 "typeof People" 中需要该属性
const p3: typeof People = new People();
// p4可以正常赋值
const p4: typeof People = People;
```
- 当把类直接作为类型时，该类型约束的是该类型必须是类的实例；即该类型获取的是该类上的实例属性和实例方法（也叫原型方法）；
- 当把typeof 类作为类型时，约束的满足该类的类型；即该类型获取的是该类上的静态属性和方法。
