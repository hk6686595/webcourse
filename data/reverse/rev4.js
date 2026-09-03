// 逆向工程基础 16–20：平台实战与综合
const rev16 = {
  id: 'rev-windbg',
  title: '16. Windows 动态调试：WinDbg / x64dbg',
  category: '动态分析',
  version: 'WinDbg',
  level: '中阶',
  summary: 'Windows 逆向动态调试的环境与基本操作：断点、内存、模块、以及常见口令校验定位。',
  detail: [
    'Windows 动态调试主流工具：x64dbg(开源，界面友好)与 WinDbg(微软，内核/疑难场景更强)。',
    '模块/地址：程序默认加载基址 ImageBase + RVA；x64dbg 或 WinDbg 的模块窗口按模块显示，方便相对寻址。',
    '常用断点：bp 函数名/地址、软件断点(F2)、硬件断点(HR/HW)；内存访问断点在写处停。',
    '定位口令校验在 Windows 同样逻辑：找 GetWindowText/ReadFile 读输入 -> 找比较(CompareString/strcmp/CryptHashData) -> 改跳转或抓串。',
    'WinDbg 命令概览：g 运行、bp/bu 断点、db/dw 内存、r 寄存器、k 栈、lm 模块、!peb 进程信息。',
    '安全边界：分析环境务必隔离(VM/沙盒)，只处理你授权/样本/CTF 的程序。',
  ],
  notes: [
    'x64dbg 双击汇编行即可下断与改指令；WinDbg 更偏命令行、适合脚本化与内核。',
    'Windows 的 MessageBox 提示"错误/正确"是定位验证结果的快捷锚点(在调用它处断点向上回溯)。',
  ],
  example:
    '# Windows PowerShell / x64dbg 命令提示块(教学)\n' +
    '# 打开 x64dbg -> File->Open 选择 target.exe\n' +
    '# 左下角"模块"窗口找到 .exe 基址\n' +
    '# 在反汇编窗口 Ctrl+G 跳到入口/API 调用\n' +
    '# 搜索字符串: Ctrl+E 输入 "Incorrect"\n' +
    '# 双击命中串 -> 右键 Find References -> 交叉引用\n' +
    '# 在引用处 F2 下断, F9 运行',
  example2:
    '# WinDbg 命令示例\n' +
    'lm                      # 列模块/基址\n' +
    'bp target!MyCheck       # 在函数下断(有符号/导出)\n' +
    'bp 140001000            # 按绝对地址下断\n' +
    'g                       # 运行到断点\n' +
    'r rax                   # 看寄存器\n' +
    'db rax L20              # 打印 rax 指向的 0x20 字节\n' +
    'k                       # 调用栈\n' +
    'dd rsp                  # 栈数据\n\n' +
    '# 硬件断点: ba e1 <addr>',
  example3:
    '# Windows 常见校验链路(教学定位法)\n' +
    '# 1) 输入:   GetWindowTextW / ReadFile\n' +
    '# 2) 处理:   CryptHashData / lstrcmp / self-loop\n' +
    '# 3) 分支:   test + je/jne 决定成功与否\n\n' +
    '# x64dbg 技巧: 在 MessageBoxA/W 下断, 触发后\n' +
    '# 返回地址回溯到"打印正确/错误"的分支处\n' +
    '# 往上翻找到 strcmp/哈希比较的 test eax,eax\n\n' +
    '# 隔离建议: 在虚拟机快照内操作, 样本来源要对\n' +
    '# 有把握再动(自己编译的验证程序/CTF/可信样本)',
};

const rev17 = {
  id: 'rev-frida',
  title: '17. Frida 动态插桩入门',
  category: '动态分析',
  version: 'Frida',
  level: '高级',
  summary: '用 Frida 在运行时 hook 函数：拦截参数/返回值、注入 JS，快速黑盒洞悉程序逻辑。',
  detail: [
    'Frida 是跨平台的动态插桩工具：不需要修改目标二进制，运行时注入自己的 JS 逻辑，hook 函数、读写内存、观察调用。',
    '适用：原生(iOS/Android/桌面)二进制、游戏、App 的逻辑分析；是移动端逆向最常见动态手段。',
    '核心概念：hook function 拦截调用(打印参数/返回值/栈)、Interceptor.attach 指定目标、内存读写用 Module 与 NativePointer。',
    '基础用法：frida -U 设备 -n 进程 附加；或 frida -f 二进制 启动并挂；JS 里 Interceptor.attach(targetAddr, { onEnter, onLeave })。',
    '常见任务：打印 strcmp/strlen 参数(暴露比对串)、hook 加密函数看输入输出、列出导入导出、枚举类(移动端)。',
    '安全：只对你有权调试的程序/App/自己的测试工程操作(Android/iOS 越狱机需相应环境,务必受控)。',
  ],
  notes: [
    'frida 需要 Python 端(frida-tools)与目标设备/进程权限；uid 传递用 NativePointer 而非纯数字。',
    '先 frida-ps 确认能附加，再写 hook 脚本，逐步验证。',
  ],
  example:
    '# 环境安装(开发机/隔离环境)\n' +
    'pip install frida-tools\n' +
    'frida-ps -U        # 列出已连接设备进程\n' +
    '# 附加上原生进程(以 Linux 桌面进程为例)\n' +
    'frida -n target_process',
  example2:
    '# hook strcmp: 打印每次比较的两端字符串\n' +
    '// hook.js\n' +
    'const strcmp = Module.findExportByName(null, "strcmp");\n' +
    'Interceptor.attach(strcmp, {\n' +
    '  onEnter(args) {\n' +
    '    this.a = Memory.readUtf8String(args[0]);\n' +
    '    this.b = Memory.readUtf8String(args[1]);\n' +
    '    console.log("strcmp(", this.a, ",", this.b, ")");\n' +
    '  },\n' +
    '  onLeave(retval) {\n' +
    '    console.log("  =>", retval.toInt32());\n' +
    '  }\n' +
    '});\n' +
    '# 运行\n' +
    'frida -n target_process -l hook.js\n' +
    '# 每次比较都打印两端字符串 -> 直接暴露比对明文',
  example3:
    '# 更广的 hook: 打印输入输出与调用栈\n' +
    '// hook2.js\n' +
    'const t = Module.findExportByName(null, "Decrypt");\n' +
    'Interceptor.attach(t, {\n' +
    '  onEnter(args) {\n' +
    '    console.log("Decrypt in:", Memory.readByteArray(args[0],64));\n' +
    '    console.log(Thread.backtrace(this.context, Backtracer.ACCURATE)\n' +
    '                .map(DebugSymbol.fromAddress).join("\\n"));\n' +
    '  },\n' +
    '  onLeave(ret) {\n' +
    '    console.log("Decrypt out:", Memory.readByteArray(ret,64));\n' +
    '  }\n' +
    '});\n' +
    '# 移动端同理; 始终只在受控设备分析授权样本',
};

const rev18 = {
  id: 'rev-firmware-mobile',
  title: '18. 固件与移动端逆向简介',
  category: '领域扫描',
  version: 'ARM',
  level: '高级',
  summary: '粗看两大领域：固件(嵌入式)与移动端(Android/iOS)逆向的工具与切入点。',
  detail: [
    '固件逆向(Firmware)：路由/单片机/IoT 的固件通常是整个 flash 镜像，含引导、os、app，用 binwalk 解包出内核与文件系统再深入。',
    '固件切入点：binwalk 识别/解包文件系统 -> 找可执行文件/配置/密钥 -> strings/静态脚本分析 -> 需实物或 qemu 模拟运行。',
    '架构差异：多为 ARM/MIPS(而非 x86)，汇编不同、字节序可能大端；IDA/Ghidra 选择正确处理器即可。',
    '移动端 Android：APK 本质是 zip，dex 用 jadx 反编译为可读 Java/kotlin；native .so 用 IDA/Ghidra 分析，配合 Frida 动态验证。',
    '移动端 iOS：App 是 Mach-O，越狱机 + frida-ios-dump 提取、class-dump 看类结构、Hopper/Ghidra 看 ARM64 汇编。',
    '共同安全准则：分析对象必须是你拥有/授权/CTF 的固件与 App；越狱/root 环境务必受控隔离，警惕恶意样本。',
  ],
  notes: [
    '先从"解包看结构"开始，别一头扎进指令；binwalk + file 就能回答 80% 的"这是什么"。',
    '移动端先反编译 dex/jar 拿逻辑，native 层才上汇编, 配合 Frida 效率最高。',
  ],
  example:
    '# 固件解包第一步: binwalk\n' +
    'file firmware.bin\n' +
    'binwalk firmware.bin        # 扫描内嵌文件系统/压缩段\n' +
    'binwalk -e firmware.bin     # 解包到 _firmware.bin.extracted\n' +
    '# 常见产物: squashfs/ubi 根文件系统\n\n' +
    '# 挂载/解出文件系统(以 squashfs 例)\n' +
    'firmware-mod-kit 或 unsquashfs 均可还原\n',
  example2:
    '# Android APK 反编译\n' +
    'file sample.apk\n' +
    'unzip -l sample.apk | grep -E "classes|lib/"   # 看 dex 与 native\n' +
    '# 反编译 dex -> 可读 Java\n' +
    'jadx -d out sample.apk\n' +
    'find out -name "*.java" | head\n' +
    '# 阅读后定位核心逻辑/加密函数',
  example3:
    '# Android native + 动态验证(Frida)\n' +
    '# 1) 从 jadx 找到 native 方法名\n' +
    '# 2) 找 .so 里对应导出符号\n' +
    'readelf -s lib/libnative.so | grep Java_\n' +
    '# 3) Frida hook 该符号观察参数/返回值\n' +
    '// frida hook Java 层也可以:\n' +
    'Java.perform(function(){\n' +
    '  var C = Java.use("com.app.Main");\n' +
    '  C.check.overload("java.lang.String")\n' +
    '   .implementation = function(s){\n' +
    '     console.log("input:", s);\n' +
    '     var r = this.check(s);\n' +
    '     console.log("result:", r); return r;\n' +
    '   };\n' +
    '});\n' +
    '# 始终在受控越狱/root 设备上分析持有授权的样本',
};

const rev19 = {
  id: 'rev-case-study',
  title: '19. 综合实战：完整解开一个 CrackMe',
  category: '综合实战',
  version: 'x86',
  level: '高级',
  summary: '把一个典型的 CrackMe(练习破解程序)从静态读到动态改走完全流程，串起前面所有知识点。',
  detail: [
    'CrackMe 是用于学习破解/逆向的刻意设计的练习程序(开源题目), 常含简单的口令或序列号校验。本课用可验证的教学样本串联全流程。',
    '总流程：准备隔离环境 -> 静态勘察(file/strings/readelf/objdump) -> 定位校验函数 -> 动态验证(GDB/Frida) -> 推导合法 Key 或打补丁 -> 复验。',
    '第一步静态：file 定类型、strings 抓提示与"正确/错误"串、readelf 结构、objdump 定位 main 与候选函数。',
    '第二步动态：GDB 在 strcmp / 关键 call 下断，观察比较的两端；或 Frida hook 全部比较函数收集比对串。',
    '第三步推导：若是"与硬编码串比较"直接可得 Key；若是简单算法(把输入变换后比)，跟踪变换逻辑反向求解或直接改跳转。',
    '第四步收尾：验证合法路径能过、记录方法；把整套思路写成笔记(思路 > 答案)。',
  ],
  notes: [
    '破解练习(CrackMe)仅限 授权/CTF/自己编译 的样本；不用于盗版商业软件。',
    '常把"答案"藏得很浅：一个 strcmp 指向硬编码常量，strings 都能抓到。先试 strings 再上逆向。',
  ],
  example:
    '# 准备好练习样本(假设 I_KNOW_your密码crackme)\n' +
    '# 0) 隔离环境: 在 Linux VM 内进行, 样本来源可信\n' +
    'file crackme\n' +
    'strings -n 4 crackme | grep -iE "key|pass|wrong|ok|输入"\n' +
    '# 抓到提示串: "Input the Key:", "Wrong!", "Congrats!"',
  example2:
    '# 1) 定位校验: 找 "Congrats!" 的引用\n' +
    'objdump -d -M intel crackme | grep -B8 "407020"  # 该串地址\n' +
    '# 看到 call strcmp 紧邻分支\n' +
    'objdump -d -M intel crackme | grep -E "strcmp|je|jne" | head\n' +
    '# 2) 动态确认(GDB)\n' +
    'gdb -q ./crackme\n' +
    '(gdb) break strcmp\n' +
    '(gdb) run\n' +
    '(gdb) x/s $rdi\n' +
    '(gdb) x/s $rsi\n' +
    '# 打印出: 一端是你输入, 另一端(si)是硬编码 Key',
  example3:
    '# 3) 提取答案并验证\n' +
    '# 若 strcmp 第二个参数是 0x40xxxx 指向的硬编码串\n' +
    '# 直接从原文件中取:\n' +
    'strings -tx crackme | grep -i "I_KNOW"       # 或任意可见 Key\n' +
    './crackme\n' +
    '> 输入刚才抓到的 Key\n' +
    '# > Congrats!  -> 合法 Key 成立\n\n' +
    '# 4) 若不想找 Key, 反转跳转打补丁(见第 10 篇)\n' +
    '# 5) 复盘记录: 哪种最快? strcmp 硬编码串最浅;\n' +
    '#    若加密混淆则要上脱壳/反混淆/密码学那几篇\n' +
    '# 提醒: 仅限授权/CTF/自编 CrackMe 练习',
};

const rev20 = {
  id: 'rev-roadmap',
  title: '20. 提升路线与工具速查',
  category: '实战',
  version: '综合',
  level: '高级',
  summary: '把逆向学习沉淀成路线与工具速查：分阶段成长、常用命令一键查、避坑与合法边界。',
  detail: [
    '逆向成长分四步：1)基础(汇编/内存/二进制格式) 2)静态分析(结构/字符串/交叉引用) 3)动态分析(调试/断点/hook) 4)专项(脱壳/反混淆/领域)。',
    '一定要"带问题学"：拿 CTF(如 picoCTF 逆向题、crackmes.one)当练习，题材有授权且可验证。',
    '工具矩阵(Linux)：readelf/objdump/nm/strings/strace + GDB + Radare2/Ghidra；Windows：x64dbg/WinDbg/PE-bear；移动：jadx/Frida/Hopper。',
    '效率心法：先 strings 再结构再动态；能动态拿真相别硬啃静态；老练到一眼识别 if/循环/strcmp 模式。',
    '合法边界(务必遵守)：只分析 你拥有/你编写/获得授权/CTF题目/开源 的软件与固件；不用于绕过商业软件授权、盗版、入侵第三方系统或窃取他人凭据。',
    '持续输入：Ghidra 官方文档、Practical Malware Analysis、crackmes 社区、安全会议(REcon/OUSPG)资料。',
  ],
  notes: [
    '逆向核心是"理解他人如何把问题翻译成机器指令"，这反过来极有帮助于写出更清晰、更不易被误分析的代码。',
    '所有动手练习都在隔离(VM/沙盒)里进行, 样本来源明确后才运行。',
  ],
  example:
    '# ===== 一键速查(静态) =====\n' +
    'file ./x                    # 类型/架构/strip\n' +
    'strings -n5 ./x             # 抽取字符串\n' +
    'readelf -h ./x              # ELF 头/入口\n' +
    'readelf -Ss ./x             # 节表+符号\n' +
    'objdump -d -M intel ./x     # 反汇编\n' +
    'nm ./x | grep " T "         # 函数表',
  example2:
    '# ===== 一键速查(动态) =====\n' +
    'gdb -q ./x\n' +
    '  (gdb) starti\n' +
    '  (gdb) info functions\n' +
    '  (gdb) break strcmp\n' +
    '  (gdb) run\n' +
    '  (gdb) info registers rax rdStr\n' +
    '# Frida 快速挂\n' +
    'frida -n proc -l hook.js\n' +
    '# 固定工具三角: objdump/GDB/Frida 覆盖 8 成日常',
  example3:
    '# ===== 分阶段路线 =====\n' +
    '# 阶段1 基石(2周)\n' +
    '#   x86 汇编读法 + ELF/PE + 内存模型\n' +
    '#   => 会读 objdump 反汇编\n' +
    '# 阶段2 静态(2周)\n' +
    '#   strings/交叉引用/函数边界/识别 if-循环-switch\n' +
    '#   => 会找验证逻辑\n' +
    '# 阶段3 动态(2周)\n' +
    '#   GDB 断点/寄存器/内存 + Frida hook\n' +
    '#   => 会观察与改执行流\n' +
    '# 阶段4 专项(持续)\n' +
    '#   脱壳UPX -> 反混淆 -> 密码学识别 -> 领域(固件/App)\n' +
    '#   => crackmes.one 刷题, picoCTF 逆向题练手\n' +
    '# 请始终: 只分析授权/自编/CTF 样本, 隔离运行, 尊重版本权',
};

if (typeof module !== 'undefined') module.exports = { rev16, rev17, rev18, rev19, rev20 };