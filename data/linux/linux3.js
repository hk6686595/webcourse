// Linux 教程 11–14：网络 / SSH / 压缩 / Cron
const linux11 = {
  id: 'linux-network',
  title: '11. 网络工具：curl / wget / ping / netstat / ss / ip',
  category: '网络',
  version: '通用',
  level: '进阶',
  summary: '常用的网络调试和下载工具：HTTP 请求、连通性检查、端口和连接查看。',
  detail: [
    'curl 强大 HTTP 客户端：curl -v 详细、-o file 下载、-H 自定义头、-d data POST。',
    'wget 简单下载器：wget -c 断点续传、-r 递归、-P dir 指定目录。',
    'ping <host>：ICMP 连通性测试（需网络允许 ICMP）。',
    'netstat -tlnp：列出所有监听 TCP 端口（-u UDP、-a 全部连接）。',
    "ss（替代 netstat）：ss -tln 'sport = :80' 更快速。",
    'ip addr / ip route / ip link：现代版 ifconfig/route（iproute2 包）。',
  ],
  notes: [
    'netstat 在大多数发行版已不预装——改用 ss。',
    'curl 默认输出到 stdout；如果不加 -o / -O，内容会打印到终端。',
  ],
  example: `# curl
curl -v http://localhost:3000/api/meta
curl -o meta.json http://localhost:3000/api/meta
curl -X POST -H 'Content-Type: application/json' -d '{"key":"val"}' http://api.example.com/

# wget
wget https://example.com/file.zip
wget -c -r -np http://docs.example.com/   # 递归镜像

# 端口与连接
ss -tlnp | grep ':80'
ss -tln 'sport = :3000'
ss -tuna   # 所有 TCP/UDP 连接`,
};

const linux12 = {
  id: 'linux-ssh-scp',
  title: '12. SSH 安全外壳与远程文件传输',
  category: '网络',
  version: '通用',
  level: '进阶',
  summary: 'SSH 远程登录、密钥认证、scp/sftp 传输文件、SSH 隧道。',
  detail: [
    'ssh user@host：远程登录；-p 2222 指定端口；-i key.pem 指定密钥。',
    '密钥对：ssh-keygen -t ed25519 生成（推荐 ed25519 优于 RSA）。',
    '公钥部署：ssh-copy-id user@host 自动将公钥追加到远程 ~/.ssh/authorized_keys。',
    'scp local.txt user@host:/remote/path/：复制文件到远程。',
    'ssh -L 8080:localhost:80 user@host：本地端口转发（访问本地 8080=远程 80）。',
    '~/.ssh/config 配置别名：Host myserver HostName 192.168.1.100 User alice Port 2222。',
  ],
  notes: [
    '密码认证容易被暴力破解——禁用 PasswordAuthentication yes → no（在 /etc/ssh/sshd_config）。',
    'ssh -N -L 只建立转发不执行命令。',
  ],
  example: `# 密钥对
ssh-keygen -t ed25519 -C "alice@work"
ssh-copy-id user@example.com

# SSH config（~/.ssh/config）
Host prod
  HostName prod.example.com
  User deploy
  Port 2222
  IdentityFile ~/.ssh/prod-key
  # 然后 ssh prod 即可

# 端口转发
ssh -L 3000:localhost:3000 user@server -N
# 浏览器访问 http://localhost:3000 即可

# scp
scp -P 2222 deploy.tar.gz user@host:/opt/
scp -r ./configs/ user@host:/etc/myapp/`,
};

const linux13 = {
  id: 'linux-tar-gzip',
  title: '13. 压缩与归档：tar / gzip / zip / 7z',
  category: '系统管理',
  version: '通用',
  level: '入门',
  summary: '打包、压缩和解压不同格式的归档文件。',
  detail: [
    'tar czf archive.tar.gz /path：创建 tar.gz（c=create、z=gzip、f=filename）。',
    'tar xzf archive.tar.gz：解压（x=extract）。',
    'tar cjf archive.tar.bz2 /path：bzip2 压缩（压缩率更高，速度慢）；.xz 同理。',
    'tar tf archive.tar.gz：查看归档内容而不解压。',
    'zip -r archive.zip /path（需要安装 zip 包）；unzip archive.zip。',
    'gzip file：压缩文件（替换原文件为 file.gz）；gunzip file.gz 解压。',
  ],
  notes: [
    'tar 本身不压缩，只是打包——常用选项加 z/j/J 自动调用 gzip/bzip2/xz。',
    '解压前先用 tar tf 确认内容，避免直接解压到当前目录造成混乱。',
  ],
  example: `# tar.gz
tar czf backup-$(date +%F).tar.gz /home/user/data/
tar xzf backup-2025-01-01.tar.gz -C /tmp/restore/
tar tf backup-2025-01-01.tar.gz | head -10

# tar.bz2（更高压缩比）
tar cjf logs.tar.bz2 /var/log/

# zip
zip -r project.zip /home/user/project/ -x '*/node_modules/*'
unzip project.zip -d /tmp/output/

# gzip 独立使用
gzip large.log
gunzip large.log.gz`,
};

const linux14 = {
  id: 'linux-cron-systemd',
  title: '14. 任务调度：cron / systemd timer / at',
  category: '系统管理',
  version: '通用',
  level: '进阶',
  summary: '定期执行任务的三种方式：传统 cron、现代 systemd timer、一次性 at。',
  detail: [
    'crontab -e 编辑用户定时任务；crontab -l 查看。',
    'cron 时间格式：分 时 日 月 周（如 0 3 * * * = 每天 3:00）。',
    '系统 crontab 在 /etc/crontab（可指定用户）。',
    'cron 脚本应使用绝对路径，并重定向输出到日志（>/dev/null 2>&1 或 >> log）。',
    'systemd timer 更强大：支持依赖、随机延迟、日历时间表达式、持久化。',
    'at 15:00：指定时间执行一次性任务（需 at 包）。',
  ],
  notes: [
    'cron 的环境变量与登录 shell 不同——脚本中尽量使用绝对路径。',
    'cron 时间格式的第 5 字段（周）0/7 都是周日。',
  ],
  example: `# crontab -e 示例
# 每天凌晨 3:30 备份数据库
30 3 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1

# 每 5 分钟检查服务
*/5 * * * * /opt/healthcheck.sh

# 每月 1 号清理日志
0 0 1 * * find /var/log -name '*.old' -delete

# systemd timer（更加可靠）
# /etc/systemd/system/backup.timer
[Unit]
Description=Daily backup
[Timer]
OnCalendar=daily
Persistent=true
[Install]
WantedBy=timers.target`,
};

if (typeof module !== 'undefined') module.exports = { linux11, linux12, linux13, linux14 };