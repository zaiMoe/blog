# lock文件冲突

在并行项目开发中，如果不同分支各自都更新了依赖，对于慢合入 master 的分支，在 `merge master` 是，就可能产生冲突。 对于冲突，我一般采取的策略是先使用 mastet 的 lock 文件，然后解决完其他冲突后（如 package.json），在执行 install 更新 lock 文件（npm/yarn/pnpm）
