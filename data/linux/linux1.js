// Linux 教程 1–5：文件系统与基础操作
const linux1 = {
  id: 'linux-ls-cd',
  title: '1. 文件浏览：ls / cd / pwd / tree',
  category: '文件系统',
  version: '通用',
  level: '入门',
  summary: '最常用的文件浏览命令：列目录、切换路径、查看当前路径。',
  detail: [
    'ls 列出目录内容：-l 详细信息、-a 显示隐藏文件、-h 人类可读大小、-t 按时间排序、-S 按大小排序。',
    'ls -la /tmp 查看 /tmp 目录的所有文件（含 . 和 ..）。',
    'cd <path> 切换目录；cd .. 上级目录；cd ~ 回家目录；cd - 回到上一个目录。',
    'pwd 显示当前工作目录的绝对路径。',
    'tree <path> 以树状结构显示目录（需安装 tree 包）。',
    '通配符：* 任意字符、? 单个字符、[abc] 集合。',
  ],
  notes: [
    '路径分绝对路径（以 / 开头）和相对路径（不以 / 开头）。',
    'Tab 键自动补全路径——这是效率最高的操作习惯。',
  ],
  example: `# 基本用法
ls -la /home
ls -lSh /var/log   # 按大小排序
ls -lt /etc        # 按时间排序

# 隐藏文件
ls -d .*

# tree（需安装）
tree -L 2 /etc/nginx

# 通配符
ls *.txt
ls file[0-9].log
ls ???.png`,
};

const linux2 = {
  id: 'linux-cp-mv-rm',
  title: '2. 文件操作：cp / mv / rm / mkdir / touch',
  category: '文件系统',
  version: '通用',
  level: '入门',
  summary: '文件的复制、移动、删除、创建目录与空文件。',
  detail: [
    'cp <source> <dest>：复制文件；-r 递归复制目录；-p 保留权限和时间戳。',
    'mv <source> <dest>：移动或重命名文件（同一文件系统内瞬间完成）。',
    'rm <file>：删除文件；-r 递归删除目录；-f 强制删除（不询问）。',
    'mkdir -p a/b/c：递归创建多级目录。',
    'touch <file>：创建空文件，或更新已有文件的时间戳。',
    "rm -rf / 是危险命令——建议先设置 alias rm='rm -i'。",
  ],
  notes: [
    'mv 跨文件系统时实际上是 cp + rm。',
    'rm 删除的文件默认不进入"回收站"——使用 trash-cli 提供回收站功能。',
  ],
  example: `# 复制
cp file.txt /backup/
cp -r /project /backup/   # 递归复制目录
cp -rp /src /dest         # 保留权限

# 移动/重命名
mv old.txt new.txt
mv /tmp/file.txt ./       # 移到当前目录

# 删除
rm -rf /tmp/cache         # 递归强制删除
rm -i important.txt       # 确认删除

# 创建
mkdir -p /app/logs/2025
touch README.md`,
};

const linux3 = {
  id: 'linux-cat-less-head',
  title: '3. 文件查看：cat / less / head / tail / grep',
  category: '文件系统',
  version: '通用',
  level: '入门',
  summary: '浏览文件内容的多种方式：全文、分页、头尾、搜索。',
  detail: [
    'cat <file>：输出文件全部内容——适合小文件；合并文件：cat a.txt b.txt > c.txt。',
    'less <file>：分页浏览（空格翻页、/搜索、q 退出）。',
    'head -n 20 <file>：查看前 20 行；tail -n 20 <file>：查看后 20 行。',
    'tail -f <file>：实时跟踪文件追加内容（常用查看日志）。',
    'grep <pattern> <file>：查找匹配行；-i 忽略大小写；-r 递归搜索目录；-n 显示行号。',
    '组合使用：grep ERROR app.log | head -10。',
  ],
  notes: [
    '大文件禁止用 cat——会刷爆终端；用 less 或 head/tail 替代。',
    'grep -v 反向匹配（排除）；grep -c 计数（不输出行）。',
  ],
  example: `# 查看文件
less /var/log/syslog
head -20 /etc/passwd
tail -f /var/log/nginx/access.log

# 搜索
grep '192.168.1.' /var/log/auth.log
grep -r 'TODO' /project/src/
grep -n 'function' app.py

# 统计行数
wc -l /etc/passwd
grep -c 'bash' /etc/passwd`,
};

const linux4 = {
  id: 'linux-permission',
  title: '4. 用户与权限：chmod / chown / 文件权限详解',
  category: '文件系统',
  version: '通用',
  level: '入门',
  summary: '理解 Linux 文件权限模型：rwx 与 chmod/chown 修改权限和属主。',
  detail: [
    '权限三组：u（属主）、g（属组）、o（其他人）；每位 r（读=4）w（写=2）x（执行=1）。',
    'chmod 755 file：属主 7(rwx) 组 5(r-x) 其他人 5(r-x)。常用：644（文件）、755（目录/脚本）。',
    'chmod u+x script.sh：添加属主执行权限；chmod -R 755 /dir：递归修改。',
    'chown user:group file：修改属主和属组；chown -R user:group /dir 递归。',
    'umask 控制新建文件的默认权限（如 umask 022 → 新文件 644，新目录 755）。',
    'SUID/GUID/Sticky Bit：chmod u+s（设置用户ID）、chmod +t（粘滞位，如 /tmp）。',
  ],
  notes: [
    '目录需要有 x 权限才能 cd 进入；目录的 x 与文件的 x 含义不同。',
    'chmod -R 慎用——可执行权限可能影响安全。',
  ],
  example: `# 修改权限
chmod 644 README.md
chmod +x deploy.sh
chmod -R 755 /app

# 字母模式
chmod u=rw,go=r file.txt
chmod g+w file.txt

# 修改属主
chown alice:developers /app/data
chown -R alice /home/alice

# 特殊权限
chmod u+s /usr/bin/passwd   # SUID
chmod +t /tmp               # Sticky Bit`,
};

const linux5 = {
  id: 'linux-find-locate',
  title: '5. 查找文件：find / locate / which / whereis',
  category: '文件系统',
  version: '通用',
  level: '入门',
  summary: '四种文件查找方式：find 实时搜索、locate 索引搜索、which 找可执行程序。',
  detail: [
    "find <path> -name '*.txt'：按文件名搜索；-iname 忽略大小写。",
    'find -type f/d：按类型（文件/目录）；-size +10M：大小超过 10MB；-mtime -7：7 天内修改过。',
    'find -exec rm {} +；对找到的文件执行命令。',
    'locate <name>：基于 mlocate 数据库的快速搜索（需 daily 更新数据库）。',
    'which python3：查找命令的绝对路径（从 PATH 中搜索）。',
    'whereis python：同时找二进制、源码和 man 手册。',
  ],
  notes: [
    'find 比 locate 慢但更准确——locate 依赖定期更新的数据库。',
    'which 只搜索 PATH 环境变量中的目录，不搜索当前目录的 ./ 程序。',
  ],
  example: `# find 基本
find /var/log -name '*.log' -mtime -1  # 最近一天修改的日志
find /home -type d -name 'node_modules'
find / -size +100M -exec ls -lh {} +   # 大于 100MB 的文件

# 查找并删除
find /tmp -name '*.tmp' -atime +7 -delete

# locate（需先 updatedb）
locate .bashrc

# which / whereis
which docker
whereis python3`,
};

if (typeof module !== 'undefined') module.exports = { linux1, linux2, linux3, linux4, linux5 };