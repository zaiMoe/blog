# lock文件冲突

在并行项目开发中，如果不同分支各自都更新了依赖，对于慢合入 master 的分支，在 `merge master` 是，就可能产生冲突，然后就有了不同的解决方案：

1. 删除 lock 文件，再 `install`， 不可取，会导致依赖全量更新
2. 纯手工处理冲突， 这种适合于冲突少量的时候
3. 先还原为 master 的 lock 文件 `git checkout origin/master -- yarn.lock`，然后解决完其他冲突后（如 package.json），在执行 `install` 更新 lock 文件
4. 直接 `install`，在 [npm@5.7.0](https://github.com/npm/npm/releases/tag/v5.7.0)，[yarn@1.0.0](https://github.com/yarnpkg/yarn/releases/tag/v1.0.0), [pnpm@v5.11.0](https://github.com/pnpm/pnpm/releases/tag/v5.11.0) 即支持在 `install` 时，自动解决冲突

比较上面的4种方法，如果 `lock` 文件有冲突，则采用第4种最为方便，直接 `install` 即可。

```bash
yarn install
  ...
    yarn install v1.0.1
    info Merge conflict detected in yarn.lock and successfully merged.
    [1/4] Resolving packages...
  ...
```

但是其背后采用什么样的策略来解决冲突，则是完全不明白。 于是根据各自的发布日志，找到了相关的 PR，来了解解决的策略。

### 第3种的使用场景

## 参考

- [Solving conflicts in package-lock.json](https://tkdodo.eu/blog/solving-conflicts-in-package-lock-json)
- [Resolve Merge Conflicts in yarn.lock](https://www.jakewiesler.com/blog/merge-conflicts-in-yarn-lock)
- [npm install 生成的package-lock.json是什么文件？有什么用？](https://www.zhihu.com/question/62331583/answer/275248129)
