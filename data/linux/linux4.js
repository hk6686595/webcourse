// Linux 教程 15–18：环境 / 包管理 / Shell / 链接
const linux15 = {
  id: 'linux-env-export',
  title: '15. 环境变量与 Shell 配置：export / PATH / .bashrc / .profile',
  category: 'Shell',
  version: '通用',
  level: '入门',
  summary: '设置和使用环境变量，配置 PATH，个性化 Shell 启动脚本。',
  detail: [
    'export VAR=value：设置环境变量（仅当前 Shell 和子进程可见）。',
    'echo $VAR 或 ${VAR}：引用变量；${VAR:-default}：默认值。',
    'PATH 是冒号分隔的目录列表，Shell 在其中找可执行文件。',
    '~/.bashrc：交互式非登录 Shell 的配置（alias / 函数 / PS1）。',
    '~/.profile（或 .bash_profile）：登录 Shell 的配置。',
    'source ~/.bashrc（或 . ~/.bashrc）立即生效不重启 Shell。',
  ],
  notes: [
    '在 /etc/profile 和 /etc/bash.bashrc 中设置系统级环境变量。',
    'export PATH=/new/dir:$PATH 将新目录添加到 PATH 开头（优先搜索）。',
  ],
  example: `# 设置变量
export APP_ENV=production
export PATH=/opt/node/bin:$PATH
export JAVA_HOME=/usr/lib/jvm/java-11

# .bashrc 常用 alias
alias ll='ls -la'
alias gs='git status'
alias dc='docker compose'

# PS1 自定义提示符
export PS1='[\\u@\\h \\W]\\$ '

# 查看环境变量
echo $HOME
printenv | grep PATH

# 变量默认值
echo \${PORT:-3000}
echo \${DATABASE_URL:-postgres://localhost:5432/app}`,
};

const linux16 = {
  id: 'linux-apt-yum',
  title: '16. 包管理：apt / yum / dnf / brew',
  category: '系统管理',
  version: '通用',
  level: '入门',
  summary: '不同发行版的软件包管理器：搜索、安装、更新、删除软件。',
  detail: [
    'apt（Debian/Ubuntu）：apt update、apt upgrade、apt install、apt remove。',
    'apt search <keyword> 搜索包；apt show <package> 查看详情。',
    'yum（CentOS 7/RHEL）：yum install、yum update、yum remove。',
    'dnf（Fedora/RHEL 8+）：dnf install、dnf groupinstall。',
    'brew（macOS/Linux）：brew install、brew update、brew upgrade。',
    'apt-get vs apt：apt 是更友好的前端；aptitude 是交互式。',
  ],
  notes: [
    '所有包管理命令大部分需要 sudo。',
    'apt install 的 --no-install-recommends 可跳过推荐包，最小化安装。',
  ],
  example: `# apt
sudo apt update
sudo apt upgrade -y
sudo apt install -y nginx docker.io
sudo apt remove apache2
sudo apt autoremove          # 清理无用依赖

# 搜索
apt search 'python3.*numpy'
apt show python3-opencv

# yum/dnf
sudo yum install nginx
sudo yum remove httpd

# brew
brew install wget tree
brew upgrade
brew list`,
};

const linux17 = {
  id: 'linux-symlink-hardlink',
  title: '17. 链接：软链接与硬链接（ln）',
  category: '文件系统',
  version: '通用',
  level: '入门',
  summary: 'LIn命令创建软链接（Symlink）和硬链接（Hardlink），适用场景与区别。',
  detail: [
    'ln -s <target> <linkname>：软链接（类似 Windows 快捷方式，可跨文件系统）。',
    'ln <target> <linkname>：硬链接（同一文件系统内的多个目录入口），共享 inode。',
    '软链接可以指向目录、不存在的文件（danger——断开引用）。',
    '硬链接删除原始文件后数据仍在（引用计数 -1），软链接则断开。',
    'ls -l 查看链接：箭头 → 指向目标；硬链接显示链接计数 > 1。',
    '硬链接不能跨分区，不能指向目录（安全限制）。',
  ],
  notes: [
    '修改软链接指向的文件，原始文件不受影响——修改的是链接的目标文件。',
    '大量使用软链接管理版本部署（如 current → release-v3）。',
  ],
  example: `# 软链接
ln -s /home/user/releases/v3 /home/user/current
ls -la /home/user/current   # -> releases/v3

# 指向不存在的文件（断链）
ln -s missing.txt link.txt  # 建立时不报错

# 硬链接
ln original.txt hardlink.txt
ls -li original.txt hardlink.txt  # 相同 inode 号

# 删除原文件后
rm original.txt
cat hardlink.txt  # 仍然可用

# 更新软链接（原子操作）
ln -sfn /home/user/releases/v4 /home/user/current`,
};

const linux18 = {
  id: 'linux-shell-script',
  title: '18. Shell 脚本基础：变量 / 条件 / 循环 / 函数',
  category: 'Shell',
  version: '通用',
  level: '进阶',
  summary: '编写 Bash 脚本：变量定义、if/for/while、函数、退出码。',
  detail: [
    '#!/bin/bash 或 #!/bin/sh：Shebang 指定解释器。',
    '变量 = 两边无空格：name="Alice"；引用：$name 或 $\u007bname}。',
    'if [[ condition ]]; then ... elif ...; else ...; fi：条件判断。',
    'for i in list; do ...; done：循环；while [[ condition ]]; do ...; done。',
    'function f { ... } 或 f() { ... }：定义函数；local var 定义局部变量。',
    'exit 0 成功退出，非 0 表示错误；$? 获取上条命令退出码。',
  ],
  notes: [
    '推荐使用 [[ ]] 而非 [ ] 做条件——前者支持 && / ||、模式匹配。',
    '脚本调试：bash -x script.sh 逐行执行跟踪。',
  ],
  example: `#!/bin/bash

# 变量和参数
NAME=$1
GREETING="Hello, $\u007bNAME:-World}!"
echo $GREETING

# 条件
if [[ -f "$1" ]]; then
  echo "$1 is a file"
elif [[ -d "$1" ]]; then
  echo "$1 is a directory"
else
  echo "$1 does not exist"
fi

# 循环
for f in *.log; do
  echo "Processing $f"
  gzip "$f"
done

# 函数
function usage() {
  echo "Usage: $0 <name>"
  exit 1
}

# 使用
if [[ $# -eq 0 ]]; then usage; fi`,
};

module.exports = { linux15, linux16, linux17, linux18 };