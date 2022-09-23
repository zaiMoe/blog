# lock文件冲突

在并行项目开发中，如果不同分支各自都更新了依赖，对于慢合入 master 的分支，在 `merge master` 时，就可能产生冲突，然后就有了不同的解决方案：

1. 删除 lock 文件，再 `install`： 不可取，会导致依赖全量更新
2. 纯手工处理冲突： 这种适合于冲突少量的时候，也不建议
3. 先还原为 master 的 lock 文件 `git checkout origin/master -- yarn.lock`，然后解决完其他冲突后（如 package.json），在执行 `install` 更新 lock 文件
4. 直接 `install`，在 [npm@5.7.0](https://github.com/npm/npm/releases/tag/v5.7.0)，[yarn@1.0.0](https://github.com/yarnpkg/yarn/releases/tag/v1.0.0), [pnpm@v5.11.0](https://github.com/pnpm/pnpm/releases/tag/v5.11.0) 即支持在 `install` 时，自动解决冲突

比较上面的4种方法，很明显，如果 `lock` 文件有冲突，采用第4种最为方便，直接 `install` 即可，安装过程会给出冲突合并的提示

```bash
yarn install
...
yarn install v1.0.1
info Merge conflict detected in yarn.lock and successfully merged.
[1/4] Resolving packages...
...
```

## 原理分析

虽然 `install` 可以解决冲突，但其背后采用什么样的策略来解决冲突，则是完全不明白。网上对于这块的分析比较少，于是根据各自的发布日志，找到了相关的 PR，来了解解决的策略（发布日志在上面第4点的链接种以附加）。这里以 pnpm 的 [pr](https://github.com/pnpm/pnpm/pull/2965/commits/37fffbefa5a9136f2e189c01a5edf3c00ac48018) 来找到相关的改动：

首先可以找到处理冲突的文件和方法

```ts
// https://github.com/pnpm/pnpm/blob/main/packages/merge-lockfile-changes/src/index.ts#L5


export default function mergeLockfileChanges (ours: Lockfile, theirs: Lockfile) {
    // ...

    // ...
}

```

这里先不管函数的入参是什么。 我们接着从 pr 种找到那里调用这个函数的地方

```ts
// https://github.com/pnpm/pnpm/blob/main/packages/lockfile-file/src/read.ts#L64

async function _read (
  lockfilePath: string,  // lock 文件路径
  prefix: string, // only for logging
  opts: {
    autofixMergeConflicts?: boolean // 是否自动处理冲突
    wantedVersion?: number
    ignoreIncompatible: boolean
  }
): Promise<{
    lockfile: Lockfile | null
    hadConflicts: boolean
}> {

    // ... 

    
    let lockfileFile: LockfileFile
    let hadConflicts!: boolean
    try {

        // 解析 yaml 文件
        lockfileFile = yaml.load(lockfileRawContent) as Lockfile
        hadConflicts = false
    } catch (err: any) { 

        // 解析错误
        if (!opts.autofixMergeConflicts || !isDiff(lockfileRawContent)) {
            throw new PnpmError('BROKEN_LOCKFILE', `The lockfile at "${lockfilePath}" is broken: ${err.message as string}`)
        }

        // 有冲突
        hadConflicts = true
        lockfileFile = autofixMergeConflicts(lockfileRawContent) // 合并冲突
        logger.info({
            message: `Merge conflict detected in ${WANTED_LOCKFILE} and successfully merged`,
            prefix,
        })
    }

    // ...
}

```

再来看看 `autofixMergeConflicts` 函数做了什么

```ts
// https://github.com/pnpm/pnpm/blob/main/packages/lockfile-file/src/gitMergeFile.ts

import { Lockfile } from '@pnpm/lockfile-types'
import mergeLockfileChanges from '@pnpm/merge-lockfile-changes'
import yaml from 'js-yaml'

const MERGE_CONFLICT_PARENT = '|||||||'
const MERGE_CONFLICT_END = '>>>>>>>'
const MERGE_CONFLICT_THEIRS = '======='
const MERGE_CONFLICT_OURS = '<<<<<<<'

export function autofixMergeConflicts (fileContent: string) {

  
  const { ours, theirs } = parseMergeFile(fileContent)

  // 此处传入
  // ours： 当前分支原 lock 文件的依赖数据
  // theris: 于 master 分支有冲突的部分依赖数据
  return mergeLockfileChanges(
    yaml.load(ours) as Lockfile,
    yaml.load(theirs) as Lockfile
  )
}

// // 根据冲突的 git 标识， 将冲突的代码分为 2 部分
function parseMergeFile (fileContent: string) {
  const lines = fileContent.split(/[\n\r]+/g)
  let state: 'top' | 'ours' | 'theirs' | 'parent' = 'top'
  const ours = []
  const theirs = []
  while (lines.length > 0) {
    const line = lines.shift() as string
    if (line.startsWith(MERGE_CONFLICT_PARENT)) {
      state = 'parent'
      continue
    }

    // 此处为当前分支的依赖，于没有冲突的部分放在一起
    if (line.startsWith(MERGE_CONFLICT_OURS)) {
      state = 'ours'
      continue
    }

    // master 分支依赖，于当前分支有冲突的部分， 单独提出来
    if (line === MERGE_CONFLICT_THEIRS) {
      state = 'theirs'
      continue
    }
    if (line.startsWith(MERGE_CONFLICT_END)) {
      state = 'top'
      continue
    }
    if (state === 'top' || state === 'ours') ours.push(line)
    if (state === 'top' || state === 'theirs') theirs.push(line)
  }
  return { ours: ours.join('\n'), theirs: theirs.join('\n') }
}

export function isDiff (fileContent: string) {
  return fileContent.includes(MERGE_CONFLICT_OURS) &&
    fileContent.includes(MERGE_CONFLICT_THEIRS) &&
    fileContent.includes(MERGE_CONFLICT_END)
}
```

其实就是将冲突的部分，分为 `ours` 和 `thiers` 两部分，然后比较两者相同依赖包的版本，那个版本比较新就用那个的，代码如下：

```ts
// https://github.com/pnpm/pnpm/blob/main/packages/merge-lockfile-changes/src/index.ts#L84

function mergeVersions (ourValue: string, theirValue: string) {
  if (ourValue === theirValue || !theirValue) return ourValue
  if (!ourValue) return theirValue
  const [ourVersion] = ourValue.split('_')
  const [theirVersion] = theirValue.split('_')

  // 使用最新的版本
  if (semver.gt(ourVersion, theirVersion)) {
    return ourValue
  }
  return theirValue
}
```

由此我们可以得知，pnpm 在解决冲突的时候，保留的时最新（大）的包版本，一般来说没什么问题，除非当前分支安装的依赖，比 master 的依赖版本要小，且最新版本对于当前分支使用的 case 有bug， 不过这种场景比较少见，因此基本满足需求。

## 第3种的使用场景

上面那种适合在 `merge` 过程处理，但如果是 `rebase`，由于过程种会出现多次需要解决冲突的情况，如果每次解决冲突执行 `install` 来处理 lock 文件冲突，会比较麻烦，所以可以统一用基线的 lock 文件，等 rebase 结束后，在 `install` 更新 lock 文件

## 总结

1. 对于 `merge` 遇到的 lock 冲突，在解决完 package.json 的冲突后，直接运行 `install` 即可自动修改冲突
2. 对于 `rebase` 过程 lock 冲突，则先还原为基线的 `lock` 文件 `git checkout origin/master -- yarn.lock`，然后解决完其他冲突后（如 package.json），在执行 `install` 更新 lock 文件

## 参考

- [Solving conflicts in package-lock.json](https://tkdodo.eu/blog/solving-conflicts-in-package-lock-json)
- [Resolve Merge Conflicts in yarn.lock](https://www.jakewiesler.com/blog/merge-conflicts-in-yarn-lock)
- [npm install 生成的package-lock.json是什么文件？有什么用？](https://www.zhihu.com/question/62331583/answer/275248129)
