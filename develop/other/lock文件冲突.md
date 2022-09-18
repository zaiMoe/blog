# lock文件冲突

在并行项目开发中，如果不同分支各自都更新了依赖，对于慢合入 master 的分支，在 `merge master` 是，就可能产生冲突，然后就有了不同的解决方案：

- 删除 lock 文件，再 `install`， 不可取，会导致依赖全量更新
- 纯手工处理冲突， 这种适合于冲突少量的时候
- 先使用 master 的 lock 文件，然后解决完其他冲突后（如 package.json），在执行 `install` 更新 lock 文件
- 直接 `install`，在 [`npm@5.7.0`](https://github.com/npm/npm/releases/tag/v5.7.0)，[`pnpm@v5.11.0`](https://github.com/pnpm/pnpm/releases/tag/v5.11.0)

## 参考

- [Solving conflicts in package-lock.json](https://tkdodo.eu/blog/solving-conflicts-in-package-lock-json)
- [Resolve Merge Conflicts in yarn.lock](https://www.jakewiesler.com/blog/merge-conflicts-in-yarn-lock)
