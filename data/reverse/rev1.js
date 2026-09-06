// 逆向工程基础 1–5：二进制与汇编基石
const rev1 = {
  id: 'rev-binary-fundamentals',
  title: '1. 二进制与内存模型基础',
  category: '基石',
  version: 'x86/ARM',
  level: '入门',
  summary: '把程序还原成机器能懂的东西：数制、字节序、内存布局、寄存器的第一性认知。',
  detail: [
    '逆向的第一步是"以机器的视角看程序"：一切最终都是二进制字节流。任何工具(Ghidra/IDA/GDB)都只是把这串字节翻译回人类可读形式。',
    '数制要点：十六进制(0x)是二进制的缩写(1 位十六进制=4 位二进制)，日常逆向几乎全程用十六进制。0xFF=11111111=255。',
    '字节序(Endianness)：x86/x64 是小端(Little-endian)，即数值的低位字节存在低地址。x86 里 0x12345678 在内存里实际是 78 56 34 12。ARM 默认小端也支持大端。',
    '内存布局：典型进程地址空间从低到高依次是 代码段(.text)、只读数据(.rodata)、已初始化/未初始化数据(.data/.bss)、堆(向上增长)、栈(向下增长)、共享库、内核映射(高地址)。',
    '寄存器是 CPU 里的高速暂存单元：x64 中 RAX(累加/返回值)、RBX、RCX、RDX、RSI/RDI(源/目标)、RBP(栈基址)、RSP(栈顶)、RIP(指令指针，指向下一条要执行的指令)。',
    '理解"指令即数据"：同一段字节既可当代码也可当数据，逆向中判断边界与交叉引用是核心难点。',
  ],
  notes: [
    '学逆向最先克服的是"看到十六进制就头大"——先习惯把字节译成可读信息，再谈工具。',
    '务必分清"值"与"它在内存中的字节排布"：数值 0x1234 在文件里的字节可能是 34 12(小端)。',
  ],
  example:
    '# 用 xxd 查看一个文件/可执行文件的字节\n' +
    'xxd hello | head\n' +
    '# 00000000: 7f45 4c46 0201 0100 0000 0000 ...\n' +
    '# 注意开头 7f 45 4c 46 = \\x7f"ELF" 是 ELF 魔数\n\n' +
    '# 用 od 以十六进制十进制查看\n' +
    'echo -n "AB" | od -An -tx1        # 41 42\n' +
    'echo -n "AB" | od -An -td1        # 65 66\n\n' +
    '# 小端观察：写入 4 字节看内存顺序\n' +
    '# python3 -c 打包一个无符号4字节整数再以字节看\n' +
    'python3 -c "import struct; print(struct.pack(\\"<I\\", 0x12345678))" | xxd\n' +
    '# 输出 78 56 34 12 —— 低位在前(小端)',
  example2:
    '# 查看一个 ELF 可执行文件的内存布局(节表)\n' +
    'readelf -S ./hello\n' +
    '# 观察 .text / .rodata / .data / .bss 的地址与大小\n\n' +
    '# 查看各个段权限与大小\n' +
    'readelf -l ./hello\n' +
    '# LOAD 段: 读/写/执行(可) 标志说明了内存保护\n\n' +
    '# 进程的虚拟地址分布\n' +
    'cat /proc/self/maps | head\n' +
    '# 看每一行: 起始-结束地址 权限 映射文件',
  example3:
    '# 用 C 看栈、堆、静态区的地址趋势\n' +
    '# addr.c:\n' +
    '# int g1; int g2=1; char *hp;\n' +
    '# int main(){\n' +
    '#   int local=0;\n' +
    '#   static int s=0;\n' +
    '#   char *p = malloc(16);\n' +
    '#   printf("stack  %p\\n", &local);\n' +
    '#   printf("bss    %p\\n", &g1);\n' +
    '#   printf("data   %p\\n", &g2);\n' +
    '#   printf("static %p\\n", &s);\n' +
    '#   printf("heap   %p\\n", p);\n' +
    '#   return 0; }\n' +
    '# gcc addr.c -o addr && ./addr\n' +
    '# 会看到: stack 高地址, 然后是 heap, 然后是低地址的静态区',
};

const rev2 = {
  id: 'rev-x86-asm',
  title: '2. x86/x64 汇编速成',
  category: '基石',
  version: 'x86-64',
  level: '入门',
  summary: 'Intel 语法为主快速过汇编：mov/add/sub、lea、call/ret、cmp/jmp 的条件跳转。',
  detail: [
    '汇编是把机器码写成助记符：每条指令一条助记符+操作数。逆向工程师至少要"会读汇编"。',
    '两种主流语法：AT&T(GNU objdump 默认，源在前如 mov $1,%rax)与 Intel(objdump -M intel / IDA/Ghidra 默认，目标在前如 mov rax,1)。建议日常用 Intel 语法。',
    '数据搬运：mov dst,src。lea src是"计算地址并放入"：lea rax,[rbx+8] 常用于指针/数组索引计算，比 add 更灵活。',
    '算术逻辑：add/sub/imul/div、and/or/xor/not/shl/shr；xor rax,rax 是清零惯用法(比 mov rax,0 短)。',
    '控制流：call 调用(把返回地址压栈并跳转)、ret 返回(弹出到 RIP)、cmp 比较(设置标志位)、je/jne/jg/jl(依据标志跳转)。',
    '栈操作：push 压栈、pop 出栈；函数序言(sub rsp,N + 保存 rbp)与尾声是逆向识别函数边界的锚点。',
  ],
  notes: [
    '读汇编时先看"数据流向"：mov/call/lea 谁写到谁，比背每条指令更快。',
    'cmp 的比较方向：cmp eax, 5 依据减法 eax-5 置标志，所以 je 表示"相等时跳"。',
  ],
  example:
    '# 用 objdump 反汇编看已编译的 C 函数\n' +
    '# 先写源文件 sum.c:\n' +
    '# int add(int a,int b){ return a+b; }\n' +
    '# int main(){ return add(3,4); }\n' +
    'gcc -O0 -g sum.c -o sum\n\n' +
    '# Intel 语法反汇编\n' +
    'objdump -d -M intel sum | grep -A5 "<add>:"\n' +
    '# push rbp\n' +
    '# mov rbp,rsp\n' +
    '# mov DWORD PTR [rbp-4],edi   ; 参数1\n' +
    '# mov DWORD PTR [rbp-8],esi   ; 参数2\n' +
    '# mov eax,DWORD PTR [rbp-4]\n' +
    '# add eax,DWORD PTR [rbp-8]   ; 结果到 eax\n' +
    '# pop rbp\n' +
    '# ret',
  example2:
    '# 条件跳转的识别\n' +
    '# max.c:\n' +
    '# int max(int a,int b){ return a>b?a:b; }\n' +
    'gcc -O1 -g max.c -o max\n' +
    'objdump -d -M intel max | grep -A8 "<max>:"\n' +
    '# mov eax,edi\n' +
    '# cmp edi,esi\n' +
    '# jg .L1         ; 若 a>b 跳到 .L1\n' +
    '# mov eax,esi\n' +
    '# .L1:\n' +
    '# ret\n' +
    '# 重点: 三地址比较 -> cmp; jg; 用参数寄存器 edi/esi 传参(调用约定)',
  example3:
    '# 读一段循环\n' +
    '# loop.c:\n' +
    '# int sum(int n){ int s=0; for(int i=0;i<n;i++) s+=i; return s; }\n' +
    'gcc -O1 -g loop.c -o loop\n' +
    'objdump -d -M intel loop | grep -A20 "<sum>:"\n' +
    '# 观察: xor eax,eax (s=0)\n' +
    '#        xor edx,edx (i=0)\n' +
    '# .L:  cmp edx,edi (i<n?)\n' +
    '#      jge .end\n' +
    '#      add eax,edx (s+=i)\n' +
    '#      inc edx      (i++)\n' +
    '#      jmp .L\n' +
    '# .end: ret\n' +
    '# 钥匙: 认循环就是认"比较+条件跳回"的环',
};

const rev3 = {
  id: 'rev-elf',
  title: '3. ELF 文件格式剖析',
  category: '静态分析',
  version: 'ELF',
  level: '中阶',
  summary: 'Linux 可执行文件格式 ELF：魔数、节(section)与段(segment)、符号表，掌握 readelf。',
  detail: [
    'ELF 是 Linux 上可执行文件/共享库/目标文件的标准格式(Object/Executable/Shared)三兄弟共用结构。',
    '结构分三层：ELF 头(入口信息)、节头表(Section Header Table，链接视图)、程序头表(Program Header Table，加载视图)。',
    'ELF 头关键字段：e_ident(含魔数 0x7F"ELF"+位数+字节序)、e_type、e_machine、e_entry(入口点地址)。',
    '节(Section)是链接与调试视角：.text 代码、.data 数据、.rodata 只读、.symtab/.dynsym 符号表、.strtab 字符串表、.stab/.debug_* 调试信息。',
    '程序头(Segment)是加载视角：PT_LOAD 描述哪个范围映射到虚拟地址、具备何种权限(rwx)。编译器把多个节合并进少数几个段以优化页映射。',
    '逆向常用 readelf：-h 头、-S 节表、-l 程序头、-s 符号表、-r 重定位；配合 objdump -d 看指令、-s 看原始字节。',
  ],
  notes: [
    '看出入口地址用 readelf -h；想找所有可读字符串用 strings 命令。',
    'strip 后的二进制符号表被删，函数名只剩地址——逆向先从入口/交叉引用锚定。',
  ],
  example:
    '# ELF 头\n' +
    'readelf -h ./hello\n' +
    '#  Magic:   7f 45 4c 46 02 01 01 00 ...  (7f45 4c46=ELF, 02=64bit, 01=小端)\n' +
    '#  Class:   ELF64\n' +
    '#  Data:    2s complement (little endian)\n' +
    '#  Machine: x86-64\n' +
    '#  Entry point address: 0x401050\n\n' +
    '# 验证魔数(文件头几个字节)\n' +
    'xxd -l 16 ./hello',
  example2:
    '# 节表与段\n' +
    'readelf -S ./hello       # 看各节地址/大小/偏移\n' +
    'readelf -l ./hello       # 看程序头(加载段)与权限\n\n' +
    '# 找关键节\n' +
    'readelf -S ./hello | grep -E "\\.text|\\.rodata|\\.data"\n\n' +
    '# 符号表(未 strip 时有函数名)\n' +
    'readelf -s ./hello | grep FUNC\n' +
    '# 若显示 No symbols 说明被 strip\n\n' +
    '# 原始字节查看某一节\n' +
    'objdump -s -j .rodata ./hello',
  example3:
    '# 综合：分析一个未知 ELF\n' +
    'file ./sample                # 类型/架构/是否 strip/PIE\n' +
    'readelf -h ./sample | grep -E "Entry|Class|Machine"\n' +
    'strings ./sample | head -30  # 抓可读字符串(可能有提示/用户名)\n' +
    'objdump -d -M intel ./sample | head -60\n\n' +
    '# 查找 main 与字符串引用(交叉引用初体验)\n' +
    'grep -n "Input the" $(objdump -s -j .rodata ./sample > /dev/null; echo /dev/null) 2>/dev/null\n' +
    '# 实战中会用 Ghidra/IDA 自动做交叉引用,\n' +
    '# 但手牌工具 readelf/objdump/strings 足够起步',
};

const rev4 = {
  id: 'rev-pe',
  title: '4. PE 文件格式剖析',
  category: '静态分析',
  version: 'PE',
  level: '中阶',
  summary: 'Windows 可执行文件 PE：DOS 头、PE 头、节、导入/导出表，学会用工具解析。',
  detail: [
    'PE(Portable Executable)是 Windows 的 EXE/DLL/SYS 格式。结构：DOS 头(MZ 魔数+指向 PE 的偏移) -> DOS Stub -> PE 头 -> 可选头 -> 节表 -> 各节。',
    '关键定位：DOS 头 e_lfanew 字段(偏移 0x3C)给出 PE 头的文件偏移；PE 头以 "PE\\0\\0"(50 45 00 00) 开头。',
    '可选头(IMAGE_OPTIONAL_HEADER)含 AddressOfEntryPoint(入口)、ImageBase(默认基址 0x140000000)、SizeOfImage；数据目录表里最重要的是导入表(Import Table)与导出表(Export Table)。',
    '节(.text 代码/.data 数据/.rdata 只读/.rsrc 资源/.idata 导入)是基础；RVA(相对虚拟地址)= 文件偏移需要按节映射转换。',
    '导入表(Import)列出程序用了哪些 DLL 的哪些函数(如 kernel32.CreateFileA)，这是快速了解程序行为的捷径；导出表(Export)主要在 DLL。',
    '常用工具：objdump -p、dumpbin /headers //imports(GUI 用 PE-bear、CFF Explorer、Detect It Easy)。',
  ],
  notes: [
    'RVA + ImageBase = VA：如基址 0x140000000 + RVA 0x1000 = 虚拟地址 0x140001000。',
    '识别是否被加壳：入口在陌生节、导入表只有 LoadLibrary/GetProcAddress——多半是加壳程序。',
  ],
  example:
    '# 用 objdump 看 PE 头(在 Linux 上也能分析样本)\n' +
    'objdump -f myapp.exe\n' +
    '#   architecture: i386:x86-64\n' +
    '#   start address: 0x00000001400017e8\n' +
    'objdump -p myapp.exe | head -40\n' +
    '# 看 Machine / ImageBase / SectionAlignment 等\n\n' +
    '# 列出节\n' +
    'objdump -h myapp.exe\n' +
    '#  idx .text  .data  .rdata  .rsrc',
  example2:
    '# 查看 PE 的导入表(程序调用了什么)\n' +
    'objdump -p myapp.exe | grep -A30 "DLL Name"\n' +
    '#    DLL Name: KERNEL32.dll\n' +
    '#      vma: ... Import Address Table ... \n' +
    '#    DLL Name: USER32.dll  -> 疑似 GUI 程序\n' +
    '#    DLL Name: WS2_32.dll  -> 用到网络\n\n' +
    '# 看入口附近指令\n' +
    'objdump -d -M intel myapp.exe | head -30\n' +
    '# 若入口处是 pushad/pushf 或大段奇怪解密代码, 高度疑似加壳',
  example3:
    '# 在 Windows 上用工具(在 Windows PowerShell)\n' +
    '# dumpbin(随 VS 或 SDK)查看头\n' +
    'dumpbin /headers myapp.exe\n' +
    'dumpbin /imports myapp.exe\n\n' +
    '# 或 GUI: PE-bear (开源) 点击看各节/导入导出\n' +
    '# Detect It Easy (DIE): 自动识别加壳器/编译器\n\n' +
    '# 判断加壳的快速心法\n' +
    '#  1) 入口点不在 .text 而是在陌生节\n' +
    '#  2) 导入表极简(几乎只剩 LoadLibraryA/GetProcAddress)\n' +
    '#  3) 节名怪异(.UPX 等)\n' +
    '# 命中即先把样本送去沙箱/虚拟机\n' +
    '#   (始终在隔离环境分析未知样本)',
};

const rev5 = {
  id: 'rev-static-analysis',
  title: '5. 静态分析：objdump / readelf / strings / nm',
  category: '静态分析',
  version: 'Linux',
  level: '中阶',
  summary: '不动程序(不运行)地看代码与数据：命令组合、交叉引用基本功、找字符串与符号。',
  detail: [
    '静态分析的宗旨：在样本运行前就把能看的信息看尽，减少在恶意/陌生环境里执行的风险，也是 CTF 第一道工序。',
    '核心命令四件套：file 识别类型、readelf 看 ELF 结构、objdump 反汇编、strings 抽取字符串。',
    'strings 的威力：程序内的提示文案、路径、URL、密钥片段、功能模块名大多以可见字符串存在；-n 控制最小长度、-e 指定编码。',
    'objdump 反汇编：-d 反汇编可执行段、-M intel 用 Intel 语法、-j .text 指定节、-s 显示原始字节、--no-show-raw-insn 只留助记符更清爽。',
    'nm 列符号表(函数/全局变量)；交叉引用(xref)用来找"某字符串在哪被引用"，是找验证逻辑的关键——CLI 里通常用 objdump grep 字符串+周围指令，GUI 里 Ghidra/IDA 一键解决。',
    '分析流程建议：file -> strings -> readelf 结构 -> 定位 main/入口 -> 沿交叉引用追关键判断(比较/调用)。',
  ],
  notes: [
    '看 strings 输出要先过滤掉"看似库/框架"的噪音，聚焦"业务文案/判断提示"。',
    '比较字符串用 strcmp/strncmp 是最常见验证点，其后跟着条件跳转，改跳转即经典破解第一步。',
  ],
  example:
    '# 分类定级\n' +
    'file ./target\n' +
    '# target: ELF 64-bit ... not stripped   (未 strip, 符号完整)\n\n' +
    '# 抓字符串(找线索)\n' +
    'strings -n 6 ./target | head -40\n' +
    '# 注意是否有: password / Correct! / Wrong / secret \\n\n\n' +
    '# 列符号(函数清单)\n' +
    'nm ./target | grep " T "\n' +
    '# 00000000004011d6 T main\n' +
    '# 0000000000401290 T check_password',
  example2:
    '# 反汇编并圈定 main / 特定函数\n' +
    'objdump -d -M intel ./target | sed -n "/<main>:/,/^$/p"\n' +
    '# 沿调用看它 call 了谁(check_password / strcmp / gets)\n\n' +
    '# 在反汇编里找某个字符串的引用(粗糙交叉引用)\n' +
    'objdump -d -M intel ./target | grep -B3 "0x402010"  # 地址来自上一步 strings 定位\n\n' +
    '# 只看关键函数\n' +
    'objdump -d -M intel --disassemble=check_password ./target',
  example3:
    '# 把反汇编导出文件, 便于反复 grep\n' +
    'objdump -d -M intel ./target > /tmp/dis.txt\n' +
    'grep -n "strcmp\\|call.*check" /tmp/dis.txt\n\n' +
    '# 结合交叉引用推断逻辑\n' +
    '# 若 check_password 里看到:\n' +
    '#   lea rdi,[rip+0x...]   ; 压入某个地址(字符串)\n' +
    '#   call strcmp@plt       ; 比较\n' +
    '#   test eax,eax\n' +
    '#   jne ...               ; 不等就跳走 -> 验证失败分支\n' +
    '# 那么 [rip+..] 指向的很可能就是答案字符串/用户输入地址\n' +
    'strings -t x ./target | grep -i pass',
};

if (typeof module !== 'undefined') module.exports = { rev1, rev2, rev3, rev4, rev5 };