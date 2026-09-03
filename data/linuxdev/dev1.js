// Linux 平台软件开发 1–5：工具链与构建
const dev1 = {
  id: 'ld-toolchain',
  title: '1. 编译工具链：gcc / g++ / clang',
  category: '工具链',
  version: '13.x',
  level: '入门',
  summary: 'Linux 上最核心的编译工具：gcc/g++/clang 的常用参数与 C/C++ 编译全流程。',
  detail: [
    '工具链指 编译器 + 汇编器 + 链接器 + 标准库 的组合：Linux 上最常用 GNU 工具链（gcc/g++）与 LLVM（clang/clang++）。',
    'gcc 编译 C，g++ 编译 C++；两者只差默认链接的语言运行时，参数几乎一致。',
    '编译流程分四步：预处理(-E)、编译成汇编(-S)、汇编成目标文件(-c)、链接生成可执行文件。',
    '常用参数：-o 输出文件、-Wall/-Wextra 开启警告、-g 生成调试信息、-O0~-O3 优化等级、-std 指定标准。',
    '多文件：多个 .c/.cpp 一起传给编译器，或分步 -c 生成 .o 再统一链接。',
    'clang 的报错信息通常更友好，且是 macOS 的默认编译器，与 gcc 参数高度兼容。',
  ],
  notes: [
    '生产必须加 -Wall -Wextra -g；警告不是噪音，是编译器在帮你提前发现 bug。',
    '找不到头文件报 "No such file or directory" 时用 -I 指定头文件目录，链接缺符号用 -L + -l 指定库。',
  ],
  example: `# 查看版本
gcc --version
clang --version

# C 单文件 -> 可执行文件
gcc hello.c -o hello
./hello

# C++ 单文件
g++ main.cpp -o app -std=c++17 -Wall -Wextra -g

# 分步看编译过程
gcc -E hello.c -o hello.i      # 1) 预处理(展开头文件/宏)
gcc -S hello.i -o hello.s      # 2) 汇编代码
gcc -c hello.s -o hello.o      # 3) 目标文件(机器码)
gcc hello.o -o hello           # 4) 链接
./hello`,
  example2: `# 多文件编译
# 文件: main.c + util.c + util.h
gcc main.c util.c -o program      # 一键编译所有并链接
gcc -c main.c -o main.o           # 分步: 只编译不链接
gcc -c util.c -o util.o
gcc main.o util.o -o program      # 手动链接

# 优化与调试
gcc -O2 main.c -o fast            # 优化等级 2
gcc -O0 -g main.c -o debug        # 不优化 + 调试信息(gdb 用)
gcc -march=native main.c -o x     # 针对本机 CPU 指令优化`,
  example3: `# 头文件与库
gcc main.c -I./include -o app     # -I 指定头文件搜索目录
gcc main.c -lmath -o app          # -l 链接数学库 libm.so
gcc main.c -L./lib -lmylib -o app # -L 指定库目录

# 动态库 vs 静态库链接
gcc main.c -lhello -o dyn         # 默认动态链接 libhello.so
gcc main.c -static -lhello -o st  # 静态链接

# 查看生成的符号信息
file app                          # 查看可执行文件类型
nm app | head                     # 查看符号表
ldd app                           # 查看依赖的动态库`,
};

const dev2 = {
  id: 'ld-make',
  title: '2. 构建系统入门：Makefile',
  category: '构建',
  version: '4.x',
  level: '入门',
  summary: '用 Makefile 自动化编译：目标/依赖/规则、变量、自动变量与增量构建。',
  detail: [
    'Make 遵循规则 "目标: 依赖" + 缩进 Tab 开头的命令，当依赖比目标新时才重新执行命令（增量构建）。',
    '核心价值：只重新编译改动的文件，链接不变的部分，大幅节省大型项目编译时间。',
    '自动变量：$@ 目标、$^ 所有依赖、$< 第一个依赖；配合 %.o: %.c 通配规则可写很简洁的 Makefile。',
    '变量声明：CC=gcc、CFLAGS=-Wall -g；用 $(CC) $(CFLAGS) 引用。',
    '常用特殊目标：.PHONY 声明伪目标（clean/install 不生成文件），防止与同名文件冲突。',
    '现代大型项目多用 CMake/Meson 生成 Makefile，但读懂 Makefile 仍是排查构建问题的基础。',
  ],
  notes: [
    'Makefile 中的命令行必须以 Tab 开头，空格会报 "missing separator"——最常见的坑。',
    'clean 应声明为 .PHONY，否则若目录里恰好有名为 clean 的文件会导致目标恒被认为"已最新"。',
  ],
  example: `# 简单 Makefile
# 内容保存为 Makefile 后执行 make
hello: hello.o
	gcc hello.o -o hello

hello.o: hello.c
	gcc -c hello.c -o hello.o

clean:
	rm -f hello hello.o

# 用法
make          # 构建 hello
make clean    # 清理`,
  example2: `# 用变量 + 自动变量美化
CC      = gcc
CFLAGS  = -Wall -Wextra -g

program: main.o util.o
	$(CC) $^ -o $@

main.o: main.c util.h
	$(CC) $(CFLAGS) -c $< -o $@

util.o: util.c util.h
	$(CC) $(CFLAGS) -c $< -o $@

.PHONY: clean
clean:
	rm -f *.o program`,
  example3: `# 通配规则: 自动编译所有 .c
CC      = gcc
CFLAGS  = -Wall -std=c11
OBJS    = $(patsubst %.c, %.o, $(wildcard *.c))

program: $(OBJS)
	$(CC) $^ -o $@

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

.PHONY: clean
clean:
	rm -f *.o program

# 查看 make 实际执行的命令(调试用)
make -n        # 只打印不执行
make -B        # 强制全部重新编译`,
};

const dev3 = {
  id: 'ld-cmake',
  title: '3. 现代构建：CMake 入门',
  category: '构建',
  version: '3.x',
  level: '中阶',
  summary: '用 CMake 描述构建逻辑并生成跨平台构建系统；配置、目标、目录与安装。',
  detail: [
    'CMake 是跨平台的构建系统生成器：写一份 CMakeLists.txt，可生成 Makefile、Ninja 或 IDE 工程。',
    '流程：cmake 配置(生成构建文件) -> cmake --build 构建；建议在独立 build/ 目录配置以保持源码干净。',
    '基础命令：cmake_minimum_required、project、add_executable、add_library、target_link_libraries。',
    'target_include_directories 管理头文件搜索路径；现代 CMake 提倡"target-based"而非全局 include_directories。',
    'add_subdirectory 组织多模块；install 安装规则；CTest 内置测试、CPack 打包。',
    '跨平台：在 Linux 上还能通过工具链文件交叉编译到嵌入式平台，是大型 C/C++ 项目的事实标准。',
  ],
  notes: [
    'CMake 3.16+ 推荐 cmake --build build 而不是直接 make，因为它自动适配生成器。',
    '改 CMakeLists 后重新运行 cmake 配置即可，构建系统会自动检测变化。',
  ],
  example: `# CMakeLists.txt
cmake_minimum_required(VERSION 3.16)
project(MyApp C)

add_executable(myapp main.c util.c)
target_include_directories(myapp PRIVATE include)

# 在命令行
mkdir build && cd build
cmake ..                    # 配置, 默认生成 Makefile
cmake --build .             # 构建
./myapp`,
  example2: `# 带库与依赖的 C++ 项目
cmake_minimum_required(VERSION 3.16)
project(Server CXX)

add_executable(server src/main.cpp)

# 链接系统库
target_link_libraries(server pthread)

# 静态库目标
add_library(utils STATIC src/utils.cpp)
target_include_directories(utils PUBLIC include)
target_link_libraries(server PRIVATE utils)

# 编译选项
target_compile_options(server PRIVATE -Wall -Wextra -O2)`,
  example3: `# release/debug 双构建(推荐工作流)
# Debug 版
cmake -S . -B build-debug -DCMAKE_BUILD_TYPE=Debug
cmake --build build-debug
# Release 版
cmake -S . -B build-release -DCMAKE_BUILD_TYPE=Release
cmake --build build-release

# 安装到系统目录
cmake --install build-release --prefix /usr/local

# 查看/清理
ls build/
rm -rf build/     # 删掉重来即可, 源码不受影响`,
};

const dev4 = {
  id: 'ld-gdb',
  title: '4. 调试神器：GDB 入门',
  category: '调试',
  version: '12.x',
  level: '中阶',
  summary: '用 GDB 定位崩溃与逻辑错误：运行、断点、单步、查看变量与反汇编。',
  detail: [
    '调试前编译要加 -g（生成调试信息），否则 GDB 看不到源码行号与变量名。',
    '启动三方式：gdb ./prog、gdb ./prog core（分析崩溃转储）、gdb --args ./prog argc argv。',
    '常用断点：break 函数名 / break 文件名:行号；info break 查看；delete 删除。',
    '单步：next(n) 步过、step(s) 步入、finish 跑完当前函数；print(p) 打印变量、bt 查看调用栈。',
    'run(r) 开始运行、continue(c) 继续到下一断点、list 查看附近源码。',
    'core dump：崩了恢复正常要 ulimit -c unlimited 才能生成 core 文件，配合 gdb 分析崩溃现场。',
  ],
  notes: [
    '遇到段错误(Segmentation fault)：先 gdb，run 后 bt 看栈顶就是崩溃位置，省去猜。',
    '编译优化信息可能让单步"跳来跳去"，调试时建议用 -O0。',
  ],
  example: `# 准备: 编译带调试信息
gcc -g bug.c -o bug

# 启动调试
gdb ./bug
# 进入交互后:
(gdb) break main
(gdb) run
(gdb) next
(gdb) print i          # 查看变量 i
(gdb) list             # 查看附近源码
(gdb) quit`,
  example2: `# 崩溃现场分析(段错误)
$ gcc -g crash.c -o crash
$ ./crash
Segmentation fault (core dumped)

$ gdb ./crash core        # 用 core 文件
(gdb) run                 # 或直接复现
(gdb) bt                  # 调用栈, 最上面是崩溃处
#0 0x... in func at crash.c:12
(gdb) frame 0             # 切到崩溃帧
(gdb) print p             # 看指针 p 是否为非法地址`,
  example3: `# 条件断点 + 观察点 + 命令行一次调用
# 条件断点: 只有当 i==100 时才停
(gdb) break crash.c:5 if i == 100

# 观察点: 变量被修改就停
(gdb) watch total

# 非交互式: 把命令写进脚本
cat > gdb.cmd <<'EOF'
break main
run
bt
print x
quit
EOF
gdb -batch -x gdb.cmd ./prog`,
};

const dev5 = {
  id: 'ld-edit',
  title: '5. 编辑器与终端工作流：vim / tmux',
  category: '工具',
  version: '9.x',
  level: '入门',
  summary: '在 Linux 服务器上高效编辑与多任务：vim 核心操作与 tmux 会话管理。',
  detail: [
    'vim 是任意 Linux 环境都存在的编辑器，模式核心：普通模式(浏览/命令)、插入模式(输入)、命令模式(命令)。',
    '普通模式初心记忆：i 进入插入、w 跳单词、dd 删行、yy 复制、p 粘贴、:w 存、:q 退、:q! 强制退。',
    '搜索 / 向前、? 向后、n 下一个；替换 :%s/旧/新/g；多文件 :e、:bn 切换。',
    'tmux 是终端复用器：会话(session)-窗口(window)-窗格(pane) 三级，SSH 断开后进程继续跑。',
    'tmux 常配合场景：长时间编译、分屏开发(左代码右终端)、远程协作。',
    '组合拳：开发时 vim 编辑 + tmux 跑/切换进程，是工程师日常最高效形态之一。',
  ],
  notes: [
    '按 Esc 回到普通模式再输入命令，是新手最常见的困惑点。',
    'tmux 前缀键默认 Ctrl+b：Ctrl+b d 脱离会话，tmux attach 恢复，进程不中断。',
  ],
  example: `# vim 打开/编辑
vim hello.c
# 普通模式:
#   i       进入插入模式
#   Esc     回到普通模式
#   :w      保存
#   :q      退出
#   :wq     保存并退出
#   dd      删除当前行
#   yy      复制当前行
#   p       粘贴
vim hello.c             # 打开文件编辑`, 
  example2: `# vim 进阶
# 快速跳转
gg        # 到文件开头
G         # 到文件末尾
0         # 到行首
$         # 到行尾
# 搜索
/foo      # 向前搜索 foo, n 下一个
:%s/foo/bar/g   # 全文替换
# 多文件
:e other.c        # 打开另一文件
:bn               # 下一个缓冲区
:q                # 关闭当前`,
  example3: `# tmux 会话管理
tmux new -s dev          # 新建名为 dev 的会话
tmux ls                  # 列出会话
tmux attach -t dev       # 重新附着

# 会话内
Ctrl+b d                 # 脱离(进程继续)
Ctrl+b c                 # 新窗口
Ctrl+b %                 # 左右分屏
Ctrl+b "                 # 上下分屏
Ctrl+b 0..9              # 切窗口
Ctrl+b x                 # 关闭当前窗格

# 场景: 远程编译不想断
# tmux new -s build
# ./long_build.sh
# Ctrl+b d
# 过会 attach 看结果`,
};

if (typeof module !== 'undefined') module.exports = { dev1, dev2, dev3, dev4, dev5 };