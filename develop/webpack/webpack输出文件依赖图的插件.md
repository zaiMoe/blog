# webpack输出文件依赖图的插件

### 方案

1. 写个node工具解析，如 <https://github.com/dependents/node-dependency-tree>
2. 另类方案：<https://juejin.cn/post/6844903847408713735>
3. webpack插件：
    - <https://juejin.cn/post/6844903847408713735>
    - <https://github.com/uoau/dependency-tree-webpack-plugin>

还有如`webpack-bundle-analyzer`插件，是根据最后的stats参数来进行分析的，所以也可以通过stats插件来进行处理

stats对象的数据：<https://www.webpackjs.com/api/stats/>

```json
{
entrypoints: {},
chunks: []
}
```

### 实现

##### 创建依赖关系图

1. 根据`entrypoints`来获取入口的`chunkID`
2. 根据`id`找到对于的`chunk数据`，会用到其中两个数据：

```
{
    id: number,
    modules: [], // 这个chunk所依赖的所有modules，里面是无序排列的
    children: [] // 这个chunk拆分出去的子chunk，如使用import()
}
```

3. 因为modules中的位置是无序的，无法从起始节点进行dfs（判断不了那个是入口，也没有子依赖的信息），其中有用的信息为：

```typescript
{
    name: '',
    reasons: [ ] // 模块被引入的信息，包含其父模块的路径，代码的位置
}
```

因此，可以根据`reason`来往上找父模块，然后见自己添加到父模块的`dependency`中，如果父模块不存在，就创建一个对象，保存在map中，通过引用关系，绘制出完整的依赖关系(不存在就创建，存在就直接添加数据)。但这样依然有2个问题要处理：

- 所有的数据都在map中，不知道数据对象哪个是入口文件
- 循环依赖，会无法输出
这些在后面解决

4. 遍历modules时，存在一些数据可以直接跳过
    - 以`multi ./src/xxx.vue`开头的信息模块name，这些可以跳过，估计表示的是多出使用的
    - 带有`.vue?vue`的，可以跳过
    - 以`external ./src/xxx.vue`开头

5. 遍历`module.reasons`时，可以用过里面的`type`属性判断是否为入口文件，入口文件的`type`值为`single entry`，在map中加入标记，方便后面输入做遍历

##### 输入json

上面处理完了之后，就可以输出了

我们直接找到map中标记有`isRoot: true`的数据，放入新对象中，进行输出，但这里需要考虑循环依赖的问题，root节点所表示的，实际上是一个有向有环图，而能输出json的必须是无环的，我们将其转成DGA图的数据：

1. 从root往下进行dfs**后序遍历**，外部用一个caches记录遍历过的对象
2. 参考深拷贝中处理循环引用和相同引用的处理方式
    - 当caches中存在当前对象时，且该对象有值，则表示是相同引用（兄弟引用），则直接返回处理过的值
    - 当caches中存在当前对象时，因为后序遍历，此时该对象没有内容，则说明是循环引用，切断该引用，比如返回`circular reference`
3. 将处理后的数据输出
