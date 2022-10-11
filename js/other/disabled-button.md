# Disabled button 导致 Tooltip 提示不消失

## 问题

当按钮为 `disabled` 状态时， Tooltip 的提示框在鼠标离开目标节点后不会消失

```tsx
<Tooltip content="tip...">
    <span onClick={() => "当 button disabled 的时候，通过 span 触发 click 事件"}>
        <Button disable={true}>disabled button</Button>
    </span>
</Tooltip>
```

示例：<https://codesandbox.io/s/hopeful-heyrovsky-9b9jvp?file=/index.html>

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Static Template</title>

    <style>
      * {
        margin: 0;
        padding: 0;
      }
      .button-wrap {
        font-size: 0;
        display: inline-block;
        position: relative;
      }
      .button-wrap::after {
        content: "";
        position: absolute;
        top: 0;
        left: 101%;
        display: block;
        width: 100px;
        height: 12px;
        background-color: #fc4;
      }
      .btn-hover::after {
        background-color: #4cf;
      }
    </style>
  </head>
  <body>
    <div>
      <div class="button-wrap" onmouseover="over(this)" onmouseout="out(this)">
        <button>button 1</button>
      </div>
    </div>
    <div style="margin-top: 20px;">
      <div class="button-wrap" onmouseover="over(this)" onmouseout="out(this)">
        <button disabled>onmouseover and onmouseout is not expected</button>
      </div>
    </div>
    <div style="margin-top: 20px;">
      <div class="button-wrap" onmouseenter="over(this)" onmouseleave="out(this)">
        <button disabled>onmouseenter and onmouseleave is expected</button>
      </div>
    </div>

    <script>
      const over = (e) => (e.className += " btn-hover");
      const out = (e) => (e.className = e.className.replace(" btn-hover", ""));
    </script>
  </body>
</html>
```

## 原因分析

当一个元素为 `disabled` 状态时，将不会触发 `onclick`、`onmouseover`、`onmouseout` 等事件，而 tooltip 通过监听 onmouseout 来判断节点失焦，然后关闭提示。
所以当 Button 变成 `disabled` 时，鼠标离开 Button时，由于不触发 `onmouseout` 事件，外层的 Tooltip 无法捕获 `onmouseout`， 提示框就不会关闭。

## 解决方案

### 对于 antd、arco

如果去掉上面问题中的 span 元素，则能正常，但如果需要在 button 为 disabled 时依然要触发某些 click 事件，则没办法

### 通过一个伪元素

设置一个伪元素，当 disabled 状态时，遮住 button 组件，这样就能通过 伪元素 来触发

### 设置 pointer-events

`pointer-events` css 属性可以设置某个特定的元素如何响应鼠标事件（成为该事件的 target）。对于 html 元素来说，它有 2 个属性值：

- `auto` : 默认值，既当前元素能响应所有的鼠标事件
- `none` : 元素不响应任何鼠标事件，既不会成为事件的 target，其后代触发的鼠标事件，将在捕获或冒泡阶段触发父元素的事件侦听器。

因此，通过给 button 组件设置样式：`pointer-events: none;` ，则可以透过 button，触发起父元素的 `onclick`、`onmouseover`、`onmouseout` 事件，就能让 tooltip 在鼠标移除时，响应关闭提示框的事件。

参考

- [mouseenter fires on disabled inputs whereas mouseleave does not](https://github.com/facebook/react/issues/4251)
- [Tooltip和disabled Button一起使用，mouseout的时候Tooltip没有隐藏](https://github.com/ant-design/ant-design/issues/1816)
- [pointer-events](https://developer.mozilla.org/en-US/docs/Web/CSS/pointer-events)
