// Linux 平台软件开发 11–15：系统编程
const dev11 = {
  id: 'ld-fileio',
  title: '11. 标准文件 I/O 与底层系统调用',
  category: '系统编程',
  version: 'Linux',
  level: '中阶',
  summary: '从 fopen/fread 到 open/read，理解标准库与系统调用的层次与缓冲机制。',
  detail: [
    'Linux 一切皆文件：普通文件、目录、设备、socket、管道都能用文件接口访问。',
    '库层(FILE*)：fopen/fread/fwrite/fgets 带缓冲，C 运行时库负责，常用且方便。',
    '系统调用层：open/read/write/close 直接操作系统，无缓冲，控制更细但要小心。',
    'open 的 flag：O_RDONLY/O_WRONLY/O_RDWR/O_CREAT/O_TRUNC/O_APPEND；权限用第三个参数(如 0644)。',
    'read/write 返回实际读写的字节数，0 表示 EOF，-1 表示出错；可能"部分读写"需循环。',
    'fseek/seek 定位；缓冲策略 setvbuf 可关缓冲(适合写日志实时落盘)。',
  ],
  notes: [
    '新手常犯：用 fprintf 打日志后立刻程序崩溃，发现没写进文件——多为缓冲未 flush，加 fflush 或提前 fopen 时开无缓冲。',
    '路径 "." 是相对路径；写系统程序注意错误处理 errno + perror。',
  ],
  example: `// 库层文件读写
#include <stdio.h>

int main() {
  FILE *f = fopen("data.txt", "r");
  if (!f) { perror("fopen"); return 1; }

  char line[256];
  while (fgets(line, sizeof line, f)) {
    fputs(line, stdout);
  }
  fclose(f);
  return 0;
}`,
  example2: `// 底层系统调用
#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>

int main() {
  int fd = open("out.log", O_WRONLY | O_CREAT | O_APPEND, 0644);
  if (fd < 0) { perror("open"); return 1; }

  const char *msg = "hello\\n";
  write(fd, msg, 6);

  close(fd);
  return 0;
}
// 编译: gcc fileio.c -o fileio`,
  example3: `// 逐行读 + 写文件的完整示例
#include <stdio.h>

int main() {
  FILE *in = fopen("in.txt", "r");
  FILE *out = fopen("out.txt", "w");
  if (!in || !out) { perror("fopen"); return 1; }

  char line[512];
  while (fgets(line, sizeof line, in)) {
    fputs(line, out);          // 原样复制
  }
  fclose(in);
  fclose(out);
  return 0;
}
// 也可用命令验证: ./copy && diff in.txt out.txt && echo 一致`,
};

const dev12 = {
  id: 'ld-socket',
  title: '12. 网络编程：Socket 基础',
  category: '系统编程',
  version: 'Posix',
  level: '中阶',
  summary: '用 socket API 写最简 C/S：socket/bind/listen/accept 与 connect/send/recv。',
  detail: [
    'Berkeley Socket 是 Linux 网络编程基石，几乎所有语言/框架底层都用它。',
    '服务端流程：socket() 建套接字 -> bind() 绑定地址端口 -> listen() 监听 -> accept() 接受连接。',
    '客户端流程：socket() -> connect() 连接服务器。',
    '收发：send/recv(流式) 或 write/read；注意"部分发送/接收"需循环处理。',
    '地址结构 sockaddr_in：sin_family=AF_INET、sin_port=htons(端口)、sin_addr=inet_addr("127.0.0.1")。',
    '关闭与半关闭：close 释放；多连接用 select/poll/epoll 实现并发放大篇讲。',
  ],
  notes: [
    'bind 报 Address already in use 时是端口被占用，可 SO_REUSEADDR 复用或换端口。',
    '地址用 127.0.0.1 本地回环调试，外部机器连不进来时多半没绑 0.0.0.0。',
  ],
  example: `// 最简 TCP 服务端(echo)
#include <stdio.h>
#include <string.h>
#include <arpa/inet.h>
#include <unistd.h>

int main() {
  int s = socket(AF_INET, SOCK_STREAM, 0);
  struct sockaddr_in a = {
    .sin_family = AF_INET,
    .sin_port = htons(8080),
    .sin_addr.s_addr = htonl(INADDR_ANY),
  };
  bind(s, (void*)&a, sizeof a);
  listen(s, 5);
  printf("listening on 8080\\n");

  int c = accept(s, 0, 0);
  char buf[4096];
  int n = read(c, buf, sizeof buf);
  write(c, buf, n);          // echo 回去
  close(c); close(s);
  return 0;
}
// 编译: gcc srv.c -o srv && ./srv
// 测试: curl http://localhost:8080/`,
  example2: `# 用命令行工具理解网络
# 起一个监听
nc -l 9000 &
# 连上去发消息(另开终端)
echo "hi" | nc 127.0.0.1 9000

# 诊断
ss -tlnp                  # 查看监听的端口
ss -tn                    # 已建立的连接
netstat -tuln

# 功能测试
nc -zv 127.0.0.1 8080     # 端口连通测试
telnet 127.0.0.1 8080     # 手动连上去发协议内容`,
  example3: `// 最简 TCP 客户端
#include <stdio.h>
#include <string.h>
#include <arpa/inet.h>
#include <unistd.h>

int main() {
  int s = socket(AF_INET, SOCK_STREAM, 0);
  struct sockaddr_in a = { .sin_family = AF_INET,
    .sin_port = htons(8080) };
  inet_pton(AF_INET, "127.0.0.1", &a.sin_addr);

  if (connect(s, (void*)&a, sizeof a) < 0)
    { perror("connect"); return 1; }

  write(s, "ping", 4);
  char buf[128];
  int n = read(s, buf, sizeof buf);
  write(1, buf, n);           // 输出到 stdout
  close(s);
  return 0;
}
// 编译: gcc cli.c -o cli && ./cli`,
};

const dev13 = {
  id: 'ld-thread',
  title: '13. 多线程与并发：pthread 与并行',
  category: '系统编程',
  version: 'Posix',
  level: '中阶',
  summary: '用 pthread 创建线程、同步(sync)与避免数据竞争：mutex/cond 与原子操作。',
  detail: [
    '线程是进程内共享地址空间的执行单元，创建开销小，适合 I/O 与多核并行。',
    'pthread 核心：pthread_create/pthread_join、pthread_mutex_lock/unlock、pthread_cond_signal/wait。',
    '数据竞争：多个线程同时读写同一变量是未定义行为，必须用锁(mutex)或原子变量保护。',
    '死锁：两个线程互持对方要的锁会造成死锁；用统一加锁顺序可避免。',
    '验证工具：编译加 -fsanitize=thread 或 valgrind --tool=helgrind 检测竞态。',
    '现代 C++ 用 std::thread/std::mutex/std::atomic 等价封装，跨平台更友好。',
  ],
  notes: [
    '编译链接线程库一定要加 -pthread（或 -lpthread），否则报 undefined reference。',
    '$ gcc -pthread t.c -o t 记得带上，这是最常见的编译坑。',
  ],
  example: `// 多线程累加(不安全版, 会随机出错)
#include <pthread.h>
#include <stdio.h>

long counter = 0;

void *worker(void *arg) {
  for (int i = 0; i < 100000; i++) counter++;
  return 0;
}

int main() {
  pthread_t t[4];
  for (int i = 0; i < 4; i++)
    pthread_create(&t[i], 0, worker, 0);
  for (int i = 0; i < 4; i++)
    pthread_join(t[i], 0);
  printf("counter = %ld\\n", counter);   // 应 400000 但常更小
  return 0;
}
// gcc -pthread t.c -o t && ./t`,
  example2: `// 用 mutex 修复数据竞争
#include <pthread.h>
#include <stdio.h>

long counter = 0;
pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;

void *worker(void *arg) {
  for (int i = 0; i < 100000; i++) {
    pthread_mutex_lock(&lock);
    counter++;
    pthread_mutex_unlock(&lock);
  }
  return 0;
}
// 加锁后 counter 稳定为 400000`,
  example3: `// 检测竞态 (数据竞争工具)
# 编译时加 TSan
gcc -pthread -fsanitize=thread t.c -o t_tsan
./t_tsan        # 有竞争会输出 WARNING

# 或运行期 helgrind
valgrind --tool=helgrind ./t

# 原子替代锁(高并发性能好)
// #include <stdatomic.h>
// atomic_long counter = 0;
// atomic_fetch_add(&counter, 1);`,
};

const dev14 = {
  id: 'ld-process',
  title: '14. 多进程与管道：fork / exec / 管道',
  category: '系统编程',
  version: 'Linux',
  level: '中阶',
  summary: '进程是资源隔离单元：fork 创建、exec 替换、pipe 管道通信与回收。',
  detail: [
    '进程是独立的地址空间，是最强的隔离手段：一个崩溃不拖垮整个服务。',
    'fork() 复制出子进程，返回父进程 PID / 子进程 0，是写服务器(如 Nginx/Apache)的基础。',
    'exec 家族(execl/execvp)在子进程里加载新程序，覆盖当前进程映像。',
    'pipe() 创建一对读写 fd，实现父子进程单向通信；子进程继承父进程打开的 fd。',
    '回收：子进程退出变僵尸，父进程用 wait/waitpid 回收；不回收会积累僵尸进程。',
    '更安全/不便：相比线程，跨进程共享状态需 IPC(共享内存/消息队列/socket)，学习曲线更陡。',
  ],
  notes: [
    'fork 后父子进程只有 fd 共享指向同一文件表项，变量是各自拷贝——别指望改子进程影响父进程。',
    '写生产级服务首选 fork+exec 或线程模型皆可，视隔离需求而定。',
  ],
  example: `# fork + exec + wait 经典组合(C)
#include <unistd.h>
#include <sys/wait.h>
#include <stdio.h>

int main() {
  pid_t pid = fork();
  if (pid == 0) {
    // 子进程: 执行 ls
    execlp("ls", "ls", "-l", (char*)0);
    perror("exec"); return 1;
  }
  // 父进程: 等子进程结束并回收
  int status;
  waitpid(pid, &status, 0);
  printf("child exit status: %d\\n",
         WEXITSTATUS(status));
  return 0;
}
// 编译: gcc fork.c -o fork && ./fork`,
  example2: `// pipe 父子通信: 子写 父读
#include <unistd.h>
#include <stdio.h>

int main() {
  int fd[2];
  pipe(fd);
  pid_t pid = fork();

  if (pid == 0) {
    close(fd[0]);
    write(fd[1], "hello from child", 17);
    close(fd[1]);
    return 0;
  }
  close(fd[1]);
  char buf[64];
  int n = read(fd[0], buf, sizeof buf - 1);
  buf[n] = 0;
  printf("parent got: %s\\n", buf);
  return 0;
}`,
  example3: `# 僵尸进程的观察与避免
# 观察
ps aux | grep defunct

# wait 回收的完善写法
waitpid(-1, &status, 0);       // 回收任一子进程
while (waitpid(-1, NULL, 0) > 0);  // 回收全部

# 避免孤儿/僵尸: 父进程设信号处理器捕获 SIGCHLD
# 或用双 fork 使孙进程被 init 收养

# 父子进程文件描述符(都指向同一文件偏移)
# 常用于: 日志/计数器共享
echo "  注: strace 可看进程实际创建"
strace -f -c ./fork`,
};

const dev15 = {
  id: 'ld-package',
  title: '15. 软件打包：deb / rpm / AppImage',
  category: '部署',
  version: 'Linux',
  level: '中阶',
  summary: '把 Linux 软件打包成可分发的包：fpm 生成 deb/rpm，AppImage 免安装分发。',
  detail: [
    'Linux 生态发版方式：源码编译、二进制 tar 包、系统包(deb/rpm)、AppImage/Snap/Flatpak。',
    'Build-Depends/Depends 声明依赖；deb 用 dpkg-deb 或 dh_make 打包，rpm 用 rpmbuild 加 spec 文件。',
    'fpm 是一个常用工具：一条命令把目录打成 deb/rpm，省去手写 spec。',
    'AppImage 免安装单文件运行：AppDir 目录结构 + 打包脚本生成 .AppImage，适合桌面软件分发。',
    '打包前理顺文件布局：二进制进 usr/bin、库进 usr/lib、配置进 etc、文档进 usr/share。',
    '发布后签名包 + 维护仓库(如 apt 源) 是更专业的做法。',
  ],
  notes: [
    '打 deb 的 .deb 依赖"debian 布局"：把文件放到正确目录再用 dpkg-deb --build。',
    'AppImage 无法保证所有平台(Linux 分发差异)，但共享库依赖少时最省事。',
  ],
  example: `# 用 fpm 快速打包成 deb(需先安装)
# fpm -s dir -t deb -n myapp ...
fpm -s dir -t deb -n myapp -v 1.0.0 \
  ./build/myapp=/usr/bin/myapp \
  ./config.ini=/etc/myapp.ini
# 得到 myapp_1.0.0_amd64.deb

# 安装测试
sudo dpkg -i myapp_1.0.0_amd64.deb`,
  example2: `# 手动构建 .deb 目录布局
mkdir -p mypkg/DEBIAN
mkdir -p mypkg/usr/bin
cp build/app mypkg/usr/bin/app

cat > mypkg/DEBIAN/control <<'EOF'
Package: myapp
Version: 1.0.0
Section: utils
Priority: optional
Architecture: amd64
Maintainer: you@example.com
Description: My example application
Depends: libc6
EOF

dpkg-deb --build mypkg
# 生成 mypkg.deb`, 
  example3: `# rpm 打包(简要)
# 准备 spec 文件 + sources
mkdir -p ~/rpmbuild/{BUILD,RPMS,SOURCES,SPECS}
cat > ~/rpmbuild/SPECS/myapp.spec <<'EOF'
Name: myapp
Version: 1.0.0
Release: 1
Summary: My app
License: MIT
%description
Example package.
%prep
%build
gcc -O2 main.c -o app
%install
install -Dm755 app %{buildroot}%{_bindir}/app
%files
%{_bindir}/app
EOF

rpmbuild -ba ~/rpmbuild/SPECS/myapp.spec
# 生成的 rpm 在 RPMS/x86_64/`,
};

if (typeof module !== 'undefined') module.exports = { dev11, dev12, dev13, dev14, dev15 };