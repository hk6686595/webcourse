// Git 教程 11–15：远程协作
const git11 = {
  id: 'git-remote',
  title: '11. 远程仓库：clone / push / pull / fetch',
  category: '协作',
  version: '2.x',
  level: '入门',
  summary: '与远程仓库打交道的全套命令：克隆、推送、拉取、抓取与起别名。',
  detail: [
    'git remote add origin URL 关联远程；origin 只是惯例别名，可随意命名。',
    'git clone URL 复制整个远程仓库（含历史）到本地，自动设置 origin 与默认跟踪。',
    'git push origin main 推送本地 main 到远程；首次加 -u 建立跟踪以便后续裸 push/pull。',
    'git pull = git fetch + git merge；git pull --rebase 则 fetch + rebase。',
    'git fetch 只更新远程跟踪分支，不动工作区，是“先看后合”的安全动作。',
    'git remote -v 查看地址；git fetch origin 后可用 git log origin/main 查看远程最新。',
  ],
  notes: [
    '推送被拒绝（远程有新提交）时，先 git pull --rebase 再 push，历史更干净。',
    '用 SSH（git@github.com:user/repo.git）比 HTTPS 更省心，免输密码。',
  ],
  example: `# 关联与查看
git remote add origin https://github.com/user/repo.git
git remote -v

# 克隆
git clone https://github.com/user/repo.git
git clone --depth 1 repo.git    # 浅克隆，只取最新，省流量

# 首次推送
git push -u origin main
# 之后直接
git push

# 拉取
git pull
git pull --rebase
# 只抓不合并
git fetch origin
git log origin/main --oneline`,
};

const git12 = {
  id: 'git-tag',
  title: '12. 标签：git tag',
  category: '协作',
  version: '2.x',
  level: '入门',
  summary: '给重要提交打标（版本号 v1.0.0），轻量标签与附注标签的区别。',
  detail: [
    '标签是指向特定提交的固定引用，常用于版本发布（v1.0.0）或里程碑。',
    '轻量标签：git tag name，只是名字，无附加信息。',
    '附注标签：git tag -a v1.0.0 -m "发布说明"，含打标人/时间/消息，建议用于发布。',
    '查看：git tag 列出所有；git show v1.0.0 查看标签详情（附注）。',
    '推送到远程：git push origin v1.0.0；全部：git push --tags。',
    '删除标签：git tag -d name 本地；git push origin --delete name 远程。',
  ],
  notes: [
    '在 CI 中常借助标签触发发版流程（如 GitHub Actions on: push: tags）。',
    '标签与分支不同：标签不随新提交移动，适合固守某个版本点。',
  ],
  example: `# 打标签
git tag v1.0.0                     # 轻量标签（打在 HEAD）
git tag v0.9.0 abc1234             # 打在指定提交
git tag -a v1.0.0 -m "首个正式版"   # 附注标签

# 查看
git tag
git show v1.0.0

# 推送
git push origin v1.0.0
git push --tags

# 删除
git tag -d v1.0.0
git push origin --delete v1.0.0`,
};

const git13 = {
  id: 'git-ignore',
  title: '13. 忽略文件：.gitignore',
  category: '协作',
  version: '2.x',
  level: '入门',
  summary: '用 .gitignore 忽略依赖、构建产物、密钥、本地配置等不该入库的文件。',
  detail: [
    '.gitignore 基于 glob 模式，每行一条规则，可在任意层级生效。',
    '必须忽略的：node_modules/、dist/、build/、.env、*.log、IDE 目录（.idea/、.vscode/）。',
    '取反：!important.log 在忽略后单独放行某个文件。',
    '目录忽略：node_modules/ 忽略整个目录；只忽略某个文件用 /secret.key（相对根）。',
    '已被跟踪的文件不受 .gitignore 影响，需先 git rm --cached file 取消跟踪。',
    'git check-ignore -v file 可调试某文件为什么被忽略。',
  ],
  notes: [
    '.env 里常有密钥，被提交后即使删除，也仍存在于历史中——密钥要立刻轮换。',
    'github.com/github/gitignore 有各语言现成模板可直接用。',
  ],
  example: `# 一个常见 Node 项目的 .gitignore
node_modules/
dist/
build/

.env
.env.local
*.log
.DS_Store

.idea/
.vscode/
*.swp

# 取反示例
public/vendor/jquery.js

# 取消已跟踪文件
git rm --cached .env
git commit -m "chore: 移除误提交的 .env"

# 调试
git check-ignore -v .env`,
};

const git14 = {
  id: 'git-conflict',
  title: '14. 解决合并冲突',
  category: '协作',
  version: '2.x',
  level: '进阶',
  summary: '冲突是什么、怎么出现、用什么形态标注，以及一步步解决并完成合并。',
  detail: [
    '冲突发生在两个分支改动了同一文件的同一位置，Git 无法自动合并时。',
    '冲突文件会插入标记：<<<<<<< HEAD 与 ======= 之间是当前分支内容，之后到 >>>>>>> branch 是对方分支。',
    '解决流程：手工编辑文件成想要的结果 → 删除冲突标记 → git add 该文件。',
    '合并冲突：解决后 git commit（生成合并提交）；rebase 冲突：解决后 git rebase --continue。',
    '中止：git merge --abort 或 git rebase --abort 可整体放弃。',
    '可视化工具：git config --global merge.tool vimdiff 或 IDE 自带的合并 UI 更直观。',
  ],
  notes: [
    '冲突标记本身不是 Git 语法，是纯文本，别原样提交进代码。',
    '多人同文件高频冲突往往是职责划分问题，也可用 git pull --rebase 减少无谓冲突。',
  ],
  example: `# 冲突出现时的文件内容
<<<<<<< HEAD
console.log("hello from main");
=======
console.log("hello from feature");
>>>>>>> feature/login

# 解决办法：编辑成目标结果（去掉标记）
console.log("hello from both");

# 完成后
git add src/app.js
git commit -m "merge: 解决 app.js 冲突"

# rebase 时则
git add src/app.js
git rebase --continue

# 放弃一切
git merge --abort`,
};

const git15 = {
  id: 'git-workflow',
  title: '15. 协作流程：GitHub Flow 与分支策略',
  category: '协作',
  version: '2.x',
  level: '进阶',
  summary: '团队最常用的 GitHub Flow：main 始终可发布，功能分支 + PR 评审。',
  detail: [
    'GitHub Flow：main 分支始终可部署；每个改动开独立分支；合并前走 PR 评审。',
    '功能分支命名建议：feature/login、fix/typo、hotfix/crash 等，规范清晰。',
    'PR（Pull Request）：把分支合入 main 前先发起请求，他人 review + CI 通过后再合并。',
    '小型改动用 squash merge（压缩为一个提交）；大型功能用 merge commit 保留过程。',
    '大型团队常用 Git Flow：main + develop + release/hotfix 等更多长期分支。',
    '规范提交信息 + 及时删除已合并分支，保持历史清爽。',
  ],
  notes: [
    '技术评审后合并，比直接推 main 安全很多，也能互相学习。',
    '热门分支策略：GitHub Flow（小团队）、Git Flow（发版节奏强）、Trunk-Based(快速迭代)。',
  ],
  example: `# 典型 GitHub Flow 步骤
git switch -c feature/login
# …写代码、多次提交…
git push -u origin feature/login

# 在 GitHub 上发起 Pull Request -> 评审 -> 合并
git switch main
git pull
git fetch origin --prune          # 清理已删除的分支引用

# 或本地合并后推送
git merge feature/login
git push origin main
git branch -d feature/login`,
};

if (typeof module !== 'undefined') module.exports = { git11, git12, git13, git14, git15 };