// Linux 平台软件开发 16–20：容器与工作流
const dev16 = {
  id: 'ld-containerize',
  title: '16. 开发环境容器化：Docker 开发容器',
  category: '开发',
  version: 'Docker',
  level: '中阶',
  summary: '用 Docker 提供一致的开发/测试环境：Dockerfile、多阶段构建、devcontainer。',
  detail: [
    '容器把应用与其依赖打包，保证"在我机器上能跑"换到别处也能跑，是 Linux 开发标配。',
    '开发用容器：挂载源码目录为卷(-v)，在容器里装好工具链，主机只用编辑器。',
    '多阶段构建：第一层编译(带全部依赖)，第二层只拷贝二进制，大幅减小镜像。',
    'Dockerfile 常见指令：FROM、RUN、COPY、WORKDIR、ENTRYPOINT/CMD、EXPOSE。',
    '.dockerignore 排除 node_modules/build 等，避免缓存污染与大体积上下文。',
    'VS Code Dev Containers(.devcontainer) 把"容器即开发环境"做成开箱即用体验。',
  ],
  notes: [
    '容器构建镜像的命令是 docker build 而不是 docker run；RUN 每条指令产生一层镜像。',
    '调试用 docker run -it --rm -v $(pwd):/app -w /app 镜像 命令 挂载当前目录。',
  ],
  example: `# Dockerfile(多阶段构建 C)
# 阶段1: 编译
FROM gcc:13 AS builder
WORKDIR /src
COPY . .
RUN gcc -O2 main.c -o app

# 阶段2: 运行(只留二进制)
FROM debian:bookworm-slim
COPY --from=builder /src/app /usr/local/bin/app
ENTRYPOINT ["app"]

# 构建与运行
docker build -t myapp .
docker run --rm myapp`,
  example2: `# 开发容器: 挂载源码 + 交互式
docker run -it --rm \\
  -v $(pwd):/work -w /work \\
  -p 8080:8080 \\
  gcc:13 bash
# 在容器里就能直接 gcc/make

# 常用
docker build --no-cache -t img .   # 强制重建
docker images                      # 查看镜像
docker exec -it 容器ID bash        # 进到运行中容器`,
  example3: `# 依赖管理 + 多种架构
# 构建并推送多架构镜像
docker buildx build --platform \\
  linux/amd64,linux/arm64 \\
  -t myapp:latest --push .

# 用 docker-compose 起完整开发栈
# docker-compose.yml
# services:
#   app:
#     build: .
#     volumes: [".:/work"]
#     ports: ["8080:8080"]
docker compose up -d
docker compose down`,
};

const dev17 = {
  id: 'ld-cross',
  title: '17. 交叉编译：面向 ARM / 特定架构',
  category: '构建',
  version: 'gcc13',
  level: '中阶',
  summary: '为嵌入式/ARM 等不同架构编译：交叉工具链、CMake 工具链文件与 sysroot。',
  detail: [
    '交叉编译：在 x86 上编译运行于 ARM 等另一架构的程序，常见于嵌入式与树莓派。',
    '本质是换一套编译器前缀，如 arm-linux-gnueabihf-gcc 替代 gcc。',
    'CMake 通过工具链文件指定 CMAKE_SYSTEM_NAME / CMAKE_C_COMPILER 实现交叉编译。',
    'Sysroot：交叉编译需要目标机的头文件与库，用 --sysroot 指定目录。',
    '静态链接(-static)能避免目标机缺依赖；否则需把动态库一并拷贝。',
    '验证产物架构：file 命令会打印 "ARM, dynamically linked" 等。',
  ],
  notes: [
    '交叉编译最常报错是"找不到 stdio.h"——多半是没指向 sysroot 或工具链缺 libc-dev。',
    '确认目标架构字节序/位数：file 打印 x86-64 或 ARM aarch64。',
  ],
  example: `# 安装交叉工具链(Debian/Ubuntu)
sudo apt install gcc-arm-linux-gnueabihf

# 直接编译 C
arm-linux-gnueabihf-gcc \
  --sysroot=/opt/sdk/sysroot \\
  main.c -o app_arm

# 验证架构
file app_arm
# 输出: ELF 32-bit LSB, ARM ARMv7... dynamically linked`,
  example2: `# CMake 交叉编译(工具链文件)
# toolchain-arm.cmake
set(CMAKE_SYSTEM_NAME Linux)
set(CMAKE_SYSTEM_PROCESSOR arm)

set(CMAKE_C_COMPILER arm-linux-gnueabihf-gcc)
set(CMAKE_CXX_COMPILER arm-linux-gnueabihf-g++)

set(CMAKE_SYSROOT /opt/sdk/sysroot)

# 使用
cmake -S . -B build-arm \\
  -DCMAKE_TOOLCHAIN_FILE=toolchain-arm.cmake
cmake --build build-arm
file build-arm/app`,
  example3: `# 分发到目标机(注意动态库)
# 查看需要哪些动态库
arm-linux-gnueabihf-readelf -d app_arm | grep NEEDED
# 或
arm-linux-gnueabihf-objdump -p app_arm | grep NEEDED

# 静态链接之选(避免带库)
arm-linux-gnueabihf-gcc --static main.c -o app_static

# 拷贝到板子(用 scp)
scp app_arm user@板子IP:/tmp/

# 在板子上运行
ssh user@板子IP /tmp/app_arm`,
};

const dev18 = {
  id: 'ld-ci',
  title: '18. CI/CD 与 GitOps：GitHub Actions 构建发布',
  category: '部署',
  version: 'GitHub',
  level: '中阶',
  summary: '把 Linux 构建/测试/发布自动化：GitHub Actions 的 workflow、job 与发布制品。',
  detail: [
    'CI/CD 在每次 push/PR 自动构建、测试、发布，是工程化的核心环节。',
    'GitHub Actions：.github/workflows/*.yml 声明 workflow，run 在 ubuntu-latest 等 Linux runner 上。',
    'workflow 三要素：on 触发条件、jobs 作业、steps 步骤；steps 用 uses(现成 action) 或 run(命令)。',
    '上传/下载制品：actions/upload-artifact、download-artifact 传递构建产物。',
    '构建 + 测试 + 打 tag 发布是典型组合，可在 Linux 上编译 C/C++、跑 pytest 等。',
    '缓存依赖(actions/cache)可显著加速重复构建。',
  ],
  notes: [
    'secret 用 \${{ secrets.变量 }} 引用，绝不直接写死在 yml 里(会进历史)。',
    '想本地模拟：act GitHub 官方工具可在容器里跑 Actions。',
  ],
  example: `# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install deps
        run: |
          sudo apt update
          sudo apt install -y build-essential cmake
      - name: Build
        run: |
          cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
          cmake --build build
      - name: Run tests
        run: ./build/tests`,
  example2: `# 发布制品 + 缓存
steps:
  - uses: actions/checkout@v4
  - uses: actions/cache@v4
    with:
      path: build
      key: build-\${{ runner.os }}-commit-\${{ github.sha }}
  - name: Build
    run: |
      cmake -S . -B build
      cmake --build build
  - name: Upload artifact
    uses: actions/upload-artifact@v4
    with:
      name: app-linux
      path: build/app`,
  example3: `# 按 tag 触发布发布 Release
# on:
#   push:
#     tags: ["v*"]
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build
        run: make
      - name: Create Release
        uses: softprops/action-gh-release@v2
        with:
          files: ./app
          token: \${{ secrets.GITHUB_TOKEN }}

# 结合 ./ 前缀, 注意 CMD 覆盖 ENTRYPOINT
# 参考 https://docs.docker.com 与 Actions 文档`,
};

const dev19 = {
  id: 'ld-remote',
  title: '19. 远程开发工作流：SSH / VSCode Remote / 云主机',
  category: '开发',
  version: 'Linux',
  level: '入门',
  summary: '在远程 Linux 上开发的最佳实践：SSH 密钥、VSCode Remote、端口转发与同步。',
  detail: [
    '远程开发既能在功能强大的 Linux 服务器上编译，又不牺牲本地编辑器体验。',
    'SSH 基础：ssh user@host、密钥对(ssh-keygen + ssh-copy-id)、Config 文件存常用别名与跳板机。',
    'VSCode Remote-SSH：本地 IDE 连远程，直接在远程文件系统上编辑/调试/跑终端。',
    '端口转发：-L 本地:远程映射，把远程服务(如 :8080)映射到本地访问。',
    '文件同步：scp、rsync -av 增量同步，编辑与远程一致。',
    '无头云主机加 Screen/tmux 让长任务在断开后继续。',
  ],
  notes: [
    '安全：禁止密码登录、只用密钥，禁用 root 直连，是服务器基本防线。',
    'rsync 比 scp 更实用：断点续传、只传差异、权限保留。',
  ],
  example: `# 生成并配置密钥登录
ssh-keygen -t ed25519 -C "you@machine"
ssh-copy-id user@server        # 把公钥装上去
ssh user@server                # 之后免密

# SSH config 便捷
# ~/.ssh/config:
#   Host myserver
#     HostName 203.0.113.10
#     User deploy
#     IdentityFile ~/.ssh/id_ed25519
ssh myserver`,
  example2: `# VSCode Remote-SSH
# 1) 装 Remote-SSH 扩展
# 2) Ctrl+Shift+P -> Remote-SSH: Connect to Host
# 3) 选择 myserver / 输入地址
# 4) 直接打开远程文件夹, 用远程工具链编译调试

# 命令行开发三件套
ssh myserver 'cd /app && make'     # 远程编译
scp main.c myserver:/app/          # 上传文件
rsync -avz ./src/ myserver:/app/   # 增量同步目录`,
  example3: `# 端口转发(把远程服务映射到本地)
ssh -L 8080:localhost:8080 myserver
# 本地浏览器访问 http://localhost:8080 即远程服务

# 反向转发: 把本地服务暴露给远程
ssh -R 9090:localhost:3000 myserver

# 远程长任务不断
ssh myserver
tmux new -s build
./build.sh          # 慢慢跑
Ctrl+b d            # 断开
logout              # 关闭 ssh
# 稍后重连
ssh myserver
tmux attach -t build`,
};

const dev20 = {
  id: 'ld-roadmap',
  title: '20. 命令速查与学习路线',
  category: '实战',
  version: 'Linux',
  level: '高级',
  summary: '把 Linux 平台软件开发浓缩成速查表，并给出循序渐进的成长路线。',
  detail: [
    '核心闭环：编辑器(编辑) -> 编译 -> 运行 -> 调试 -> 提交(Git) -> 部署(容器/systemd)。',
    '工具链：gcc/g++/clang + Make/CMake；调试：gdb/strace/valgrind/perf。',
    '系统编程：文件 I/O、进程、线程、socket、信号、管道，理解 OS 接口。',
    '自动化：Bash 脚本 + CI(CI/CD) + Git，告别手工重复。',
    '工程化：打包(deb/rpm/AppImage)、容器(Docker)、远程开发(SSH/VSCode)。',
    '进阶方向：性能剖析、网络编程(epoll)、内核/驱动、嵌入式交叉编译、安全加固。',
  ],
  notes: [
    '路线不是线性背命令，而是带着真实问题去查：性能慢->perf，崩溃->gdb，不会装->包管理。',
    '每学一个概念尽量落到"能跑"的可复现示例，比大量阅读记忆深刻得多。',
  ],
  example: `# ===== 高频命令速查 =====
# 编译 & 构建
gcc -Wall -Wextra -g main.c -o app
cmake -S . -B build && cmake --build build
make -j$(nproc)

# 调试 & 分析
gdb ./app
strace -f ./app
valgrind --leak-check=full ./app
perf record -g ./app && perf report

# 进程 & 系统
ps aux | grep app
kill -9 PID
sudo systemctl status myservice
journalctl -u myservice -f`,
  example2: `# ===== 常用组合 =====
# 快速跑测试
ctest --test-dir build --output-on-failure

# 看占用端口
ss -tlnp
sudo lsof -i :8080

# 差别同步到服务器
rsync -avz --delete ./dist/ user@server:/var/www/

# 容器调试
docker run --rm -it myapp bash

# 一键重建 + 测试
make clean && make && ./tests`,
  example3: `# ===== 推荐学习路线 =====
# 阶段1 基础(2-3周)
#   命令行 + vim + gcc 单文件 + 基础调试
#
# 阶段2 工具链(2周)
#   Makefile -> CMake -> 多文件/多目标项目
#
# 阶段3 系统编程(3周)
#   文件 I/O -> 进程/多进程 -> 线程/同步 -> socket
#
# 阶段4 工程化(2周)
#   Git -> Bash 自动化 -> systemd -> 打包 -> Docker
#
# 阶段5 调优(持续)
#   gdb/strace/perf/valgrind 深度
#
# 配套地练: 手写 C10K 服务器、自建游戏服务器、
# 写个 CLI 全家桶 (cat/sed 的简化版)
# 祝一路到 Linux 平台开发高手！`,
};

if (typeof module !== 'undefined') module.exports = { dev16, dev17, dev18, dev19, dev20 };