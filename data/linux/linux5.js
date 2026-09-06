// Linux 教程 19–22：实战场景
const linux19 = {
  id: 'linux-deploy-webapp',
  title: '19. 实战：部署 Web 应用——Nginx 反向代理 + SSL + 日志分析',
  category: '实战',
  version: '通用',
  level: '进阶',
  summary: '在 Linux 服务器上用 Nginx 部署前端/后端，配置 HTTPS/SSL 和日志切割。',
  detail: [
    'Nginx 配置文件在 /etc/nginx/sites-available/，软链接到 sites-enabled/ 启用。',
    'server_name 指定域名；proxy_pass 反向代理到后端。',
    "SSL 证书推荐 Let's Encrypt（certbot），自动续期。",
    'access.log 和 error.log 格式化可自定义（log_format）。',
    '日志切割：logrotate 定期压缩和归档日志。',
    'nginx -t 测试配置；nginx -s reload 平滑重载。',
  ],
  notes: [
    '使用 certbot --nginx 自动获取证书并配置 Nginx。',
    '大并发时调整 worker_processes（CPU 核数）和 worker_connections。',
  ],
  example: `# Nginx 站点配置
server {
    listen 443 ssl;
    server_name example.com;
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        root /var/www/app;
        index index.html;
    }
}

# 日志切割配置（/etc/logrotate.d/nginx）
/var/log/nginx/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
}`
};

const linux20 = {
  id: 'linux-troubleshoot',
  title: '20. 实战：系统故障排查清单',
  category: '实战',
  version: '通用',
  level: '进阶',
  summary: '服务器挂了的排查步骤：CPU 满载、内存不足、磁盘满、进程消失。',
  detail: [
    'CPU 过高：top（按 P 排序）→ 找到进程 → strace -p PID 或 perf top。',
    '内存不足：free -m（看 available）；vmstat 1（交换情况）；找出 OOM 日志（dmesg | grep -i oom）。',
    '磁盘满：df -h（哪个分区满）→ du -sh /dir/*（找出大文件/目录）→ lsof +L1（已删但还在占用文件）。',
    '端口占用：ss -tlnp | grep :port 找出哪个进程已监听。',
    'DNS 不通：dig domain.com（解析）; curl -v 尝试; 检查 /etc/resolv.conf。',
    '重启后自动启动：systemctl enable/status service。',
  ],
  notes: [
    'lsof +L1 列出已删除但仍被进程打开的文件——是磁盘空间不释放的常见原因。',
    'dmesg -T 显示人类可读时间的系统日志。',
  ],
  example: `# CPU 满载
top            # 按 P 按 CPU 排序
ps -mp $PID -o PID,CPU,CMD   # 查看特定进程线程

# 内存
free -h
dmesg -T | grep -i oom
find /proc/*/status -exec grep -l 'OOM' {} \;

# 磁盘满
df -h
du -sh /var/log/* | sort -rh | head
lsof +L1 | head

# 端口占用
ss -tlnp | grep :80

# 重启服务
journalctl -u nginx --since "5 min ago"
systemctl restart nginx`,
};

const linux21 = {
  id: 'linux-perf-monitor',
  title: '21. 实战：系统监控——iostat / vmstat / dmesg / journalctl',
  category: '实战',
  version: '通用',
  level: '进阶',
  summary: '综合使用各种监控工具诊断 CPU、内存、I/O 和系统日志问题。',
  detail: [
    'vmstat 1 5：每 1 秒一次，共 5 次——看 CPU（us/sy/id/wa）、内存（swap）。',
    'iostat -x 1：磁盘 I/O 详细统计（%util、await、r/s、w/s）。',
    'dmesg -T 查看内核日志（硬件错误、磁盘 I/O 错误、OOM）。',
    'journalctl -u nginx --follow：实时 systemd 单元日志。',
    'uptime：查看系统运行时间和平均负载（load average < 核数*0.7 正常）。',
    'sar（sysstat 包）：历史性能数据采集与报告。',
  ],
  notes: [
    'iostat 的 %util 接近 100% 时磁盘成为瓶颈。',
    'load average 超过 CPU 核数并不一定有问题——要看等待 CPU 的进程数。',
  ],
  example: `# 综合监控
vmstat 1 5

# 磁盘 I/O
iostat -x 1 3
iostat -p sda -x 1  # 特定磁盘

# 系统日志
dmesg -T | tail -20
journalctl -u nginx --since "1 hour ago" --no-pager | grep error

# 历史性能
sar -u 1 3    # CPU 使用率
sar -r 1 3    # 内存使用

# 负载
uptime
cat /proc/loadavg`,
};

const linux22 = {
  id: 'linux-roadmap',
  title: '22. 学习路线：Linux 能力成长路径',
  category: '实战',
  version: '通用',
  level: '进阶',
  summary: '从入门到精通的 Linux 学习路线，推荐进阶主题和认证。',
  detail: [
    '阶段一（已覆盖）：文件操作、权限、文本处理、管道、进程管理。',
    '阶段二：Shell 脚本、正则表达式、Vim/Neovim 编辑器。',
    '阶段三：网络管理（iptables/nftables）、防火墙、SELinux/AppArmor。',
    '阶段四：存储管理（LVM 逻辑卷、RAID、ZFS/Btrfs）。',
    '阶段五：容器与虚拟化（Docker 已学 → KVM/libvirt → Kubernetes）。',
    '推荐认证：RHCSA（Red Hat Certified System Administrator）、LFCS。',
  ],
  notes: [
    '学习 Linux 最好的方式是动手——在自己电脑上装 Linux 虚拟机或 WSL2。',
    '关注 Linux 内核变化：kernelnewbies.org 了解新版本特性。',
  ],
  example: `# 推荐学习资源
# 书籍：《鸟哥的 Linux 私房菜》《The Linux Command Line》
# 实践：在 VirtualBox/VMware 安装 CentOS/Debian
# 在线：Linux Journey (linuxjourney.com)、OverTheWire Bandit

# 日常练习
# 每天用命令行完成日常操作（不打开文件管理器）
# 写脚本自动化重复任务
# 阅读 /var/log/ 下的系统日志

# 进阶练习
strace ls            # 跟踪系统调用
perf stat ls         # 性能统计
bpftrace -e 'tracepoint:syscalls:sys_enter_openat { printf("%s\\n", str(args->filename)); }'`,
};

module.exports = { linux19, linux20, linux21, linux22 };