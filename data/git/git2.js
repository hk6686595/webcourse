// Git 教程 6–10：撤销、差异、暂存、合并进阶
const git6 = {
  id: 'git-diff',
  title: '6. 查看差异：git diff',
  category: '进阶',
  version: '2.x',
  level: '进阶',
  summary: '工作区/暂存区/已提交三者的两两对比：diff 与 diff --staged。',
  detail: [
    'git diff：工作区 vs 暂存区（尚未 add 的改动）。',
    'git diff --staged（或 --cached）：暂存区 vs 上次提交（即将提交的内容）。',
    'git diff HEAD：工作区+暂存区 vs 上次提交（合并看所有未提交改动）。',
    '对比两次提交：git diff <commit1> <commit2>；对比两个分支同理。',
    '--stat 只看文件统计；--name-only 只看文件名；--color-words 词级高亮差异。',
    '查看空格差异：-w 忽略空白；--check 检查空格相关的错误。',
  ],
  notes: [
    '还不会用 git diff 就先提交，是很常见的恐惧来源；先 diff 再审阅后提交是好习惯。',
    '打开 diff 帮助审阅：建议配合 IDE 的图形化 diff 更直观。',
  ],
  example: `# 三组核心对比
git diff                 # 工作区 vs 暂存区
git diff --staged        # 暂存区 vs 上次提交
git diff HEAD            # 全部未提交改动 vs 上次提交

# 指定对象
git diff main feature/login
git diff HEAD~2 HEAD     # 最近两次提交之间

# 输出控制
git diff --stat
git diff --name-only
git diff -w              # 忽略空白差异`,
  example2: `# 只看单文件 / 目录的差异
git diff -- src/index.js
git diff -- src/ tests/

# 词级差异（改动行内精确到单词）
git diff --word-diff

# 少量上下文行
git diff -U3              # 默认 3 行
git diff -U1              # 前后各 1 行

# 颜色与分页
git diff --color
git diff --color=always | less -R

# 配合 IDE / 外部工具打开图形化 diff
git config --global diff.tool vscode
git difftool`,
  example3: `# diff 与分支/引用
# 当前分支相对 main 的所有差异
git diff main

# 两个提交之间
git diff HEAD~2 HEAD

# 暂存区与某次提交对比
git diff --staged HEAD~1

# 只看新增/删除行数（--stat 概览）
git diff --stat main feature/x

# 检查要提交的文件是否有空白错误
git diff --check`,
};

const git7 = {
  id: 'git-stash',
  title: '7. 暂存工作区：git stash',
  category: '进阶',
  version: '2.x',
  level: '进阶',
  summary: '暂停手中工作，切分支处理别的，再回来继续：stash 全家桶。',
  detail: [
    'git stash：把未提交的改动暂存起来，让工作区回到干净状态（用于切换分支前）。',
    'git stash push -m "wip" 带消息；git stash -u 连同未跟踪文件一起暂存。',
    'git stash list 查看所有暂存；git stash apply 恢复但不删除，pop 恢复并删除。',
    'git stash pop / apply 默认恢复最近一次（stash@{0}），也可指定 stash@{1}。',
    '冲突：恢复时目标位置已有改动会冲突，解决后提交即可。',
    'git stash drop 删除；clear 清空；branch name 从暂存创建分支。',
  ],
  notes: [
    'stash 改动与已暂存状态都会保留；未跟踪文件默认不 stash，记得加 -u。',
    '多个 stash 用消息区分：git stash push -m 比裸 stash 更可读。',
  ],
  example: `# 场景：在 feature 分支写了一半，被叫去修线上 bug
git stash push -m "登录页开发中"     # 存起当前改动
git switch main
# …修 bug、提交、切回…
git switch feature/login
git stash apply                      # 找回改动（不删除记录）

# 常用
git stash list
git stash pop                        # 恢复并删除
git stash show -p stash@{0}          # 查看内容
git stash drop stash@{0}             # 丢弃某个
git stash clear                      # 清空全部`,
  example2: `# 常见场景补全
# 场景：紧急切换分支，但不小心还有未跟踪文件
git stash push -u -m "含未跟踪文件"   # -u 连新文件一起暂存

# 场景：真正恢复并同时删除记录
git stash pop                        # 等价 apply + drop

# 场景：多个 stash 并存，精确恢复
git stash list                       # stash@{0}, stash@{1}...
git stash apply stash@{2}            # 恢复指定某个

# 恢复时可能冲突，解决后：
git add . && git commit -m "恢复 stash 改动"`,
  example3: `# stash 与分支/新提交
# 从某个 stash 开新分支（不再弹回原处）
git stash branch fix/urgent stash@{0}

# 只把已跟踪文件的改动弹回
git stash apply --index              # 恢复暂存状态

# 查看某个 stash 改动的文件
git stash show stash@{0}
git stash show -p stash@{0}          # 带完整内容

# 改名 / 弃车保帅
git stash drop stash@{0}             # 丢弃确定不要的
git stash clear                      # 一键清空全部（危险但有用）
`,
};

const git8 = {
  id: 'git-reset',
  title: '8. 撤销与回滚：git reset / git revert',
  category: '进阶',
  version: '2.x',
  level: '进阶',
  summary: '软/混/硬重置三态与安全回滚：区分 reset 与 revert 的使用场景。',
  detail: [
    'git reset 移动 HEAD 指针并可选重置暂存区/工作区，共三档。',
    '--soft：只移动 HEAD，暂存区不动（保留改动为已暂存状态）。',
    '--mixed（默认）：移动 HEAD 且重置暂存区，改动退回工作区。',
    '--hard：三者全部回退，改动彻底丢失——危险，慎用于已提交推送的 commit。',
    'reset 用于“本地还没推送”的撤销；已推送则用 git revert 制造反向提交，留言明确。',
    'git reset <commit> 回退到某提交；常用 HEAD~1 表示上一个提交。',
  ],
  notes: [
    '--hard 后真想找回可用 git reflog + git reset --hard 恢复，但仅限本地历史。',
    '推送到远程的分支不要 reset，用 revert 生成“撒销提交”最安全。',
  ],
  example: `# 撤销最近一次提交但保留改动（最常见）
git reset --soft HEAD~1     # 改动保留在暂存区
git reset HEAD~1            # 改动退回工作区（消息也撤销）

# 连改动一起扔掉
git reset --hard HEAD~1

# 已推送版本的回滚（安全方式）
git revert HEAD             # 生成一次反向提交并提交
git revert <commit-hash>    # 撤销指定提交

# 后悔药：找回误删的提交
git reflog
git reset --hard HEAD@{2}`,
  example2: `# reset 三档对同一处改动的差别
git commit -m "temp"                 # 先有一笔提交
git reset --soft HEAD~1              # 指针回退，改动保留在暂存区
git reset HEAD~1                     # 指针回退，改动退回工作区(未暂存)
git reset --hard HEAD~1              # 指针回退，改动彻底消失

# 只撤销暂存、保留工作区（相当于撤回 git add）
git reset HEAD file

# 回退到指定提交
git reset --hard <commit-hash>`,
  example3: `# 已推送分支的安全回滚用法
git revert HEAD                      # 生成反向提交(推荐)
git revert --no-commit HEAD~3..HEAD  # 一次暂存多个反向改动，统一提交

# 用 reflog 找回被 reset 误删的提交
git reflog                           # 列出所有 HEAD 移动记录
git reset --hard <hash>              # 回到 find 到的那个提交

# 区分场景速记:
#  未推送 -> reset（改历史）
#  已推送 -> revert（加反向提交，不动历史）
git status`,
};

const git9 = {
  id: 'git-restore',
  title: '9. 文件级恢复：git restore / checkout',
  category: '进阶',
  version: '2.x',
  level: '进阶',
  summary: '只针对单个文件/目录的恢复：丢弃工作区改动、撤销暂存、找回历史版本。',
  detail: [
    'git restore file：丢弃该文件的工作区改动（恢复为暂存区内容）。',
    'git restore --staged file：将文件从暂存区退回工作区（撤销 git add）。',
    '以上两个也可合并：git restore --staged --worktree file 完全还原。',
    '从某次提交找回文件：git restore --source=<commit> file。',
    '老命令等价物：git checkout -- file 与 git reset HEAD file，语义更隐晦。',
    '危险边界：restore 覆盖未提交改动会丢数据，Git 不弹出确认，务必确认文件无新改动。',
  ],
  notes: [
    '只想保留部分改动？用 git restore -p 交互式按块恢复。',
    '文件已删除但未提交？git restore file 即可找回。',
  ],
  example: `# 丢弃某个文件的工作区改动
git restore src/temp.js

# 撤销一次误 add
git restore --staged README.md

# 从历史版本恢复单个文件
git restore --source=abc1234 src/index.js

# 交互式按块恢复
git restore -p

# 等价老写法
git checkout -- file
git reset HEAD file`,
  example2: `# 从某次提交恢复单个/多个文件
git restore --source=<commit-hash> src/index.js
git restore --source=HEAD~2 README.md style.css

# 完全丢弃所有未提交改动(工作区+暂存区一起还原)
git restore .                        # 当前目录所有文件
git restore --staged --worktree .    # 同时撤销 add 并还原工作区

# 找回误删且未提交的文件
git restore deleted-file.js`,
  example3: `# 交互式「按块」恢复（精细控制）
git restore -p src/app.js
# 提示符输入：y恢复该块 / n跳过 / a整文件 / d整文件跳过

# 只恢复特定文件的历史版本
git show <commit-hash>:path/to/file > 新文件

# restore 与 reset 分工:
#   reset HEAD file -> 撤销 git add（退回工作区）
#   restore file    -> 丢弃工作区改动
git status`,
};

const git10 = {
  id: 'git-merge-rebase',
  title: '10. 合并与变基：merge 与 rebase 之争',
  category: '分支',
  version: '2.x',
  level: '进阶',
  summary: '两种“整合分支”的方式：merge 保留历史，rebase 线性历史，各有利弊。',
  detail: [
    'git merge：把另一分支并入当前分支，生成合并提交；保留真实分叉历史，适合记录“合作过程”。',
    '快进合并：当前分支未分叉时，merge 直接快进、不产生额外提交。',
    'git rebase：把当前分支的提交“搬”到目标分支顶部，历史呈线性，更整洁。',
    'rebase 黄金法则：只 rebase 自己独有的、未推送到共用的提交。',
    '冲突处理：merge 冲突一次解决一次；rebase 每搬运一个提交都可能冲突。',
    '最终取舍：团队历史讲究可追溯用 merge；讲究简洁清晰用 rebase（配合 squash）。',
  ],
  notes: [
    'merge --no-ff 强制保留合并提交节点，即使可以快进。',
    'rebase 后推送到远程需要强制推送（-f），多人共用分支请谨慎。',
  ],
  example: `# 合并
git switch main
git merge feature/login
git merge --no-ff feature/login      # 强制生成合并提交

# 变基
git switch feature/login
git rebase main                      # 把 feature 提交搬到 main 顶端
git switch main
git merge feature/login              # 此时是快进
# 或一行：git pull --rebase 拉取时自动变基

# 冲突后
git add <file>
git rebase --continue
git rebase --abort`,
  example2: `# merge 的历史图 vs rebase 的历史图
# merge（保留分叉）
git switch main
git merge feature/login          # 出现 Merge branch 提交节点
git log --graph --oneline

# rebase（线性）
git switch feature/login
git rebase main                  # 把 feature 提交依次重放到 main 顶部
git log --graph --oneline        # 一条直线，更整洁

# 一行拉取时自动变基
git pull --rebase`,
  example3: `# 快进合并与 --no-ff
# feature 基于 main 且 main 未动 -> 可快进(不产生合并提交)
git merge feature/login

# 想保留“功能合并”节点用 --no-ff
git merge --no-ff feature/login

# rebase 冲突演练：每搬一个提交都解决一次
# 搬第 N 个提交时报冲突 -> 改 -> add -> continue
git rebase --continue
# 实在搞不定直接放弃
git rebase --abort

# rebase 后推送需强制推送（仅自己的分支）
git push --force-with-lease`, 
};

if (typeof module !== 'undefined') module.exports = { git6, git7, git8, git9, git10 };