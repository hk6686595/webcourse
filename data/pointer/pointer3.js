// C++ 指针详解 11–15：内存管理
module.exports = [
  {
    id: 'ptr-new',
    title: '11. new / delete：堆内存分配与释放',
    category: '内存管理',
    version: 'C++98',
    level: '进阶',
    lang: 'cpp',
    summary: '掌握堆内存的 new/delete、数组形式与严格配对规则。',
    detail: [
      '堆是运行期由程序员亲手控制的内存池：new 分配内存（并可选初始化），返回指向对象的指针。',
      'new int 返回 int*；new Point(1,2) 构造对象；new int(5) 初始化值为 5。',
      '数组分配用 new int[n]，必须用 delete[] 配对释放；单个 delete 释放数组是未定义行为。',
      '释放用 delete p 或 delete[] p，之后应置 p = nullptr，防止留下悬空指针。',
      'malloc/free 与 new/delete 不能混用：new 走"构造 + operator new"，delete 走"析构 + operator delete"。',
      '内存耗尽时 new 抛 std::bad_alloc（不是返回空），需要 try/catch 或让程序按策略处理。',
    ],
    notes: [
      '每一块 new 出来的内存必须恰好被 delete 一次：漏删泄漏、多删 double-free。',
      '工程上优先用智能指针接管生命周期，把"手动配对"交给 RAII 自动完成。',
    ],
    example: `int main() {
    int* p = new int;          // 未初始化（值不定）
    *p = 42;
    std::cout << *p << "\\n";   // 42
    delete p;                  // 释放单块

    int* q = new int(7);       // 分配并初始化
    std::cout << *q << "\\n";   // 7
    delete q;

    int* arr = new int[5];     // 数组形式
    arr[0] = 1;                // 用法同普通数组
    delete[] arr;              // 必须 delete[]

    try {
        int* huge = new int[1000000000];
        // 可能抛 std::bad_alloc
    } catch (const std::bad_alloc&) {
        // 处理内存不足
    }
}`,
  },
  {
    id: 'ptr-dangling',
    title: '12. 悬空指针、内存泄漏与双重释放',
    category: '内存管理',
    version: 'C++98',
    level: '进阶',
    lang: 'cpp',
    summary: '识别三大内存事故，学会防御手法与工具排查。',
    detail: [
      '悬空指针：指针仍指向"已释放/已失效"的内存，解引用它是未定义行为，随时可能崩溃。',
      '内存泄漏：new 后一直没 delete，长期运行内存被悄悄吞掉，最终 OOM 假死。',
      '双重释放：同一块内存 delete 两次，堆管理元数据被破坏，可能即时崩溃或损坏后续分配。',
      '防御手段：释放后立即置 nullptr（delete 空指针是安全空操作）；约定"谁 new 谁 delete"的单一所有权。',
      '排查工具：AddressSanitizer（-fsanitize=address）能直接报告 use-after-free 与 double free；Valgrind 可查泄漏。',
      '根治手段：用 RAII/智能指针，对象销毁即自动回收，从源码层消灭整类 bug。',
    ],
    notes: [
      '悬空指针比空指针危险得多：空指针可检查、可复现；悬空指针行为随机、难以定位。',
      '泄漏高发点：异常提前 return 跳过 delete、容器装裸指针忘清理、回调持裸指针跨函数存活。',
    ],
    example: `int main() {
    // 1) 悬空指针
    int* p = new int(5);
    delete p;
    *p = 9;                    // BUG: 访问已释放内存 (UB)

    // 2) 内存泄漏
    int* q = new int(1);       // 忘掉 delete q; —— 泄漏

    // 3) 双重释放
    int* r = new int(2);
    delete r;
    // delete r;              // BUG: double free

    // 4) 防御式写法
    int* s = new int(3);
    delete s;
    s = nullptr;               // 置空后再次 delete 安全
    delete s;                  // 合法空操作
}`,
  },
  {
    id: 'ptr-dynarray',
    title: '13. 指针与动态数组：new[] 的正确姿势',
    category: '内存管理',
    version: 'C++98',
    level: '进阶',
    lang: 'cpp',
    summary: '用指针 + new[] 支持运行期才知道大小的数组，并安全释放。',
    detail: [
      '静态数组大小必须编译期确定；个数来自变量/输入时要用 pointer + new[] 动态分配。',
      'int* arr = new int[n]; 之后 arr[i] 与 *(arr+i) 均可访问，n 可以是运行时值。',
      '使用完必须 delete[] arr; ——写成 delete 会触发未定义行为（可能只在 Debug 崩）。',
      '函数间传递动态数组通常"指针 + 元素个数"成对出现，别让 size 信息丢失。',
      '现代替代 std::vector<int>：自动管理容量、自动释放、自带 size()，几乎总是更优解。',
      'new[]/delete[] 的实现会记录元素个数用于批量构造/析构，数组形式必须成对使用。',
    ],
    notes: [
      'delete[] 必须与 new[] 配对，delete 与 new 配对，交叉使用是未定义行为。',
      '新代码优先容器；仅当需要精细控制内存布局（如嵌入式、协议缓冲）才手写。',
    ],
    example: `#include <iostream>

int main() {
    int n = 0;
    std::cin >> n;                 // 运行期才知道数量

    int* arr = new int[n];         // 动态数组
    for (int i = 0; i < n; ++i)
        arr[i] = i * i;

    // 传递时把大小一起带走
    auto sum = [=](int* a, int cnt) {
        int s = 0;
        for (int i = 0; i < cnt; ++i) s += a[i];
        return s;
    };
    std::cout << sum(arr, n) << "\\n";

    delete[] arr;                  // 必须 delete[]
}`,
  },
  {
    id: 'ptr-return',
    title: '14. 返回指针的危险与所有权',
    category: '内存管理',
    version: 'C++98',
    level: '进阶',
    lang: 'cpp',
    summary: '区分"返回局部变量地址"与"返回堆指针"的天壤之别，明确谁拥有内存。',
    detail: [
      '绝不能返回栈上局部变量的地址：函数返回后栈帧销毁，指针立刻悬空。',
      '返回堆上 new 的指针合法，但必须与调用者约定好——由谁负责 delete 这块内存。',
      '返回静态量地址（函数内 static 变量）安全但有副作用：多线程与重入场景要小心。',
      '用输出参数（如 int** out）交出指针同样伴随所有权义务，写代码的人要负责兑现。',
      '经典悬空：返回容器内部元素的指针，容器扩容或销毁后该指针失效（迭代器同理）。',
      '工程惯例：按值返回对象让编译器处理移动；需要指针就返回智能指针，把所有权说清楚。',
    ],
    notes: [
      '所有权不明确是内存 bug 的温床；用命名与注释写清契约（如 get_ 代表不转移、take_ 代表转移）。',
      '返回引用面临同样的生命周期问题，编译器不会替你检查。',
    ],
    example: `int* bad() {               // BUG：返回局部变量地址
    int x = 42;
    return &x;              // 栈帧销毁后悬空
}

int* good() {               // 正确：堆上分配 + calloc 约定
    return new int(7);      // 调用者负责 delete
}

const char* current_mode() {
    static const char* mode = "fast";   // 静态量：安全
    return mode;
}

int main() {
    // int* p = bad();     // 未定义行为，别这么干
    int* p = good();
    std::cout << *p << "\\n";   // 7
    delete p; p = nullptr;      // 兑现所有权
}`,
  },
  {
    id: 'ptr-layout',
    title: '15. 内存布局：栈 / 堆 / 静态区',
    category: '内存管理',
    version: 'C++98',
    level: '进阶',
    lang: 'cpp',
    summary: '理解进程地址空间的区域划分，以及各类变量的存放位置与特征。',
    detail: [
      '栈（Stack）：向下增长，存局部变量与函数参数，函数返回自动回收；速度快但容量有限（约几 MB）。',
      '堆（Heap）：向上增长，存 new/malloc 分配的对象，生命周期由程序员掌控，容量大但管理成本高。',
      '全局/静态区：存全局变量与 static 变量，程序启动即存在、程序结束才销毁。',
      '常量/代码段：存放字符串字面量等常量与机器指令，向它写入通常是段错误。',
      '直观观察：栈变量地址一般很大（0x7fff...），堆地址在它下方，打印 &a 与 new 指针即可看到规律。',
      '掌握布局对定位栈溢出、内存越界、对齐问题非常有帮助。',
    ],
    notes: [
      '无限递归或超大栈数组会栈溢出：Linux 报 Segmentation fault，Windows 报 Stack overflow。',
      '由于 ASLR，同一次程序的局部变量地址每次运行都不同，但不影响指针语义。',
    ],
    example: `#include <iostream>

int g_global = 1;            // 全局/静态区
const char* k_lit = "hi";    // 指向常量区

int main() {
    int   stack_val = 2;     // 栈
    int*  heap = new int(3); // 堆

    static int s_local = 4;  // 静态区（局部 static）

    std::cout << "&stack = " << (void*)&stack_val << "\\n";
    std::cout << "global = " << (void*)&g_global << "\\n";
    std::cout << "heap   = " << (void*)heap         << "\\n";
    std::cout << "lit    = " << (void*)k_lit        << "\\n";
    // 地址高低走势一眼可见：栈 > 静态区 > 堆

    delete heap;
}`,
  },
];