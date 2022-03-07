# mongodb

### wsl下的安装

<https://docs.microsoft.com/zh-cn/windows/wsl/tutorials/wsl-database#install-mongodb>
<https://docs.mongodb.com/v4.4/tutorial/install-mongodb-on-ubuntu/>

### 命令行工具

<https://www.mongodb.org.cn/manual/>

- mongo：连接数据库服务，即连接服务器,进入命令行shell终端
- mongod：启动数据库服务、启动mongodb服务时需要先确定数据库文件存放的位置。如`mongod --dbpath ./data/db`
- mongofiles：
- mongoexport、mongoimport：用来导入导出JSON、CSV和TSV数据，数据需要支持多格式时有用
- mongodump、mongorestore：备份和恢复数据库的标准工具
- mongos
- mongostat：查看对数据库进行的操作
- mongotop：：监控

### 常用命令

启动mongodb

```bash
service mongodb start # 启动服务
service mongodb status # 查看状态
service mongodb stop # 停止运行数据库
```

```bash
show dbs    # 查看数据库列表
use name    # 创建、选择数据库
db          # 查看当前数据库
show collections  # 查看当前数据库下的表;
db.dropDatabase() # 删除当前数据库
```

##### 插入

```bash
db.表名.drop()      # 删除当前数据库指定表
db.表名.insert()    # 删除当前数据库指定表
db.表名.save()      # 更新，当默认的“_id”值已存在时，调用insert方法插入会报错；而save方法不会,会更新相同的_id所在行数据的信息
```

##### 查找

```bash
db.表名.find():                     # 查询表中所有数据
db.表名.find(条件):                 # 按条件查询
db.表名.findOne(条件):              # 查询第一条(支持条件)
db.表名.find().limit(数量):         # 限制数量
db.表名.find().skip(数量):          # 跳过指定数量
db.表名.find().forEach(printjson)   # 以json形式打印
```

##### 修改

```bash
db.表名.update(query, update, upsert, multi)
# db.col.update( { "count" : { $gt : 1 } } , { $set : { "test2" : "OK"} } );
```

##### 删除

```bash
db.表名.remove(query, justOne);
```

### 概念

![c268eac3b6e82193a0fed40fb9be2623.png](en-resource://database/1179:1)

- document(文档): 以key-value的方式保存数据，文档中的键值是有序的

  1. 文档中的键/值对是有序的 !( 注意这点和json还有python中的字典是不一样的)
  2. 文档中的值不仅可以是在双引号里面的字符串，还可以是其他几种数据类型（甚至可以是整个嵌入的文档)。
  3. MongoDB区分类型和大小写。
  4. MongoDB的文档不能有重复的键。
  5. 文档的键是字符串。除了少数例外情况，键可以使用任意UTF-8字符。

- collection(集合): 如同文档组，可以存放多个文档集合
