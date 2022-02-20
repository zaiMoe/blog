# js中不常用api

### queryObjects

`queryObjects`是Chrome 62新增的一个`Command Line API`。

`queryObjects` 从当前 `execution context` 中的所有对象中过滤出原型链中包含指定原型对象的对象。

### 生成随机uid

`URL.createObjectURL(new Blob()).substr(-36)`
