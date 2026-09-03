// 逆向工程基础 6–10：动态分析与破解入门
const rev6 = {
  id: 'rev-gdb-dynamic',
  title: '6. GDB 动态分析进阶',
  category: '动态分析',
  version: 'GDB',
  level: '中阶',
  summary: '在运行时观察与操纵程序：寄存器、内存、断点、修改执行流，把"代码在干嘛"看清。',
  detail: [
    '动态分析=把程序跑起来观察，与静态分析互补；GDB 是 Linux 动态调试的瑞士军刀。',
    '基础回顾：break 函数/地址、run、next/step、continue、print、x/内存、bt 调用栈、info registers。',
    '关键逆向操作：x/$rsp 看栈顶、info register rip 看下一条指令、stepi(单步指令)或 si 配合 objdump 逐条看汇编执行。',
    '改执行流是"破解级"操作：set $rip=某地址 或 改寄存器/标志位(如 $eflags 的 ZF) 来绕过条件判断。',
    '在断点执行命令：commands 断点; 命令; end，可自动打印寄存器或改值，适合自动化分析。',
    '观察点 watch expr 在变量被读写时停下；硬件断点 hbreak 对内存修改检测很有用。',
  ],
  notes: [
    '被调试程序的代码尽量 -O0 -g 编译，否则寄存器复用让逆向更难；现实是往往没有调试信息，要用"反汇编+断点地址"。',
    '改寄存器只影响当次进程状态，不改二进制文件(那是"补丁"范畴)。',
  ],
  example:
    '# 以调试视角跑一个程序\n' +
    'gdb -q ./target\n' +
    '(gdb) info functions          # 列出函数(有符号时)\n' +
    '(gdb) disassemble main        # 反汇编 main\n' +
    '(gdb) break main              # 在 main 入口断\n' +
    '(gdb) run                     # 跑到 main\n' +
    '(gdb) info registers rip rsp rbp   # 关键寄存器\n' +
    '(gdb) x/10i $rip              # 显示接下来 10 条指令\n' +
    '(gdb) stepi                   # 单步一条指令\n' +
    '(gdb) x/8gx $rsp              # 看栈顶 8 个 qword',
  example2:
    '# 在断点处自动打印/改值\n' +
    '(gdb) break *0x401234\n' +
    '(gdb) commands\n' +
    '> set $rax = 1                # 篡改返回值\n' +
    '> printf "hit 0x401234, eflags=0x%x\\n",$eflags\n' +
    '> continue\n' +
    '> end\n' +
    '(gdb) run\n\n' +
    '# 观察点：某地址被写入就停\n' +
    '(gdb) watch *(unsigned long*)0x404000\n' +
    '(gdb) continue',
  example3:
    '# 无源码、无符号时的定位流程\n' +
    'gdb -q ./target\n' +
    '(gdb) start                  # 停在程序入口\n' +
    '(gdb) x/20i $rip             # 从入口开始看指令\n' +
    '(gdb) break *<main地址>      # 用外部 objdump 查到的地址\n' +
    '(gdb) run\n' +
    '(gdb) info registers rax rdi rsi   # 看参数/返回值\n' +
    '# 结合 strings 找到的字符串, 在引用处下断, 观察输入读取',
};

const rev7 = {
  id: 'rev-stack-calling',
  title: '7. 堆栈与调用约定',
  category: '基石',
  version: 'x86-64',
  level: '中阶',
  summary: '搞清参数如何传递、栈帧如何建立与销毁，逆向任何函数就都读得懂。',
  detail: [
    '调用约定(Calling Convention)规定参数怎么传：SysV AMD64(Linux/Unix)前 6 个整型参数用 RDI/RSI/RDX/RCX/R8/R9，浮点在 XMM0-7，多的压栈，返回值放 RAX(整型)/XMM0(浮点)。',
    'Windows x64 调用约定：前 4 个整型参数 RCX/RDX/R8/R9，且调用者需在栈上预留 32 字节 shadow space。',
    '栈帧(Stack Frame)是函数在栈上的一块私有区域：进入时 sub rsp,N 腾空间/保存 rbp，退出时 add rsp,N / ret。',
    '固定序言：push rbp; mov rbp,rsp 是老编译器常见；优化后多用"直接 sub rsp"甚至不建帧(frame pointer omission)。',
    '理解了约定，逆向时看 call 之前的 mov edi/esi... 就是在传参数；看 clobber 哪些寄存器就知函数签名大致形态。',
    'cdecl(32 位 Unix) 参数全压栈、由调用者清理；stdcall(Windows 32 位)由被调用者清理——逆向老 PE 要分辨。',
  ],
  notes: [
    '看一个函数"读哪个寄存器、把它当参数用"就能推断它大概接几个参数。',
    'RBP 常被优化器当作通用寄存器使用，此时栈帧识别要靠"返回地址在 RSP 上方"。',
  ],
  example:
    '# 观察 SysV 参数传递\n' +
    '# f.c:\n' +
    '# long f(long a,long b,long c,long d,long e,long f){\n' +
    '#   return a+b+c+d+e+f; }\n' +
    'gcc -O0 -g f.c -o f\n' +
    'objdump -d -M intel f | grep -A10 "<f>:"\n' +
    '# 调用处往往有:\n' +
    '#   mov edi,1   ; a -> rdi\n' +
    '#   mov esi,2   ; b -> rsi\n' +
    '#   mov edx,3   ; c -> rdx\n' +
    '#   ...         ; 第7个参数 push 到栈',
  example2:
    '# GDB 里看参数与返回\n' +
    'gdb -q ./f\n' +
    '(gdb) break f\n' +
    '(gdb) run\n' +
    '(gdb) info registers rdi rsi rdx rcx r8 r9   # 看传入的参数\n' +
    '(gdb) p/x $rdi\n' +
    '# 单步到 ret 前看返回值\n' +
    '(gdb) stepi\n' +
    '(gdb) p $rax',
  example3:
    '# 帧指针 vs 优化代码\n' +
    '# 编译两个版本对照\n' +
    'gcc -O0 -g f.c -o f_fp\n' +
    'gcc -O2 -g f.c -o f_opt\n\n' +
    'objdump -d -M intel f_fp  | grep -A4 "<f>:"   # 有 push rbp; mov rbp,rsp\n' +
    'objdump -d -M intel f_opt | grep -A4 "<f>:"   # 无帧指针, 直接 lea/计算\n' +
    '# 结论: 别依赖固定模板, 用"返回地址+RSP"锚定栈帧边界更可靠',
};

const rev8 = {
  id: 'rev-patterns',
  title: '8. 反汇编模式识别',
  category: '静态分析',
  version: 'x86',
  level: '中阶',
  summary: '把常见 C 结构在汇编里的"长相"记住：if/else、循环、switch、strcmp 验证、数学运算。',
  detail: [
    '逆向速度取决于"模式识别的肌肉记忆"：看到几行汇编立刻认出是 if 还是循环还是函数调用。',
    '条件分支(if/else)：cmp/测试 + 条件跳转，随后一个是 then 一个是 else/(跳过)。',
    '循环：一个"比较+条件跳回(look-back)"的环；-O2 常改写成 do-while(branch inversion)。',
    'switch：编译器可能生成跳转表(jump table)——.rodata 里一串目标地址，按索引跳转。',
    '字符串比较验证(strcmp/strncmp/memcmp)：调用后 测试 eax + je/jne，是最常见的授权/口令校验点。',
    '识别序列化调用约定：连续多次 call 且每次参数仅部分变化(如 matrix 运算、结构体数组循环)是循环展开或数组遍历。',
  ],
  notes: [
    '看到 call 后接 test eax,eax; jz/jnz 就猜"返回值被当布尔判断"。',
    '跳转表识别：指令是 jmp qword ptr [rax*8+表基址]，表在 .rodata, 常伴 index 边界检查。',
  ],
  example:
    '# if/else 的汇编长相\n' +
    '# g.c: int g(int x){ if(x>0) return 1; else return -1; }\n' +
    'gcc -O1 -g g.c -o g\n' +
    'objdump -d -M intel g | grep -A6 "<g>:"\n' +
    '#   test edi,edi      ; x>0?\n' +
    '#   jle .L2           ; 若 <=0 跳到 else\n' +
    '#   mov eax,1\n' +
    '#   ret\n' +
    '# .L2: mov eax,-1\n' +
    '#   ret\n' +
    '# 钥匙: 条件跳转两个方向 = 两个分支',
  example2:
    '# switch -> 跳转表\n' +
    '# sw.c: int sw(int x){ switch(x){\n' +
    '#        case 1:return 11;case 2:return 22;case 3:return 33;\n' +
    '#        default:return 0;} }\n' +
    'gcc -O1 -g sw.c -o sw\n' +
    'objdump -d -M intel sw | grep -A15 "<sw>:"\n' +
    '# 看是否有 jmp qword ptr [rax*8+0x40...](跳转表)\n' +
    'readelf -S ./sw | grep rodata',
  example3:
    '# 验证逻辑定位练习\n' +
    '# 目标: 找到类似 check 函数里的 strcmp\n' +
    'objdump -d -M intel target | grep -i "strcmp\\|memcmp" \n' +
    '# 记录其调用地址\n\n' +
    '# 逆着看调用参数:\n' +
    '#   lea rdi,[rip+0x2000]  ; 可能压入已知字符串(用户输入缓冲)\n' +
    '#   lea rsi,[rip+0x3000]  ; 可能压入正确答案/硬编码串\n' +
    '#   call strcmp@plt\n' +
    '#   test eax,eax\n' +
    '#   je  success_path      ; 相等才成功\n' +
    '# 这种"硬编码串 vs 输入"的模式一抓一个准',
};

const rev9 = {
  id: 'rev-strings-xref',
  title: '9. 字符串定位与交叉引用',
  category: '静态分析',
  version: 'Ghidra',
  level: '中阶',
  summary: '字符串是逆向的"路标"：定位字符串、找它的交叉引用(xref)，双向定位关键逻辑。',
  detail: [
    '程序提示文案、错误信息、名称、路径几乎都以可读字符串存在，是理解程序行为最直接的线索。',
    '字符串在 ELF 里集中放 .rodata 段，在 PE 里常放 .rdata；GNU binutils 有 .strtab(符号等)与 .rodata 分开。',
    '交叉引用(Xref)：一条字符串被哪条指令/哪个函数引用；"输入->字符串->被比较->分支"是最常见逆向主线。',
    '无 GUI 时手工找 xref：objdump 里 grep "%rip+<偏移>" 或字符串地址，回看周围的 lea+call。',
    'Ghidra/IDA 一键列出 xref，自动标注调用者——学逆向强烈建议尽早会用 Ghidra(免费)。',
    '技巧：字符串常被 printf/puts 输出，往"哪个函数 push 它的地址"就是引用点。',
  ],
  notes: [
    '先 strings 拿到"可疑串"，再逆推谁引用它，通常直逼核心校验。',
    '同一地址可能被多处引用；看"把字符串当前提/参数/比较项"的引用更关键。',
  ],
  example:
    '# 抽取并定位字符串的文件偏移\n' +
    'strings -tx ./target | grep -i "login\\|password\\|incorrect\\|welcome"\n' +
    '#  0x2010 Login required\n' +
    '#  0x2034 Incorrect password\n' +
    '# 用偏移在反汇编里找引用(模糊手工法)\n' +
    'objdump -d -M intel ./target | grep "0x2010\\|0x2034"',
  example2:
    '# 快速在反汇编里找某串地址的引用\n' +
    'addr=$(strings -tx ./target | grep "Incorrect password" | awk \'{print "0x"$1}\')\n' +
    'echo "目标串地址: $addr"\n' +
    'objdump -d -M intel ./target | grep -i "$addr" | head\n' +
    '# 看到 lea rdi,[rip+...]; call ... 即引用点',
  example3:
    '# Ghidra 交叉引用(免费逆向神器)\n' +
    '# 1) 导入样本: File -> Import File\n' +
    '# 2) Window -> Defined Strings(或搜索字符串)\n' +
    '# 3) 对 "Incorrect password" 双击进 Data,\n' +
    '#    右键 -> References -> Show References To\n' +
    '# 4) 跳到引用指令, 自动看到 strcmp 与上面分支\n' +
    '# 5) 在比较指令右键 -> Patch 或改 jne->je 完成破解\n' +
    '# 命令行也可 ghidraRun + 项目脚本或 IDA 命令行:\n' +
    '# idat64 -A 命令行批处理可自动化 xref 提取',
};

const rev10 = {
  id: 'rev-patch-crackme',
  title: '10. 简单补丁：绕过验证逻辑',
  category: '破解实战',
  version: 'x86',
  level: '中阶',
  summary: '合法地练习"补丁"：定位关键跳转，用字节级修改让验证恒通过，适用于自己/CTF 样本分析。',
  detail: [
    '补丁(Patching)=直接修改可执行文件的字节，改变程序行为。最基础的一类是"改跳转"：把失败分支改成成功分支。',
    '定位思路：找到比较(strcmp/数学校验)处的条件跳转 jne/jz，若"相等才成功"就把 jne 改成 je(逻辑取反)，或用 nop 填满恒不跳。',
    '指令字节速记：0x74 je、0x75 jne、0x74 与 0x75 就差最后一位(8-bit 短跳转)；0xE9 32位相对 jmp、0xEB 短 jmp、0x90 nop。',
    '工具：Radare2 的 we/wa、Ghidra 的 Patch Instruction、Python 直接改文件字节；改完用导出工具/重新组装。',
    '重要边界：此技能用于 你拥有/授权分析的程序、CTF crackmes、安全研究；非法破解商业软件/规避版权保护不在本课程支持范围。',
    '完整流程：备份 -> 定位跳转 -> 看目标字节 -> 翻转/置 nop -> 覆盖文件 -> 重跑验证。',
  ],
  notes: [
    '短跳转只是把目标地址相对偏移改 0x01；长跳转(E9)则需重算相对偏移。',
    '改之前先 objdump 记录原字节, 便于回滚; 样本都该在隔离/虚拟环境分析。',
  ],
  example:
    '# 定位校验跳转(以 CrackMe/CTF 样本为例)\n' +
    'objdump -d -M intel ./crackme | grep -B1 -A3 "strcmp"\n' +
    '#   4011d6: call 401050 <strcmp@plt>\n' +
    '#   4011db: test eax,eax\n' +
    '#   4011dd: je   4011f0        ; 相等才走成功分支\n' +
    '#   (成功分支在 4011f0)\n' +
    '# 要让"任何输入都成功": 把 je 改成 jmp(短跳转字节 0x74->0xEB 即可到达同一目标)',
  example2:
    '# 用 Python 直接打补丁(翻转短跳转)\n' +
    '# 偏移来自 objdump 对应 file offset(非 VMA)\n' +
    'import shutil\n' +
    'src=open("crackme","rb").read()\n' +
    'patch_offset=0x1fdd      # 举例, 实际是"je 指令"的文件偏移\n' +
    'src2=bytearray(src)\n' +
    'src2[patch_offset]=0x74 ^ 0x01   # 0x75 jne(翻转)或直接 0x90 nop\n' +
    'open("crackme_patched","wb").write(bytes(src2))\n' +
    'os.chmod("crackme_patched",0o755)',
  example3:
    '# 用 Radare2 交互式打补丁(GUI 也可用 Ghidra)\n' +
    '# 定位到 4011dd(je)\n' +
    'r2 -w ./crackme            # -w 写模式打开\n' +
    '[0x...]> s 0x4011dd\n' +
    '[0x...]> pd 3              # 反汇编看三条\n' +
    '[0x...]> wa jmp 0x4011f0   # 改写为 jmp(永不失败)\n' +
    '[0x...]> wx 90 @ 0x4011dd  # 或把 je 填成 nop\n' +
    '[0x...]> q\n' +
    './crackme_patched         # 运行验证\n' +
    '# 提醒: 只对你有权分析的样本/CTF/教学样本进行',
};

if (typeof module !== 'undefined') module.exports = { rev6, rev7, rev8, rev9, rev10 };