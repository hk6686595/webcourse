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
};

if (typeof module !== 'undefined') module.exports = { git6, git7, git8, git9, git10 };