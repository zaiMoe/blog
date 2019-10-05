# markdown转PPT

> [源码地址](https://gitee.com/zaiMoe/remarkpt)

## 这是什么？

1. 将写好的md文件快速转成网页版PPT，方便平时写分享文档后还要花费时间做ppt。

2. ppt使用[remark.js](https://github.com/gnab/remark)，
这里只是将其封装成一个工具，这样我们不用关注如何生成，直接愉快的写md就行。
markdown和remark.js使用请参考remark.js的[wiki](https://github.com/gnab/remark/wiki/Markdown)

## 如何使用
### use
```
git clone

yarn install

npm link

cd */my-project

remarkpt

cd dist
remarkpt server
```

### test
```
npm run test
```

## 命令参数
1. `remarkpt`命令前两个参数对应要转换的md文件和转换后生成的html文件。

2. -o: `output`, 输出目录， 默认是`dist`

3. --css: 自定义样式表，因为是页面，你可以修改原本默认的样式 会复制到`输出目录/static/`

## TODO
1. 完善样式和添加更多的主题

![](./logo.png)
