# vuepress

## 插件开发

### Markdown 与 Vue SFC

<https://vuepress.github.io/zh/advanced/cookbook/markdown-and-vue-sfc.html>

经过`markdown-it`处理后的`html`，会被转换成一个`sfc`文件，然后交给`vue-loader`处理。
文件中的`script`和`style`标签以外的标签都是`template`

所以，如果要开发一些vue组件，如将【json转成table】的插件，就可以通过插入vue组件来实现。
分别在转换成`html`之前和`html`之后进行处理

### 将配置文件转成表格的插件

[markdown-it原理](https://www.jianshu.com/p/797df3f614e5)：

重点，渲染分为：

- 容器：可以包裹一层东西，不会对里面的内容造成影响
- 块：多行，如表格
- inline：单行

#### 1. 自定义容器

```text
::: table
xxx
:::
```

可以通过 `markdown-it-container` 来处理，容器部分会被提取出来，让我们自定义一个容器去包裹它，而里面的内容就交给其他流程取处理，上面可以转换为

```html
<div class="table">
xxx // markdown-it其他插件处理、块(如表格) or inline (一行的语法)
</div>
```

我们可以通过这种方式，将文件转换成某些标记，然后在render之后进行处理：

```html
// 保存filepath，注释 不会被处理markdown-it处理
<!--table-data-path:${filepath}:table-data-path-->
                 <!--table-data-path-content:
// 这个位置的内容vuepress会将文件内容插入这里面，后面在render之后去掉
:table-data-path-content-->
```

#### 2. extendMarkdown中重写`render`

##### `markdown-it`的转换过程

1. Parser：将md文档解析为Tokens（类似ATS）
2. Renderer：将Tokens内容渲染为html

##### 处理过程

1. 首先去掉`<!--table-data-path-content:([\s\S]*?):table-data-path-content-->`中的内容

2. 通过组件的方式去加载`filepath`和使用
匹配出`filepath`这个字符串，在原本的render生成的html代码中，插入动态生成的vue组件代码，**这样就能保证一个script，就能被vue-loader处理了**。

插入的script如下

```js
`
<scirpt>
import data1 from filepath1;
import data2 from filepath2;

export default {
    name: 'markdown-table-xx'
    components: {
        "markdown-table-1": getVueSfcFn('data1'),
        "markdown-table-2": getVueSfcFn('data2'),
    }
}
</script>
`
```

下面是一个vue组件的生成函数，`tableDataName`是上面`import`进来的数据

```js
function getVueSfcFn(tableDataName) {
    retrun `
    {
        render: function renderTable (h) {
            return h('markdown-table', {
                props: {
                    columns: ${tableDataName}.columns,
                    tableData: ${tableDataName}.data
                }
            })
        } 
    }
    `
}
```

最后将组件插入到渲染后的html中使用：
替换掉`<!--table-data-path:${filepath}:table-data-path-->`为上面注册的组件`<markdown-table-1/>`，保证位置正确

#### 注意

一个sfc文件只允许有一个`script`[标签](https://vue-loader.vuejs.org/zh/spec.html#%E8%84%9A%E6%9C%AC)

所以如果存在其他插件已经插入了`script`（比如下面的插件），那么就需要采用其他方式来插入代码，比如检查`script`和`component: {`，然后再将代码插入

### 见vue文件转成demo和示例代码

<https://docs.chenjianhui.site/vuepress-plugin-demo-container/zh/started.html#%E4%BD%BF%E7%94%A8>
