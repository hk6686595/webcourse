// C++ 指针详解 6–10：进阶
module.exports = [
  {
    id: 'ptr-const',
    title: '6. const 与指针的四种组合',
    category: '指针进阶',
    version: 'C++98',
    level: '进阶',
    lang: 'cpp',
    summary: '理清 const 修饰"所指数据"还是"指针本身"，看懂每一种声明。',
    detail: [
      'const int* p（指向 const int 的指针）：p 本身可变，但 *p 只读——"指向只读数据"。',
      'int* const p（const 指针）：p 初始化后不能再指向别处，但 *p 可写——"指针本身只读"。',
      'const int* const p：既不能改指向，也不能改所指数据。',
      '读法技巧：把声明从右往左读，const 出现在 * 左边修饰"所指对象"、出现在名字边修饰"指针本身"。',
      '加 const 方向允许（int* → const int* 安全），去掉 const 方向需 const_cast 且有风险。',
      '概念上分顶层 const（指针自身只读）与底层 const（所指对象只读），是理解 const 系统的钥匙。',
    ],
    notes: [
      '函数参数写 const int* p 表达"我只会读这块内存"的契约，也让调用者放心传入临时数据。',
      '对象本身非 const 时用 const_cast 去只读才合法；对象本为 const 再去写属于未定义行为。',
    ],
    example: `int x = 1, y = 2;

const int* p1 = &x;      // 所指只读
p1 = &y;                 // ok，指针可改指向
// *p1 = 5;             // 错误: *p1 只读

int* const p2 = &x;      // 指针本身只读
*p2 = 5;                 // ok，可改所指数据
// p2 = &y;             // 错误: p2 不可再指向

const int* const p3 = &x;   // 两者都只读
// p3 = &y;  *p3 = 5;    // 都错误

void read(const int* p) { /* 只读地使用 p */ }
void write(int* p)      { *p = 0; }`,
  },
  {
    id: 'ptr-func',
    title: '7. 函数指针：把函数当作参数传递',
    category: '指针进阶',
    version: 'C++98',
    level: '进阶',
    lang: 'cpp',
    summary: '函数名即函数指针，掌握声明语法、两种调用方式与回调应用。',
    detail: [
      '函数名在表达式中退化为函数指针，类型写作 返回类型(*)(参数列表)。',
      '声明：int (*fp)(int, int) = add; 中间的 * 必须与名字结合，括号一丢就变成"返回指针的函数"。',
      '两种调用等价：fp(a, b) 与 (*fp)(a, b)，前者是 C++ 的语法糖。',
      '普通函数指针不能指向非静态成员函数（成员函数带隐含 this 参数），要用成员函数指针。',
      '成员函数指针用 &Class::method 获取，需绑定对象调用：obj.*pfn(args)。',
      '工程上 C++11 后推荐 std::function 或 lambda 作为回调，类型安全且能捕获上下文。',
    ],
    notes: [
      '函数指针让"行为"可以作为参数传递——回调、比较器、事件注册都靠它。',
      '声明语法口诀：返回类型(*名字)(参数)——名字前后的括号一个都不能省。',
    ],
    example: `#include <iostream>

int add(int a, int b) { return a + b; }
int mul(int a, int b) { return a * b; }

// 把函数指针当参数：apply(cb, 3, 4)
int apply(int (*cb)(int, int), int x, int y) {
    return cb(x, y);
}

int main() {
    int (*fp)(int, int) = add;    // 取函数地址
    std::cout << fp(3, 4) << "\\n";      // 7, 直接调用
    std::cout << (*fp)(3, 4) << "\\n";   // 7, 解引用调用

    std::cout << apply(add, 3, 4) << "\\n";  // 7
    std::cout << apply(mul, 3, 4) << "\\n";  // 12

    fp = mul;                     // 可重新赋值别的函数
    std::cout << fp(3, 4) << "\\n";        // 12
}`,
  },
  {
    id: 'ptr-pp',
    title: '8. 二级指针：在函数内修改指针本身',
    category: '指针进阶',
    version: 'C++98',
    level: '进阶',
    lang: 'cpp',
    summary: '理解 int** 的含义与用途：通过参数改掉调用者指针变量的指向。',
    detail: [
      '二级指针是指向指针的指针：int** pp 存的是一个 int* 类型变量的地址。',
      '需要它的经典场景：函数内部要修改调用者的指针变量（分配内存、重新定向、置空）。',
      '传 &p 给 int** 参数，函数里 *pp = new int(7) 就能真正改掉 p 的值。',
      '层级法则：传一级指针只能改所指数据，传二级指针才能改指针变量本身。',
      '别把栈上局部指针传入后长期持有——函数返回后那个指针变量的生命周期已结束。',
      '现代写法通常用引用 int*& p 或直接 return 指针，语义更直白，代码库两种风格并存。',
    ],
    notes: [
      'int*** 三级指针很罕见，出现往往意味着应该重构（例如二维裸数组的管理）。',
      '判断依据：参数是否需要"整体更换调用者的指针"？需要则二级指针或引用。',
    ],
    example: `#include <iostream>

// *pp 就是调用者的指针变量
void my_alloc(int** pp) {
    *pp = new int(7);            // 改掉外面指针的指向
}

void my_alloc_ref(int*& p) {     // 等价写法：指针的引用
    p = new int(8);
}

int main() {
    int* p = nullptr;

    my_alloc(&p);                // p 现在是 new int(7)
    std::cout << *p << "\\n";     // 7
    delete p; p = nullptr;

    my_alloc_ref(p);             // p 现在是 new int(8)
    std::cout << *p << "\\n";     // 8
    delete p;
}`,
  },
  {
    id: 'ptr-void',
    title: '9. void* 与 C++ 的类型转换',
    category: '指针进阶',
    version: 'C++98',
    level: '进阶',
    lang: 'cpp',
    summary: '理解无类型指针 void* 与 static_cast / reinterpret_cast 的安全边界。',
    detail: [
      'void* 是"无类型指针"：只保存地址、不保存类型信息，必须先转回具体类型才能解引用。',
      'C 的 malloc 返回 void*，C++ 里更常见于底层内存操作、序列化缓冲区与容器内部实现。',
      '解引用前必须显式转换：int* ip = static_cast<int*>(vp); 之后才能 *ip。',
      'static_cast 做"相关类型"转换且编译期检查；reinterpret_cast 把位模式按新含义重解释（底层、危险）。',
      'const_cast 剥离 const 修饰；四种 cast 各司其职，C 风格 (T*)x 不再受推荐。',
      '类型信息一旦弄错，对 void* 的读写就是未定义行为，禁止随意强转后越界访问。',
    ],
    notes: [
      '业务代码大量出现 void* 通常是设计问题，优先用模板/泛型或 std::any 表达。',
      '从 void* 转回类型没有校验，转错了不报错但运行期爆炸，务必守好本队的内存约定。',
    ],
    example: `#include <iostream>
#include <cstring>

int main() {
    int   n   = 1234567;
    void* vp  = &n;                       // 存地址、丢类型
    int*  ip  = static_cast<int*>(vp);    // 转回具体类型
    std::cout << *ip << "\\n";             // 1234567

    // 底层按字节操作（序列化/网络缓冲常用）
    unsigned char bytes[4];
    std::memcpy(bytes, &n, sizeof n);     // 拷贝裸字节

    // 危险用法需要谨慎：reinterpret_cast 按位重解释
    uint64_t raw = reinterpret_cast<uint64_t>(ip);
    std::cout << raw << "\\n";             // 打印地址数值
}`,
  },
  {
    id: 'ptr-ref',
    title: '10. 引用 vs 指针：怎么选',
    category: '指针进阶',
    version: 'C++98',
    level: '进阶',
    lang: 'cpp',
    summary: '对照引用与指针的语义差异，选用更安全、更符合意图的写法。',
    detail: [
      '引用是已存在对象的别名：必须初始化、不可为空、不可重新绑定到别的对象。',
      '指针可以空、可以重新指向、可以声明不带初值——更灵活，但需要判空与生命周期管理。',
      '引用天生没有"空引用"，用起来少一层判空；指针可空则每次使用前都要警惕。',
      '函数参数选型：只读大对象用 const T&；必改外变量用 T&；需允许空/重绑定/放进容器用 T*。',
      '引用是别名，操作引用就是操作原对象；指针需要 * 或 -> 多走一层间接。',
      '返回引用要确保被引用对象活得比调用点长（类成员、静态量等），否则返回值为值拷贝/移动。',
    ],
    notes: [
      '引用底层实现往往是指针，但语义更严格：编译器保证不空、不重绑。',
      '现代 C++ 风格：能用引用就不用指针；需要可选、可空、被容器持有再选（智能）指针。',
    ],
    example: `void swap(int& a, int& b) {      // 引用必须传真实变量
    int t = a; a = b; b = t;
}
void swap_ptr(int* a, int* b) {   // 指针需判空
    if (!a || !b) return;
    int t = *a; *a = *b; *b = t;
}

int main() {
    int x = 1, y = 2;
    swap(x, y);                   // 引用：必传、必用
    std::cout << x << y << "\\n";  // 21

    swap_ptr(&x, &y);             // 指针：可判空、可传空
    std::cout << x << y << "\\n";  // 12
    swap_ptr(&x, nullptr);        // 空安全返回

    const int& rx = x;            // 只读大对象用 const&
    // rx = 5;                   // 错误：const 引用只读
}`,
  },
];