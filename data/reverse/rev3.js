// 逆向工程基础 11–15：反调试与脱壳
const rev11 = {
  id: 'rev-breakpoints',
  title: '11. 断点家族：软件/硬件/内存断点',
  category: '动态分析',
  version: 'GDB/x86',
  level: '中阶',
  summary: '软件断点(int3)、硬件断点(DR 寄存器)、内存断点(页保护)的原理与监视手法。',
  detail: [
    '断点是动态分析的支柱，理解其原理才知道"为什么在那停得住"以及如何被反调试检测。',
    '软件断点(int3)：把目标指令首个字节改写为 0xCC，CPU 执行到抛出软件中断并由调试器接管。GDB break 默认用 int3；代价是改了内存中的代码。',
    '硬件断点(DR0-DR3 调试寄存器)：不修改代码，由 CPU 直接比较指令/数据地址命中；数量少(x86 最多 4 个)但不可被内存篡改检测到，GDB 用 hbreak/rwatch。',
    '内存(数据)断点：开启页面对目标区域只读，写访问触发缺页异常，调试器借此监视"谁改了这块内存"。',
    '断点触发位置：函数入口、指令地址、数据写/读；在 GDB 用 break *地址、watch 数据、命令脚本联动。',
    '对逆向：高效断点放"函数入口+关键 call 之后"，配合寄存器 dump 立刻看到输入/中间结果。',
  ],
  notes: [
    '程序自身扫描 .text 是否有 0xCC 可检测软件断点(常见反调试)；硬件断点难抓、数量受限。',
    'int3 断点会导致 0xCC 出现在反汇编里(看起来像未知指令)，属正常。',
  ],
  example:
    '# GDB 断点类型\n' +
    'gdb -q ./target\n' +
    '(gdb) break main                    # 软件断点(默认)\n' +
    '(gdb) break *0x401234               # 按地址\n' +
    '(gdb) hbreak *0x401240              # 硬件断点(调试寄存器)\n' +
    '(gdb) watch *(int*)0x404000         # 内存(写)断点\n' +
    '(gdb) info break                    # 列出所有断点\n' +
    '(gdb) delete 2                      # 删除指定断点',
  example2:
    '# 观察 int3 对代码的篡改\n' +
    'gdb -q ./target\n' +
    '(gdb) break main\n' +
    '(gdb) x/3bx main        # 记录 main 处原始字节\n' +
    '(gdb) run\n' +
    '(gdb) x/3bx main        # 观察第一个字节是否变成 0xcc (被断点改写)\n' +
    '(gdb) continue          # 命中后 int3 会被恢复',
  example3:
    '# 条件断点 + 命中脚本(自动化采集)\n' +
    '(gdb) break check\n' +
    '(gdb) commands 1\n' +
    '> silent\n' +
    '> printf "check arg=%d\\n",$rdi\n' +
    '> continue\n' +
    '> end\n' +
    '(gdb) run\n' +
    '# 每次进入 check 都打印参数, 收集校验过程\n\n' +
    '# 逆地址断点的技巧: 从 objdump 拿地址, 用\n' +
    '# break *<addr>, 覆盖无符号 case',
};

const rev12 = {
  id: 'rev-antidebug',
  title: '12. 反调试技巧与绕过',
  category: '动态分析',
  version: 'x86',
  level: '高级',
  summary: '认识常见反调试手法(ptrace/isatty/时间/自检)与对应的合法绕过思路(用于 CTF/安全研究)。',
  detail: [
    '反调试(Anti-debug)用于拖延分析，常见手法集中在内核态检查与用户态自检；理解它们才能见招拆招。',
    'ptrace 检测：ptrace(PTRACE_TRACEME) 失败=已被调试(同一进程只能被一个 ptracer 追踪)。GDB 本身不撞这个，但 strace 会。',
    '父进程/环境：getppid 比对、读 /proc/self/status 的 TracerPid 是否非 0、/proc/self/maps 里是否有调试器痕迹。',
    '时序检测：rdtsc 测量代码片段执行时间，有单步断点会明显变慢；也检测 SIGTRAP/int3 残留。',
    '自我完整性：程序计算自己 .text 的校验和，若被 int3 改写(0xCC)或被打补丁则退出。',
    '绕过思路(合法研究/CTF)：patch 掉检测函数、模拟 ptrace 返回值、hook 时间函数、用硬件断点避免 int3 改写、或先脱壳再分析。',
  ],
  notes: [
    '一切反调试学习都要在 你有权分析/CTF/虚拟机隔离 的样本上进行，不用于绕过正版保护牟利。',
    '先"检测到反调试存在"比"绕过它"更重要：看程序何时异常退出、读哪些文件。',
  ],
  example:
    '# 观察调试器痕迹\n' +
    'cat /proc/self/status | grep -i tracer\n' +
    '# TracerPid:  0       (0=未被调试, 非0=被追踪)\n\n' +
    'grep -i "gdb\\|ptrace" /proc/self/maps\n' +
    '# 检测是否有 gdb 相关映射(粗略)\n\n' +
    '# 程序常读 /proc/self/status 做反调试, GDB 里可\n' +
    '(gdb) catch syscall openat\n' +
    '(gdb) continue\n' +
    '# 看到它读 /proc/self/status 即命中反调试逻辑',
  example2:
    '# 用 GDB 修改 TracerPid 相关检测(演示)\n' +
    '# 若程序把 TracerPid 非 0 就退出, 可在检测点\n' +
    '(gdb) break *0x401500      # 反调试函数入口\n' +
    '(gdb) run\n' +
    '(gdb) set $rax=0           # 伪造"无调试"返回值\n' +
    '(gdb) continue\n\n' +
    '# 或直接跳过整个检测函数\n' +
    '(gdb) jump *0x4015a0       # 跳到返回之后',
  example3:
    '# 常见反调试的检测点与速查\n' +
    '#  1) ptrace:         break ptrace / grep PTRACE\n' +
    '#  2) 时间:           break gettimeofday / rdtsc\n' +
    '#  3) TracerPid:      break open / fgets 读 /proc/self/status\n' +
    '#  4) int3 扫描:      break on 循环扫描 .text\n' +
    '#  5) 父进程名:       break getppid\n\n' +
    '# 实战武器: 用"不落地的硬件断点"避开 int3 检测\n' +
    '(gdb) hbreak check\n' +
    '(gdb) run\n' +
    '# Windows 上相同思路用 x64dbg 的 Hardware Breakpoint\n' +
    '# (对所有反调试样本: 先虚拟化隔离再动手)',
};

const rev13 = {
  id: 'rev-unpacking',
  title: '13. 加壳与脱壳基础（UPX）',
  category: '脱壳',
  version: 'UPX',
  level: '中阶',
  summary: '认识壳的运行原理：入口、内存解包与跳转到原始入口(OEP)，以 UPX 为例实践脱壳。',
  detail: [
    '壳(Packer)是把可执行文件压缩/加密的打包器：程序运行时先把原始代码解压到内存，再执行。目的是体积优化或保护。',
    '运行流程：原始 .text 被压缩，壳自带解压码(stub)，先把原代码解到内存、再把控制交给"原始入口点(Original Entry Point, OEP)"。',
    '识别壳：入口不在 .text、文件/节名特殊(.UPX0/.UPX1)、导入表极简、strings 里出现 packer 名。',
    '简单脱壳(UPX)：多数支持自解压——直接 upx -d 还原；不行则动态跟到 OEP 后 dump 内存。',
    '跟到 OEP 的心法：程序解完壳后的第一条指令常是跨节跳转(popad; jmp .text)，设内存断点或一次性断到"跳向原始代码"处。',
    '脱壳后做静态修复：重建导入表(IAT)需要专用工具(Scylla/impREC)或保持动态分析。',
  ],
  notes: [
    '脱壳只对你有权分析的样本/CTF/自己(或开源)程序合法；不用于绕过商业软件授权。',
    '余弦：很多现代壳是"虚拟化/加密保护"(如 VMProtect)，-d 不管用，需要资深分析。',
  ],
  example:
    '# 检测是否加壳\n' +
    'file ./packed\n' +
    '# ... UPX! ...   -> 直接说明是 UPX\n' +
    'readelf -S ./packed | grep -E "UPX|\.text"\n' +
    'readelf -h ./packed | grep Entry\n' +
    '# 入口若落在 UPX 节(而非 .text) => 加壳',
  example2:
    '# 用 upx 一键脱壳(压壳的配套还原)\n' +
    'upx -d ./packed -o ./unpacked\n' +
    'file ./unpacked\n' +
    '# 现在入口应回到 .text, 静态分析可用了\n' +
    'strings ./unpacked | head\n\n' +
    '# 若库不支持, 再用动态跟(见下)',
  example3:
    '# 手动跟到 OEP 的思路(GDB)\n' +
    'gdb -q ./packed_upx\n' +
    '(gdb) starti            # 停在入口(壳 stub)\n' +
    '(gdb) x/20i $rip        # 看 stub 指令\n' +
    '# 找"解完后跳向 .text"的 jmp(跨节)\n' +
    '# 例如 popad; ret 或 jmp 0x40x... \n' +
    '(gdb) b *<OEP候选地址>\n' +
    '(gdb) continue\n' +
    '(gdb) info registers rip   # 此时 RIP 已到 OEP, 原始代码在内存\n' +
    '# 之后可用 gcore 或由调试器 dump 内存\n' +
    '# (生产上结合 Scylla 重建 IAT)',
};

const rev14 = {
  id: 'rev-deobfuscation',
  title: '14. 混淆与反混淆基础',
  category: '反混淆',
  version: 'llvm',
  level: '高级',
  summary: '认识代码混淆(字符串加密/控制流平坦化/花指令)并练习系统化的去混淆思路。',
  detail: [
    '混淆(Obfuscation)让静态分析变难：把可读逻辑藏起来，常见于保护与恶意代码自保。',
    '字符串加密：明文串被加密存，运行时解密后使用；先去"解密循环"再在内存里看明文比硬看乱码有效。',
    '控制流平坦化(Control-Flow Flattening)：把 if/while 揉成一个大 switch，真实逻辑藏进复杂跳转；LLVM 版常见于收费保护。',
    '花指令(Junk code / Unreachable)：插入永不执行的垃圾指令，误导反汇编器与人工阅读。',
    '反混淆思路：动态跑起来看"解密后的真值"；用符号/污点执行工具；有耐心地手工还原数据流。',
    '工具：Ghidra/IDA 的脚本、angr(符号执行)、unicorn(模拟执行)、x64dbg 插件；先做"哪个是被混淆的"定位。',
  ],
  notes: [
    '反混淆是针对你有权研究的样本/CTF。目标是读明白逻辑，不是杀毒/规避。',
    '先动态抓明文，往往比硬啃静态混淆快得多(解密函数据实跑一遍就有真相)。',
  ],
  example:
    '# 观察字符串加密的典型形态\n' +
    'objdump -d -M intel ./obf | grep -i "xor\\b" | head\n' +
    '# 若看到大量"逐字节 xor"循环对 .rodata 处理,\n' +
    '# 极可能字符串加密: 先找到该解密函数\n\n' +
    'strings -n 6 ./obf | head -20\n' +
    '# 若几乎看不到有意义明文 => 高度混淆, 上动态',
  example2:
    '# 动态解密: 在解密函数执行后 dump 内存\n' +
    'gdb -q ./obf\n' +
    '(gdb) break <解密函数>        # 定位到解密某串的函数\n' +
    '(gdb) run\n' +
    '(gdb) finish                 # 跑完该函数\n' +
    '(gdb) x/s 0x4040f0           # 打印解密后的字符串(地址来自 rodata)\n' +
    '# 或 watch 目标地址, 解密写入时停下看新内容',
  example3:
    '# 用 emulation 提取解密串(示意)\n' +
    '# angr / unicorn 可在不上真机的情况下模拟执行解密函数\n' +
    'from angr import Project\n' +
    'p = Project("./obf", auto_load_libs=False)\n' +
    'state = p.factory.blank_state()\n' +
    'entry = 0x401000     # 解密函数地址\n' +
    'st = p.factory.call_state(entry)\n' +
    'sm  = p.factory.simulation_manager(st)\n' +
    '# 跑完后从结果状态 dump 目标内存/寄存器即可还原明文\n' +
    '# (在安装了 angr 的隔离环境运行)\n' +
    '# 原则: 混淆只是"藏", 解密后真相仍在内存/寄存器',
};

const rev15 = {
  id: 'rev-crypto',
  title: '15. 密码学逆向基础',
  category: '静态分析',
  version: 'openssl',
  level: '中阶',
  summary: '识别程序用到的加解密：找常量、找库调用，对比已知算法特征而不是从头破算法。',
  detail: [
    '逆向中极少需要"破解"加密算法——真正目标通常是识别算法、找到密钥/密文、或判断校验方式，而不是数学破解。',
    '识别法：查找知名算法常量/表(如 MD5/SHA 的魔法常量、AES 的 S-box 0x63..、CRC 表)、以及对已知库函数的调用(openssl/内置实现)。',
    '常见校验：MD5/SHA1/SHA256 哈希用于口令/文件校验；CRC 用于完整性；其"魔数常量"是识别指纹。',
    '换 XOR/ASCII 的自制校验常用固定 key 或逐字节 xor，可在内存里观察 key。',
    '工具：GDB/内存 dump 抓"加密前的输入/加密后的输出"从而推断；或识别后直接调同库复算。',
    '实践流程：定位 hash/compare 调用 -> 确认算法(比对常量) -> 提取输入/密钥 -> 验证(用 openssl/脚本复算)。',
  ],
  notes: [
    '认清目标：多数是"口令校验/完整性"，不是要破真实密码学，别钻牛角尖。',
    '安全提醒：本册用于分析自己/授权/CTF 样本的校验逻辑，不用于骗取他人凭据。',
  ],
  example:
    '# 识别常见哈希的魔法常量\n' +
    'objdump -s -j .rodata ./target | grep -i "01234567\\|89abcdef"\n' +
    '# MD5 初值 A=0x67452301, B=0xefcdab89...\n' +
    '# SHA-1: 0x67452301 0xEFCDAB89 0x98BADCFE 0x10325476 0xC3D2E1F0\n' +
    '# 在小端下按字节序列 grep 更易命中',
  example2:
    '# 追踪口令校验\n' +
    'objdump -d -M intel ./target | grep -E "call.*(md5|sha|hash|crc)" \n' +
    '# 找到校验函数调用; 反向看它接收什么\n\n' +
    '# 在调用处下断, 把输入与输出都抓出来\n' +
    '(gdb) break *0x4012e0\n' +
    '(gdb) run\n' +
    '(gdb) x/s $rdi        # 输入(用户串/数据)\n' +
    '(gdb) x/4gx $rax      # 输出(若有返回值)',
  example3:
    '# 识别后复算验证(以 MD5 为例)\n' +
    'echo -n "mypassword" | md5sum\n' +
    '# 若与样本中硬编码值一致, 即证实算法=MD5\n\n' +
    '# 用 openssl 复算其它常见算法\n' +
    'echo -n "data" | openssl dgst -sha256\n' +
    'echo -n "data" | openssl dgst -md5\n\n' +
    '# 逐字节 XOR 自制校验: 在内存观察 key\n' +
    '(gdb) x/16bx &keybuf     # 打印密钥字节\n' +
    '# 纸上步骤: 识算法 -> 找常量/调用 -> 抓输入输出 -> 复算定性',
};

if (typeof module !== 'undefined') module.exports = { rev11, rev12, rev13, rev14, rev15 };