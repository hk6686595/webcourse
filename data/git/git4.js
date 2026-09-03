// Git 教程 16–20：进阶技巧与实战
const git16 = {
  id: 'git-rebase-interactive',
  title: '16. 交互式变基：整理提交历史',
  category: '高级',
  version: '2.x',
  level: '高级',
  summary: 'rebase -i 合并、重排、改名、拆分提交，把临时的提交史整理得干净有序。',
  detail: [
    'git rebase -i HEAD~n 对最近 n 个提交进行交互式整理。',
    '常用操作：pick 保留、reword 改消息、squash 合入上一个、fixup 合并且丢弃消息、drop 删除。',
    'squash 会把多个提交压成一个：适合把 feature 分支的 wip 提交整理成清晰的一两个。',
    '做法：先交互式选好操作，编辑器保存后逐个处理（squash 时决定合并后的消息）。',
    '只适合尚未推送的历史；已推送后 rebase 会改写公开历史。',
    'rephrase：reword 只改消息不动内容，最安全。',
  ],
  notes: [
    'squash 与 fixup 区别：squash 保留被合并提交的消息让你编辑，fixup 直接使用下面的消息。',
    '整理历史是给未来审阅者看的，别把“真实工作过程”的道理变成随便合并的借口。',
  ],
  example: `# 交互式整理最近 3 个提交
git rebase -i HEAD~3
# 编辑器里会出现：
# pick a1b2c3 feat: 登录页初版
# pick 4d5e6f wip: 临时代码
# pick 7f8a9b fix: 修正样式

# 把 4d5e6f、7f8a9b 并入 a1b2c3 的操作：
# pick a1b2c3 feat: 登录页初版
# squash 4d5e6f 临时提交（将被合并）
# fixup  7f8a9b 修正（合并且丢弃消息）

# 保存退出后，编辑最终的提交消息即可
git rebase --continue
git rebase --abort`,
};

const git17 = {
  id: 'git-github-pr',
  title: '17. GitHub 协作：Fork 与 Pull Request',
  category: '协作',
  version: '2.x',
  level: '进阶',
  summary: '参与开源的标准姿势：Fork → clone → 分支 → PR，以及同步上游更新。',
  detail: [
    'Fork：把别人的仓库复制到自己账号下，获得写权限，用于提 PR。',
    '工作流：Fork 上游 → clone 自己的 fork → 建分支改代码 → push 到 fork → 向原仓库提 PR。',
    'PR 前后：保持分支与上游同步（git fetch upstream + rebase/merge），减少冲突。',
    'Review 反馈后：继续在 feature 分支提交并 push，PR 会自动更新。',
    '合并方式由维护者决定：merge commit、squash、rebase；参与者无需操作。',
    '给 PR 添加关联 issue：提交信息写 Closes #12 会自动关闭对应 issue。',
  ],
  notes: [
    '给上游加远程：git remote add upstream 原仓库地址，本地可同时跟踪 origin 与 upstream。',
    '提 PR 前先看 CONTRIBUTING、跑测试、补文档，通过率更高。',
  ],
  example: `# 完整流程
git clone https://github.com/you/project.git
git remote add upstream https://github.com/original/project.git
git remote -v                  # origin=fork, upstream=原仓库

# 同步上游
git fetch upstream
git switch main
git merge upstream/main
git push origin main

# 开发
git switch -c fix/typo
git add . && git commit -m "fix: 修正 README 拼写
Closes #12"
git push -u origin fix/typo

# 到 GitHub 上发起 Pull Request`,
};

const git18 = {
  id: 'git-commit-message',
  title: '18. 提交信息规范：Conventional Commits',
  category: '高级',
  version: '2.x',
  level: '进阶',
  summary: '用 Conventional Commits 写提交信息，让历史可读且能自动生成 changelog 与版本号。',
  detail: [
    '格式：<type>(<scope>): <summary>，如 feat(login): 支持手机号登录。',
    '常用 type：feat 新功能、fix 修复、docs 文档、style 格式、refactor 重构、test 测试、chore 杂项。',
    '破坏性变更：类型后加 !，如 feat!: 修改 API，正文写 BREAKING CHANGE 说明。',
    '正文：空一行后写为什么、怎么解决，可提到关联 issue。',
    '收益：semantic-release 可据此自动发版；拉记录时一目了然。',
    '情绪型词（wip、fix、update）信息量低，团队应约定禁止。',
  ],
  notes: [
    '大写/小写一致性：全项目统一即可，工具常要求小写。',
    '约定式提交说明见官网 conventionalcommits.org。',
  ],
  example: `# 好的提交信息示例
feat(login): 支持邮箱验证码登录

<p>新增邮箱验证码登录方式，未注册邮箱会自动创建账号。</p>
Closes #45

fix(api): 修复分页参数丢失问题

<p>列表接口在翻页时 offset 未正确传递，导致第二页返回重复数据。</p>

docs(readme): 补充开发环境配置说明

# 破坏性变更
feat!(auth): JWT 改为无状态令牌

BREAKING CHANGE: 客户端令牌格式不兼容，需重新登录。`,
};

const git19 = {
  id: 'git-hooks-ci',
  title: '19. 钩子与 CI/CD 集成',
  category: '高级',
  version: '2.x',
  level: '高级',
  summary: '提交前自动检查的 Git Hooks，与 GitHub Actions 等 CI 流水线配合。',
  detail: [
    'Git Hooks：.git/hooks 下的脚本，在特定事件触发，如 pre-commit、commit-msg、pre-push。',
    'pre-commit：提交前执行（如跑 lint/格式化）；commit-msg：校验提交信息格式。',
    'hooks 默认不随仓库分发，用 husky（前端）等工具把脚本纳入仓库管理。',
    'CI（持续集成）：push/PR 触发流水线，跑测试、构建、lint，通过才允许合并。',
    'GitHub Actions：.github/workflows/main.yml 声明式定义 job；GitLab CI 用 .gitlab-ci.yml。',
    'CI 与 Git 配合点：Actions 基于 push/tags 触发、可按路径过滤，天然绑定 Git 事件。',
  ],
  notes: [
    '本地 hooks 只能约束本地，CI 才是团队的强制关卡。',
    '组合拳：husky + lint-staged 只检查改动的文件，速度快很多。',
  ],
  example: `# 手动启用 commit-msg 校验（bash）
cat > .git/hooks/commit-msg <<'EOF'
#!/bin/sh
if ! head -1 "$1" | grep -qE '^(feat|fix|docs|style|refactor|test|chore)(\\(.*\\))?!?: '; then
  echo "提交信息不符合 Conventional Commits 规范" >&2
  exit 1
fi
EOF
chmod +x .git/hooks/commit-msg`,
  example2: `# GitHub Actions：push 时跑测试
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test`,
};

const git20 = {
  id: 'git-cheatsheet',
  title: '20. 命令速查与学习路线',
  category: '实战',
  version: '2.x',
  level: '高级',
  summary: '把前面内容浓缩为高频命令速查表，并给出继续深入的方向。',
  detail: [
    '高频三连：status → add → commit；git log --oneline --graph --all 了解全局。',
    '分支操作：switch -c 建切、merge/rebase 整合、branch -d 清理。',
    '撤销：restore 文件级、reset 本地回退、revert 安全回滚。',
    '远程：clone、push -u、pull --rebase、fetch、remote -v。',
    '深入方向：rerere 复用冲突解法、bisect 二分定位 bug、submodule/subtree 子仓库。',
    'GraphQL 般的交互工具：lazygit（终端 TUI）、IDE 集成、Sourcetree/Fork（GUI）。',
  ],
  notes: [
    '记住“改了→暂存→提交→推送”的循环，配合 status 随时自检，大多数问题能自解。',
    '官方文档 git-scm.com 有非常详尽的中/英文参考与图解。',
  ],
  example: `# ===== 速查表 =====
# 初始化/配置
git init -b main
git config --global user.name "Name"
git config --global alias.lg "log --oneline --graph --all"

# 日常循环
git status
git add -A
git commit -m "feat: xxx"
git pull --rebase
git push

# 分支
git switch -c feat/a
git merge feat/a
git branch -d feat/a

# 回滚
git restore file
git restore --staged file
git reset --soft HEAD~1
git revert HEAD

# 查看
git log --oneline --graph --all
git diff --staged
git show HEAD`,
};

if (typeof module !== 'undefined') module.exports = { git16, git17, git18, git19, git20 };