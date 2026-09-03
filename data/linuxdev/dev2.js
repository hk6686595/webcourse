// Linux 平台软件开发 6–10：库、脚本与进程
const dev6 = {
  id: 'ld-libs',
  title: '6. 静态库与动态库：制作与链接',
  category: '构建',
  version: '13.x',
  level: '中阶',
  summary: '用 ar/ranlib 做静态库，用 gcc -shared 做动态库，理解 .a/.so 与链接原理。',
  detail: [
    'Linux 库分两类：静态库 .a（把目标代码直接打进可执行文件）、动态库 .so（运行时按需加载）。',
    '静态库用 ar 打包 .o 生成；动态库用 gcc -shared -fPIC 编译生成。',
    '静态库文件体积大但不依赖运行时；动态库体积小、可共享、能升级而无需重编主程序。',
    '链接动态库时只需库的符号表，程序运行时用 ld.so 加载，可用 LD_LIBRARY_PATH 指定查找路径。',
    '查看依赖: ldd 可执行文件；-rpath 编译期写死搜索路径，避免部署时 LD_LIBRARY_PATH 缺失。',
    '制作流程共性：先 -c 出 .o，再分别用 ar / gcc -shared 汇集成库。',
  ],
  notes: [
    '动态库被删或路径不在搜索范围内会报 "./app: error while loading shared libraries"，用 LD_LIBRARY_PATH 或 ldconfig 解决。',
    '动态库一定要用 -fPIC(位置无关码) 编译，否则链接会报错。',
  ],
  example: `# 1) 准备源码
# util.c + util.h
gcc -c util.c -o util.o

# 2) 制作静态库 (.a)
ar rcs libutil.a util.o
# 链接
gcc main.c -L. -lutil -o app_static
./app_static

# 3) 制作动态库 (.so)
gcc -fPIC -c util.c -o util_pic.o
gcc -shared util_pic.o -o libutil.so
# 链接 + 运行时查找
gcc main.c -L. -lutil -o app_dyn
export LD_LIBRARY_PATH=.:$LD_LIBRARY_PATH
./app_dyn`,
  example2: `# 查看与使用库
# 查看动态库依赖
ldd ./app_dyn
# 查看目标文件/库里的符号
nm libutil.a
nm -D libutil.so
# 制作索引(老式静态库可能需 ranlib)
ar t libutil.a          # 列出成员
ranlib libutil.a        # 生成索引, 加快查找

# 编译期头文件目录
gcc main.c -I./include -L./lib -lutil -o app`,
  example3: `# 动态库搜索路径(三选一)
# 方式 A: 环境变量(临时)
LD_LIBRARY_PATH=/opt/mylib ./app
# 方式 B: 编译期 -rpath 写死
gcc main.c -L. -lutil -Wl,-rpath,/opt/mylib -o app_rpath
# 方式 C: 系统缓存 ldconfig
sudo cp libutil.so /usr/local/lib
sudo ldconfig
./app

# 查看某库链接到哪个真实文件
readlink -f /usr/local/lib/libutil.so`,
};

const dev7 = {
  id: 'ld-script',
  title: '7. Shell 脚本开发：变量 / 分支 / 循环 / 函数',
  category: '开发',
  version: 'bash5',
  level: '入门',
  summary: '写健壮的 Bash 脚本：变量运算、条件控制、循环、函数与错误处理。',
  detail: [
    'Bash 是 Linux 平台开发的基础设施语言，用于自动化构建、部署、测试与运维脚本。',
    '变量：name=value（等号无空格）；${var} 明确边界；$@/$#/$0 处理参数；$? 上一条命令退出码。',
    '条件：if [ -f file ]、[ "$a" = "$b" ]；数值用 (( )) 或 test；存在与权限判断用 -e/-f/-d/-x。',
    '循环：for i in .../seq；while 条件；case 多分支匹配模式。',
    '错误处理：set -e 出错即停、set -u 用未定义变量报错、trap 捕获信号做清理。',
    '函数：myfunc(){}；脚本被错误地以分号/空格断行是新手常踩的坑。',
  ],
  notes: [
    '脚本首行 #!/usr/bin/env bash + chmod +x script.sh 才能 ./script.sh 直接执行。',
    '[ 与 ] 两侧必须有空格；这地方最容易写成 [xx] 导致语法错。',
  ],
  example: `#!/usr/bin/env bash
# 变量与输出
NAME="World"
echo "Hello, $NAME"

# 读取参数
echo "脚本: $0, 参数数: $#, 全部: $@"
echo "退出码: $?"

# 条件
if [ -f "$1" ]; then
  echo "文件 $1 存在"
else
  echo "文件不存在"
fi`,
  example2: `#!/usr/bin/env bash
# 循环
for file in *.txt; do
  echo "处理 $file"
done

for i in $(seq 1 5); do
  echo "第 $i 次"
done

# while 读文件
while IFS= read -r line; do
  echo "$line"
done < data.txt

# case 多分支
case "$1" in
  start) echo "启动" ;;
  stop)  echo "停止" ;;
  *)     echo "用法: $0 start|stop" ;;
esac`,
  example3: `#!/usr/bin/env bash
# 健壮性设置
set -euo pipefail

# 函数
log() { echo "[$(date +%T)] $*"; }

# 错误处理 + 清理
cleanup() { echo "清理中..."; }
trap cleanup EXIT

deploy() {
  local env="$1"
  log "部署到 $env"
  if ! command -v rsync >/dev/null; then
    echo "缺少 rsync"; return 1
  fi
  rsync -az ./dist/ server:/srv/app/
}
deploy "$@"
echo "部署完成"`,
};

const dev8 = {
  id: 'ld-signal',
  title: '8. 进程信号与后台任务：kill / nohup / 守护进程',
  category: '开发',
  version: 'Linux',
  level: '中阶',
  summary: '理解 Unix 信号，控制与管理进程；nohup、setsid、守护进程与 systemd 服务。',
  detail: [
    '信号是 Unix 进程间异步通知机制：SIGTERM(15) 优雅退出、SIGKILL(9) 强制杀、SIGINT(2) Ctrl+C、SIGHUP(1) 挂断。',
    'kill 默认发 SIGTERM；kill -9 发 SIGKILL，进程无法捕获，是最后手段。',
    '后台化：cmd & 放后台；nohup cmd & 忽略 HUP 且输出到 nohup.out；setsid 完全脱离会话。',
    '父 shell 退出可能导致子进程被杀，nohup/setsid 避免这种情况，是多进程脚本的关键。',
    '查看进程：ps aux、top、pgrep；kill $(pgrep -f name) 按名字杀。',
    '生产环境推荐用 systemd 管理守护进程（restart 策略、开机自启、日志管理），见下一篇。',
  ],
  notes: [
    '程序应捕获这 SIGTERM 做优雅清理退出，而不是等被 SIGKILL 强杀。',
    'nohup 的输出若不重定向会写 nohup.out，记得用 >log 2>&1 指定日志。',
  ],
  example: `# 前台 vs 后台
sleep 100                 # 前台, Ctrl+C 发 SIGINT
sleep 100 &               # 后台, 打印 [1] PID
kill %1                   # 杀后台作业
jobs                      # 查看后台作业
fg                        # 调回前台

# 信号
kill 1234                 # 默认 SIGTERM(15)
kill -9 1234              # SIGKILL(9) 强杀
kill -s HUP 1234          # SIGHUP(1) 让服务重载配置`,
  example2: `# 脱离终端运行(SSH 断开不中断)
nohup my_server &
# 等价于 (输出重定向到日志)
nohup my_server > /var/log/srv.log 2>&1 &
echo $!                    # 打印刚启动的 PID

# 查找/批量管理
ps aux | grep my_server
pgrep -f my_server
pkill -f my_server

# 等待后台进程
wait                      # 等所有后台任务结束`,
  example3: `# 让进程优雅处理退出信号(C 语言)
// graceful.c
#include <signal.h>
#include <stdio.h>
#include <unistd.h>

volatile int running = 1;
void on_term(int sig) { running = 0; }

int main() {
  signal(SIGTERM, on_term);
  signal(SIGINT, on_term);
  while (running) {
    printf("working...\\n");
    sleep(1);
  }
  printf("exited cleanly\\n");
  return 0;
}
# 编译: gcc -g graceful.c -o graceful
# ./graceful & kill PID -> 会走到 cleanly 而非被强杀`,
};

const dev9 = {
  id: 'ld-systemd',
  title: '9. 守护进程管理：systemd 服务单元',
  category: '开发',
  version: 'v255',
  level: '中阶',
  summary: '用 systemd 管理服务：编写 .service 单元、开机自启、日志与状态控制。',
  detail: [
    'systemd 是绝大多数现代 Linux 的 init 系统，负责启动、监督与日志服务，/sbin/init 是它的符号链接。',
    '服务单元文件放 /etc/systemd/system/，扩展名 .service，用 [Unit]/[Service]/[Install] 三段描述。',
    '核心命令：systemctl start/stop/restart/status、enable/disable(开机自启)、daemon-reload(改配置后)。',
    '[Service] 关键项：ExecStart、WorkingDirectory、Restart=always、User=、Environment=FOO=bar。',
    '日志看 journalctl：journalctl -u 服务名 -f 实时跟踪；-n 看最近行。',
    '开机自启：systemctl enable 服务名（创建 /etc/systemd/system/multi-user.target.wants/ 链接）。',
  ],
  notes: [
    '修改 .service 文件后必须先 systemctl daemon-reload 再 restart，改动才生效。',
    'Restart=on-failure 是落网服务的标配，防止进程崩溃后服务整体消失。',
  ],
  example: `# /etc/systemd/system/myapp.service
[Unit]
Description=My Web App
After=network.target

[Service]
ExecStart=/opt/myapp/myapp --port 8080
WorkingDirectory=/opt/myapp
User=www-data
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target`,
  example2: `# 管理命令
sudo systemctl start myapp      # 启动
sudo systemctl status myapp     # 状态
sudo systemctl restart myapp    # 重启
sudo systemctl stop myapp       # 停止

# 开机自启
sudo systemctl enable myapp
sudo systemctl disable myapp

# 修改配置后
sudo systemctl daemon-reload
sudo systemctl restart myapp`,
  example3: `# 日志查看
journalctl -u myapp              # 该服务的所有日志
journalctl -u myapp -f           # 实时跟随
journalctl -u myapp -n 50        # 最近 50 行
journalctl -u myapp --since "1 hour ago"

# 按时间/优先级过滤
journalctl -p err                # 只看错误级
journalctl -k                    # 内核日志

# 单元测试快速验证
systemd-analyze verify myapp.service
systemd-analyze list-dependencies myapp`,
};

const dev10 = {
  id: 'ld-strace',
  title: '10. 系统调用与性能剖析：strace / perf / gprof',
  category: '调试',
  version: 'Linux',
  level: '高级',
  summary: '从系统调用顶层到底层 CPU 剖析：strace、ltrace、perf、gprof 的用途与用法。',
  detail: [
    'strace 跟踪程序的系统调用(打开文件、网络、内存)与信号，是"程序到底在干嘛"的第一现场工具。',
    '常用 strace -f 跟踪子进程、-e trace=open,read 过滤、-o 输出文件、-c 统计调用次数。',
    'perf 是 Linux 的性能分析器：perf stat 看整体计数、perf record/report 采样热点函数、perf top 实时。',
    'gprof 是 GNU 剖析器：编译加 -pg，运行后生成 gmon.out，gprof 分析每个函数耗时占比。',
    'ltrace 跟踪动态库调用；valgrind 检测内存泄漏与越界（但慢很多）。',
    '定位性能瓶颈的原则：先测量(perf/统计)再优化，不要凭空猜热点。',
  ],
  notes: [
    'strace -p PID 可附加到已在运行的进程查看其行为。',
    'perf record 需要内核权限，容器里常受限；gprof 最省事但只对各函数总占比有意义。',
  ],
  example: `# strace 看程序做了什么
strace ./myprog
strace -f -o sys.log ./prog     # 跟子进程 + 写文件
strace -e trace=open,read -c ./prog   # 统计 open/read 次数

# 看启动慢是把时间花在哪
strace -tt -T -C ./slow_prog 2>&1 | head -30`,
  example2: `# perf 性能剖析
perf stat ./prog              # 整体硬件计数(时钟/分支/缓存)
perf top                      # 实时热点(类似 top 但看内核/CPU)
# 采样分析热点函数
perf record -g ./prog         # 有调用图(需要 -g 编译)
perf report                   # 交互式查看热点
perf annotate                 # 热点行级查看`,
  example3: `# gprof 函数级剖析
gcc -pg -O0 prog.c -o prog
./prog                        # 运行后生成 gmon.out
gprof ./prog gmon.out | head -40
# 输出: 每个函数 self seconds / cumulative

# valgrind 内存检查
valgrind --leak-check=full ./prog
# 输出: 泄漏多少字节, 在哪个分配点

# 综合诊断顺序建议
# 1) strace 看行为
# 2) perf/valgrind 找热点/内存
# 3) 精修`,
};

if (typeof module !== 'undefined') module.exports = { dev6, dev7, dev8, dev9, dev10 };