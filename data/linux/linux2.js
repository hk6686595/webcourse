// Linux 教程 6–10：文本处理与管道
const linux6 = {
  id: 'linux-pipe-redirect',
  title: '6. 管道与重定向：| / > / >> / 2>&1',
  category: '文本处理',
  version: '通用',
  level: '入门',
  summary: '使用管道将一个命令的输出传给另一个命令，重定向标准 I/O 到文件。',
  detail: [
    '|（管道）：command1 | command2 将 command1 的 stdout 作为 command2 的 stdin。',
    '> 覆盖重定向：echo hello > file.txt（写入文件，覆盖已有内容）。',
    '>> 追加重定向：echo world >> file.txt（追加到文件末尾）。',
    '2> 错误重定向：command 2> error.log；2>&1 将 stderr 合并到 stdout。',
    '&> 或 >&：同时重定向 stdout 和 stderr（Bash 4+ 支持）。',
    'tee 同时输出到屏幕和文件：command | tee file.txt。',
  ],
  notes: [
    '管道中的每个命令在子 shell 中执行——cd 等影响当前 shell 的命令无效。', 
    'set -o pipefail 让管道在所有命令成功时才返回 0。',
  ],
  example: `# 管道链
ps aux | grep nginx | grep -v grep | awk '{print $2}'
cat access.log | cut -d' ' -f1 | sort | uniq -c | sort -rn | head -5

# 重定向
ls /nonexistent 2> error.log
command > output.log 2>&1
echo "done" >> /var/log/deploy.log

# tee
echo "start" | tee -a /var/log/deploy.log`,
};

const linux7 = {
  id: 'linux-grep-awk-sed',
  title: '7. 文本处理三件套：grep / awk / sed',
  category: '文本处理',
  version: '通用',
  level: '进阶',
  summary: 'grep 模式搜索、awk 列处理、sed 流编辑器——日志分析和文本处理的瑞士军刀。',
  detail: [
    "grep -E 'pattern'（扩展正则）；-o 只输出匹配部分；-A 3 -B 3 上下各 3 行上下文。",
    "awk '{print $1, $NF}'：按空格/制表符分割列，$1 第一列、$NF 最后一列。",
    "awk -F',' '{print $2}'：以逗号分割；awk 'NR>1'：跳过第一行。",
    "sed 's/old/new/g' file：全局替换；-i 直接修改文件。",
    "sed -n '10,20p' file：打印 10–20 行；sed '5d' file：删除第 5 行。",
    "三者通常配合管道：cat log | grep ERROR | awk '{print $3}' | sed 's/[][]//g'。",
  ],
  notes: [
    'grep 基本正则（BRE）和扩展正则（ERE）的转义规则不同——建议用 grep -E。',
    'sed -i 直接在文件上修改——建议先不加 -i 预览结果。',
  ],
  example: `# grep 上下文
grep -A 5 'Stack trace:' app.log
grep -c 'ERROR' app.log           # 计数
grep -r --include='*.py' 'def ' src/

# awk
awk '{print $1}' /var/log/nginx/access.log  # IP 地址
ps aux | awk '$3 > 10 {print $2, $11}'      # CPU > 10%
awk -F: '{print $1}' /etc/passwd            # 用户名列表

# sed
sed -i 's/old_version/1.2.3/g' config.txt
sed -n '/^ENV/,/^$/p' docker-compose.yml    # 打印 ENV 到空行`,
};

const linux8 = {
  id: 'linux-sort-uniq-cut',
  title: '8. 文本整理：sort / uniq / cut / tr / wc',
  category: '文本处理',
  version: '通用',
  level: '入门',
  summary: '排序、去重、截取列、字符转换与统计——日志分析基础。',
  detail: [
    'sort：排序；-n 数字排序、-r 降序、-t: -k3 指定分隔符和列。',
    'uniq：去除相邻重复行（必须先 sort）；-c 统计次数；-d 只显示重复行。',
    "cut -d',' -f1,3：以逗号分隔取第 1 和 3 列；-c1-10 取前 10 字符。",
    "tr 'a-z' 'A-Z'：字符转换（小写→大写）；-d 删除指定字符。",
    'wc -l：统计行数；-w 单词数；-c 字符数。',
    "组合是常规操作：cat log | grep ERROR | awk '{print $2}' | sort | uniq -c | sort -rn。",
  ],
  notes: [
    'uniq 只处理相邻重复行——一定要先 sort。',
    'cut 分隔符必须是单个字符，不能用多字符表示空白。',
  ],
  example: `# 最流行的 IP 排序
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -10

# 数字排序
du -sh /var/* | sort -rh                 # 人类可读逆序
ps aux | sort -k3 -rn | head -5          # CPU 占用前 5

# cut 和 tr
cat data.csv | cut -d, -f2,4 | tr ',' '|'
echo 'hello world' | tr -d ' '           # 删除空格

# 统计
wc -l $(find src -name '*.py')           # Python 文件总行数
cat access.log | wc -l                   # 总请求数`,
};

const linux9 = {
  id: 'linux-process',
  title: '9. 进程管理：ps / top / kill / nohup / jobs',
  category: '系统管理',
  version: '通用',
  level: '进阶',
  summary: '查看、监控和终止进程，后台运行与作业控制。',
  detail: [
    'ps aux：查看所有进程（a=所有、u=用户格式、x=无终端）；ps -ef：标准格式。',
    'ps aux --sort=-%mem | head：按内存占用排序。',
    'top（或 htop）：实时监控进程资源；htop 体验更好，支持鼠标点击。',
    'kill -15 PID：优雅终止；kill -9 PID：强制杀死。',
    'nohup command &：终端关闭后继续运行；bg/fg 在前后台间移动。',
    'jobs 查看当前终端的后台任务；disown 移除作业的终端关联。',
  ],
  notes: [
    'kill -9 不给进程任何清理机会——可能导致数据损坏或资源泄漏。',
    'nohup 的输出默认写入 nohup.out；可重定向：nohup command > out.log 2>&1 &',
  ],
  example: `# 查找和杀进程
ps aux | grep 'node'
kill -15 12345
kill -9 12345    # 最后手段

# nohup
nohup python3 train.py > training.log 2>&1 &
echo $!           # 记录 PID 以便日后管理

# 作业控制
sleep 100 &
jobs
fg %1            # 前台恢复
Ctrl+Z            # 暂停前台进程
bg %1             # 后台继续

# top 交互命令
# M: 按内存排序, P: 按 CPU 排序, k: 杀进程, q: 退出`,
};

const linux10 = {
  id: 'linux-disk',
  title: '10. 磁盘与存储：df / du / mount / fdisk / lsblk',
  category: '系统管理',
  version: '通用',
  level: '进阶',
  summary: '查看磁盘空间、统计目录大小、挂载设备、分区管理。',
  detail: [
    'df -h：查看各分区总容量、已用、可用、挂载点。',
    'du -sh /dir：统计目录总大小；du -h --max-depth=1：逐级目录大小。',
    'lsblk：列出所有块设备（磁盘和分区）的拓扑关系。',
    'fdisk -l /dev/sda：查看磁盘分区表（需 root）。',
    'mount /dev/sdb1 /mnt/data：挂载分区；umount /mnt/data：卸载。',
    'dd if=/dev/sda of=disk.img bs=1M：磁盘备份/克隆。',
  ],
  notes: [
    'df 显示的 Used + Available ≠ Size——因为文件系统预留了部分空间给 root。',
    'du 需要扫描目录树，大目录费时——可用 ncdu 交互式分析。',
  ],
  example: `# 磁盘空间
df -h
du -sh /var/log
du -h --max-depth=1 /home | sort -rh

# 找出占用大量 inode 的目录
find /var -type f | cut -d/ -f1-3 | uniq -c | sort -rn | head

# 挂载
sudo mount -t ext4 /dev/sdb1 /mnt/data
sudo umount /mnt/data

# 查看挂载
mount | grep sdb
cat /etc/fstab   # 开机自动挂载配置`,
};

if (typeof module !== 'undefined') module.exports = { linux6, linux7, linux8, linux9, linux10 };