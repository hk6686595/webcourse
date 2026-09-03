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
};

if (typeof module !== 'undefined') module.exports = { git1, git2, git3, git4, git5 };