// Git 教程 1–5：基础入门
const git1 = {
  id: 'git-intro',
  title: '1. Git 是什么：分布式版本控制',
  category: '入门',
  version: '2.x',
  level: '入门',
  summary: '理解 Git 的核心概念：快照、三棵“树”、分布式模型，以及与 SVN 的区别。',
  detail: [
    'Git 是分布式版本控制系统，2005 年由 Linux 之父 Linus Torvalds 创建，用于管理 Linux 内核。',
    '核心思想：每次提交都是一个完整的项目快照（不再是差异补丁），配合 SHA-1 哈希标识。',
    '每个仓库都有完整历史，可离线操作、本地分支、随时回退，无需依赖中央服务器。',
    '三棵“树”：工作区（Working）、暂存区（Index/Staging）、仓库（HEAD 指向的提交）。',
    '与 SVN 区别：Git 本地带全量历史、分支极廉价、支持离线提交与快速合并。',
    '版本选择：Android Studio / 各类 IDE 已内置 Git；命令行是最通用的方式，建议优先掌握。',
  ],
  notes: [
    'git 的操作几乎都在本地，只有 push/pull/fetch 才访问远程。',
    '提交哈希可通过 git log 查看，前 7 位即可唯一定位。',
  ],
  example: `# 入门三连：配置身份 -> 初始化 -> 首次提交
git config --global user.name  "你的名字"
git config --global user.email "you@example.com"

git init                 # 把当前目录变成仓库
git add .                # 把改动加入暂存区
git commit -m "first commit"   # 提交（同时记录本次快照）

git status               # 查看工作区/暂存区状态
git log --oneline        # 查看提交历史（简洁一行式）`,
  example2: `# 走一遍完整的首次提交流程（含查看效果）
cd ~/projects
mkdir my-app && cd my-app

git init                         # 初始化（默认分支是 main）
echo "hello" > readme.txt
git status                       # 显示 readme.txt 为 Untracked（未跟踪）

git add readme.txt               # 加入暂存区
git status                       # 变为 Changes to be committed（绿色）

git commit -m "feat: 添加 readme"
git log --oneline                # 看到 1 条提交
git log --stat                   # 查看提交改动的文件统计`,
  example3: `# 三棵“树”对照 —— 改动在不同阶段的流转
# 1) 工作区：你正在编辑的文件
echo "new" >> readme.txt

# 2) 暂存区：git add 之后进入
git add readme.txt

# 3) 本地仓库：git commit 之后固化
git commit -m "docs: 追加内容"

# 用 git status 观察文件从 "modified 未暂存"
# 到 "Changes to be committed" 再到 "nothing to commit" 的过程`,
};

const git2 = {
  id: 'git-config',
  title: '2. 初始化与基础配置',
  category: '入门',
  version: '2.x',
  level: '入门',
  summary: 'git init 与 git config：身份、别名、默认分支、编辑器等常用配置。',
  detail: [
    'git init 空仓库：git init 在当前目录建 .git；git init -b main 直接以 main 为默认分支。',
    '身份配置：user.name / user.email 影响提交作者，建议全局配置一次。',
    '常用配置项：core.editor 编辑器、init.defaultBranch 默认分支名、core.autocrlf 换行符处理。',
    '别名：git config --global alias.st status 后可用 git st 代替长命令。',
    '查看配置：git config --list 全部；git config user.name 单项。',
    '全局配置存在 ~/.gitconfig，仓库级配置存在 .git/config，仓库级覆盖全局。',
  ],
  notes: [
    '刚装 Git 忘记配置身份时，提交会失败并提示，这是最常见的新手报错。',
    '同一台机器多个身份（工作/个人）时，用仓库级配置分别设置。',
  ],
  example: `# 首次配置
git config --global user.name  "Zhang San"
git config --global user.email "zs@example.com"

# 别名（懒人必备）
git config --global alias.co  checkout
git config --global alias.br  branch
git config --global alias.st  status
git config --global alias.lg  "log --oneline --graph --all"

# 默认分支为 main（Git 2.28+）
git config --global init.defaultBranch main

# 查看
git config --list
git config user.name`,
  example2: `# 常用配置项逐一看
# 编辑器（合并冲突 / commit 消息打开它）
git config --global core.editor "code --wait"   # VS Code
git config --global core.editor vim

# 换行符：Windows 自动转 CRLF，mac/Linux 用 LF
git config --global core.autocrlf input

# 提交时去除尾随空格
git config --global core.whitespace trailing-space

# 推送时自动变基（避免多余的合并提交）
git config --global pull.rebase true

# 取消全局配置
git config --global --unset user.email`,
  example3: `# 仓库级配置（只对当前仓库生效，覆盖全局）
cd my-cool-repo

# 同一台机器多人/多身份时的做法
git config user.name  "Work Name"
git config user.email "work@company.com"

# 查看某个配置的来源：local(仓库) / global(全局) / system(系统)
git config --show-origin user.name

# 修改全局配置文件（等价命令）
git config --global --edit      # 打开 ~/.gitconfig
# 或直接编辑:
# vim ~/.gitconfig`,
};

const git3 = {
  id: 'git-add-commit',
  title: '3. 暂存与提交：git add / git commit',
  category: '入门',
  version: '2.x',
  level: '入门',
  summary: '掌握 add/commit 的常用形态：指定文件、全部、交互式，以及提交消息规范。',
  detail: [
    'git add 把工作区改动放入暂存区：git add file、git add .（当前目录全部）、git add -A（全仓库）。',
    'git add -p 交互式按块暂存，适合把一次改动拆成多个逻辑提交。',
    'git commit 把暂存区固化为提交：-m 行内消息、-a 跳过暂存直接提交已跟踪文件的改动。',
    '提交只包含已暂存内容，改完未 add 的会留在工作区，不会进入提交。',
    'git commit --amend 修改上一条提交（消息或补漏文件），注意不要用于已推送的提交。',
    '查看确认：git status 提示哪些已暂存/未暂存，git diff --staged 查看将提交的差异。',
  ],
  notes: [
    '提交消息建议一行主题 + 空行 + 正文，描述“为什么”而非“改了什么”。',
    'git add . 会把被忽略的文件提交进去吗？不会——被 .gitignore 忽略的文件不会被 add。',
  ],
  example: `# 指定文件
git add src/index.js
git add css/ js/

# 全部改动
git add .
git add -A

# 提交
git commit -m "feat: 添加登录页"
git commit -a -m "fix: 修复按钮点击无响应"   # 跳过 add（仅跟踪过的文件）

# 修改上一条提交的消息（尚未推送时）
git commit --amend -m "feat: 添加登录页（含表单校验）"

# 预检
git status
git diff --staged`,
  example2: `# 用 git add -p 把改动拆成多个提交
git add -p src/app.js
# 出现交互提示，输入字母操作：
# y  暂存这一块
# n  跳过这一块
# s  把这一块拆成更小
# e  手动编辑这一块
# a 暂存整个文件, d 跳过整个文件

# 常见多文件暂存组合
git add src/ tests/            # 两个目录
git add '*.css'                # 所有 css（需引号防 shell 展开）
git add -u                     # 只暂存已跟踪文件的修改/删除（不新增）`,
  example3: `# 提交消息规范写法（主题 + 空行 + 正文）
git commit -m "feat: 支持邮箱登录

- 新增邮箱验证码接口
- 未注册邮箱自动创建账号
- 密码使用 bcrypt 加密存储

Closes #45"

# --amend 补充漏掉的文件（常见用法）
git add forgot-file.js
git commit --amend --no-edit    # 并入上一条且不修改消息

# 查看提交包含哪些文件
git show --stat HEAD`,
};

const git4 = {
  id: 'git-branch',
  title: '4. 分支管理：创建、切换、合并',
  category: '分支',
  version: '2.x',
  level: '入门',
  summary: '分支是 Git 最强大的特性：创建/切换/重命名/删除，本质是指向提交的指针。',
  detail: [
    '分支本质是一个指向提交对象的可变指针，创建分支几乎是 O(1)，所以鼓励多分支并行。',
    '创建与切换：git branch name 只建不切；git checkout -b name / git switch -c name 建且切。',
    '现代推荐 git switch 用于分支切换，git checkout 通用但职责更多。',
    '合并：git merge name 把目标分支并入当前分支；合并后目标分支可删除。',
    '重命名：git branch -m 旧名 新名；删除：git branch -d name（已合并）/ -D（强制）。',
    '查看：git branch -v 显示各分支最新提交；git branch -a 含远程分支。',
  ],
  notes: [
    'HEAD 是“当前所在分支”的指针，git switch/checkout 改变的就是它。',
    '请不要在主分支上直接开发大功能，开分支隔离，完成后合并。',
  ],
  example: `# 创建并切换新分支
git branch feature/login        # 创建
git checkout feature/login      # 切换
# 或一步到位：
git checkout -b feature/login
git switch -c feature/login

# 在 feature 上开发并提交…
git add . && git commit -m "feat: 登录功能"

# 回到主分支合并
git switch main
git merge feature/login

# 清理
git branch -d feature/login     # 已合并，安全删除
git branch -a`,
  example2: `# 分支的查看与切换细节
git branch                      # 列出本地分支，* 标记当前分支
git branch -v                   # 附带各自最新提交
git branch -vv                  # 附带跟踪的远程分支
git branch -a                   # 含远程分支（红色）
git branch -r                   # 只看远程分支

# switch 的几种用法
git switch feature/x            # 切换到已存在分支
git switch -c feature/y         # 创建并切换
git switch -                    # 切回上一个分支（极常用）
git switch -c feature/z <hash>  # 从指定提交创建`,
  example3: `# 重命名与删除
# 重命名当前分支
git branch -m new-name
# 重命名其他分支
git branch -m old-name new-name

# 删除已合并分支（安全）
git branch -d feature/done

# 强删未合并分支（会丢失改动）
git branch -D feature/abandoned

# 场景：并行开发两个功能
git switch main
git switch -c feature/a    # 功能 A
git add . && git commit -m "feat: A 完成"
git switch main
git switch -c feature/b    # 功能 B（基于最新 main）
# 两个分支互不干扰，随时切换`,
};

const git5 = {
  id: 'git-log',
  title: '5. 查看历史：git log 的常用姿势',
  category: '入门',
  version: '2.x',
  level: '入门',
  summary: '日志查看的常见形态：简洁、图形、过滤、按文件、按作者、按时间。',
  detail: [
    'git log --oneline：一行一个提交（哈希简写 + 标题），日常最常用。',
    '图形化：--graph 显示分支拓扑，搭配 --all 看全部分支。',
    '过滤：--after/-n（最近 n 条）/--author=某人/--grep=关键字（按消息搜索）。',
    '按文件：git log -- path/to/file 只看该文件的提交历史。',
    '统计：--stat 显示每个文件改了多少、--shortstat 汇总。',
    '组合别名：git config --global alias.lg "log --graph --oneline --all" 值得拥有。',
  ],
  notes: [
    'git log --oneline 的输出最左边是提交哈希，后面撤销/重置命令会用到。',
    '想看某次提交改了什么：git show 哈希。',
  ],
  example: `# 最常用
git log --oneline
git log --oneline --graph --all

# 过滤
git log -5                      # 最近 5 条
git log --author="Zhang"
git log --grep="登录"
git log --since="2 weeks ago"
git log --after="2024-01-01"

# 按文件
git log --oneline -- src/App.js

# 详情
git log --stat
git show HEAD                   # 最近一次提交的完整差异`,
  example2: `# 更多过滤维度
# 组合多个条件
git log --author="Zhang" --since="2024-01-01" --oneline

# 按提交内容搜索（-S 找新增/删除某字符串的提交）
git log -S "function login" --oneline

# 只显示某个范围内的提交
git log main..feature/x         # 在 feature 但不在 main
git log feature/x..main         # 反之

# 看两个分支的分叉点
git merge-base main feature/x`,
  example3: `# 图形化与统计视图
# 漂亮的图形+单行+全部分支
git log --graph --oneline --decorate --all

# 别名固化后更省事
git config --global alias.tree "log --graph --oneline --decorate --all"

# 统计每个作者提交次数
git shortlog -sn
# 每个作者提交次数 + 主题
git shortlog -sne

# 查看某次提交改了什么
git show <commit-hash>
git show --stat <commit-hash>
git diff <hash1> <hash2>        # 两次提交之间的差异`,
};

if (typeof module !== 'undefined') module.exports = { git1, git2, git3, git4, git5 };