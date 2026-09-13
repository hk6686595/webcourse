// C++ 指针详解 1–5：入门
module.exports = [
  {
    id: 'ptr-basic',
    title: '1. 什么是指针：地址与内存模型',
    category: '指针入门',
    version: 'C++98',
    level: '入门',
    lang: 'cpp',
    summary: '理解变量、内存地址与指针的关系，建立"指针就是地址"的核心认知。',
    detail: [
      '内存可以看作一排带编号的格子，每个字节一个地址；变量就是占用某段地址的内存区域。',
      '指针是一种用来保存"地址"的变量：int* p 声明一个指针变量，它存的是某块 int 内存的地址。',
      '解引用运算符 * 通过地址访问内存上存储的数据：*p 得到 p 指向的那个整数。',
      '指针类型（如 int*）里的类型决定了 *p 的字节数与解读方式，也就是"以什么视图看待这块内存"。',
      '指针本身也有大小：64 位平台上指针固定 8 字节，与它指向的数据有多大无关。',
      '编译器在编译期记住每个指针的类型，从而用对应类型的语义读写内存。',
    ],
    notes: [
      '指针只是"地址"本身，地址不携带"这块内存归谁管"的信息——悬空与越界全靠程序员自觉。',
      '养成先初始化指针（= nullptr）再使用的习惯，不初始化就解引用是常见崩溃源。',
    ],
    example: `#include <iostream>
int main() {
    int  a = 42;
    int* p = &a;            // p 保存变量 a 的地址

    std::cout << "a  = " << a  << "\\n";
    std::cout << "&a = " << &a << "\\n";   // 0x7fff...
    std::cout << "p  = " << p  << "\\n";   // 与 &a 相同
    std::cout << "*p = " << *p << "\\n";   // 解引用 = 42

    *p = 100;               // 通过指针间接修改 a
    std::cout << a << "\\n";              // 100
}`,
  },
  {
    id: 'ptr-deref',
    title: '2. 取址运算符 & 与解引用 *',
    category: '指针入门',
    version: 'C++98',
    level: '入门',
    lang: 'cpp',
    summary: '掌握 &a 取地址与 *p 解引用的语义，理解它们互为逆运算的关系。',
    detail: [
      '&a 返回变量 a 的内存地址，表达式类型为指向 a 的类型的指针（int*）。',
      '*p 表示"p 地址上的数据"，读取或写入都经过它；解引用结果是左值，可以赋值。',
      '逆运算关系：*(&a) == a，&(*p) == p，这两个运算符在地址与数据之间来回切换。',
      '对未初始化或已释放的指针解引用是未定义行为（UB），是崩溃与脏数据的头号来源。',
      '声明习惯：int* p 读作"p 是指向 int 的指针"，声明语句中的 * 只修饰紧跟它的那个名字。',
      'int* a, b; 中只有 a 是指针、b 是普通 int；声明两个指针应写 int *a, *b 或分开声明。',
    ],
    notes: [
      '*p = 5 等价于往 p 指向的内存写入 5；函数通过指针参数就能改写函数外部的变量。',
      '*p++ 是 *(p++)（先取旧地址的值再移动指针），++*p 是 (*p)++（对值自增），语义完全不同。',
    ],
    example: `#include <iostream>
int main() {
    int x = 10;
    int* p = &x;          // &x 取址，赋给指针

    std::cout << *p << "\\n";     // 读取: 10
    *p = 20;              // 写入 p 指向的内存
    std::cout << x << "\\n";      // 20

    // 逆运算验证
    std::cout << (*(&x) == x);    // 1
    std::cout << (&(*p) == p);    // 1
}`,
  },
  {
    id: 'ptr-null',
    title: '3. 空指针与判空：nullptr / NULL',
    category: '指针入门',
    version: 'C++11',
    level: '入门',
    lang: 'cpp',
    summary: '理清 nullptr、NULL、0 的来龙去脉，养成"用前判空、释放后置空"的习惯。',
    detail: [
      '空指针表示"不指向任何对象"的合法指针状态，常用于失败返回值与"尚无目标"的哨兵。',
      'C++11 起推荐用 nullptr（类型为 std::nullptr_t 的专用字面量）；NULL 实际就是 0，混用会引发整数/指针二义。',
      '判空写法：if (p) 等价于 if (p != nullptr)；对空指针解引用必然崩溃（Segmentation fault）。',
      'delete 空指针在 C++ 中是合法空操作（无副作用），但释放后仍应 p = nullptr 防止重复释放。',
      '空指针 ≠ 悬空指针：空指针"确定不指向任何东西"、可检查；悬空指针"曾经指向现已失效"、无从检查。',
      '在函数入口对指针参数统一判空，是防御式编程的最低要求。',
    ],
    notes: [
      'NULL 本质是 0，传给重载函数或可变参数时可能被当作整数而非指针，这正是引入 nullptr 的原因。',
      '双重删除崩溃对比：delete p; delete p; 会 double-free；delete p; p=nullptr; delete p; 安全。',
    ],
    example: `void use(int* p) {
    if (p == nullptr) {           // 入口判空
        std::cerr << "空指针!\\n";
        return;
    }
    *p += 1;
}

int main() {
    int* p = nullptr;
    use(p);                        // 安全：判空拦截

    p = new int(5);
    use(p);                        // *p == 6

    delete p;
    p = nullptr;                   // 释放后置空，防 double-free
    use(p);                        // 再次安全
}`,
  },
  {
    id: 'ptr-array',
    title: '4. 指针与数组：arr[i] 的本质',
    category: '指针入门',
    version: 'C++98',
    level: '入门',
    lang: 'cpp',
    summary: '数组名条件退化为首元素指针，正确理解下标、指针与 sizeof 的差异。',
    detail: [
      '大多数表达式中数组名会退化为指向首元素的指针：int a[5]; int* p = a; 等价 int* p = &a[0];。',
      '下标访问 arr[i] 与 *(arr + i) 完全等价——编译器就是按指针运算加解引用处理的。',
      '数组名不是变量，不能整体自增或重新赋值（a++ 不合法）；要移动位置得用独立的指针。',
      '&arr 与 arr 不同：&arr 类型是 int(*)[5]（指向整个数组），步长是整组数组的字节数。',
      'sizeof(arr) 得到整个数组大小；函数参数里的"数组"已经被剥成指针了，丢失大小信息。',
      '指针没有边界检查，越界读写是未定义行为，边界是程序员自己的责任。',
    ],
    notes: [
      '把数组传进函数必须同时传元素个数，或改用容器 / 范围 for 保持大小信息。',
      'p[i] 用起来像下标，本质仍是解引用，下标运算符对指针同样可用。',
    ],
    example: `#include <iostream>
int main() {
    int arr[5] = {10, 20, 30, 40, 50};
    int* p = arr;                 // 数组名退化为 &arr[0]

    std::cout << p[2] << "\\n";    // 30, p[2] == *(p+2)
    p[3] = 44;                    // 改 arr[3]
    std::cout << arr[3] << "\\n";  // 44

    std::cout << sizeof(arr)      // 20 (5 * 4 字节)
              << sizeof(p) << "\\n";       // 8 (指针)

    // int* q = &arr;  // 类型不匹配: &arr 是 int(*)[5]
}`,
  },
  {
    id: 'ptr-arith',
    title: '5. 指针运算与安全遍历',
    category: '指针入门',
    version: 'C++98',
    level: '入门',
    lang: 'cpp',
    summary: '掌握指针加减的步长规则、两指针之差与比较，以及用"尾后指针"安全遍历数组。',
    detail: [
      'p + n 按 p 指向类型的大小移动 n 个元素，而不是 n 个字节：int* 每次跳过 4 字节。',
      'p - q 得到两指针之间相差几个"元素"，类型为 ptrdiff_t（可为负数）。',
      '指针支持 == != < > 等关系比较，常用来判断遍历是否越过数组末尾。',
      '尾后指针 arr + N（N 为元素个数）本身可参与比较，是"不越界"的合法边界值。',
      '指针算术只允许在同一数组（及尾后一位置）范围内进行，跨数组比较属未定义行为。',
      '现代 C++ 更推荐 std::begin/end、范围 for 和迭代器，裸指针遍历只作为底层手段。',
    ],
    notes: [
      '步长单位是"元素"不是字节：p += 3 前进 3 个元素；忘掉字节。',
      '尾后位置只可用于比较，不能解引用——解引用 arr + N 越界。',
    ],
    example: `#include <iostream>
int main() {
    int arr[] = {5, 9, 2, 7, 1};
    int* begin = arr;                 // 首元素
    int* end   = arr + 5;             // 尾后指针（合法边界）

    // 用指针遍历
    for (int* p = begin; p != end; ++p)
        std::cout << *p << ' ';       // 5 9 2 7 1

    std::ptrdiff_t n = end - begin;   // 5，元素个数
    std::cout << "\\ncount = " << n << "\\n";

    int* mid = begin + 2;             // &arr[2]
    std::cout << *mid << "\\n";       // 2
    std::cout << (begin < end) << "\\n";     // 1
}`,
  },
];