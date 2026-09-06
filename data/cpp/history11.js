// C++11 特性（历史标准里程碑）
module.exports = [
  {
    id: 'auto',
    title: 'auto 类型推导',
    category: '核心语言',
    version: 'C++11',
    level: '入门',
    summary: 'auto 让编译器根据初始化表达式推导变量类型，彻底告别冗长类型名。',
    detail: [
      'C++03 中 auto 是"具有自动存储期"的无意义存储说明符；C++11 重新定义为占位类型，由初始化式推导。',
      '最经典的用途是简化迭代器：for (auto it = m.begin(); ...) 不再需要写 std::map<...>::iterator。',
      'auto 推导遵循模板实参推导规则（去引用、不退化顶层 const 但有引用折叠），decltype(auto) 可保留引用/值类别。',
      '注意 auto 会退化数组与函数类型（变成指针），需要保留时用 auto& 或 decltype。'
    ],
    notes: [
      'auto 不能用于函数参数（C++20 起模板参数可以 auto，但普通函数不行），也不适用于非静态成员初始化。',
      'auto 只是语法糖，运行时仍是具体类型，不会带来任何运行时开销。'
    ],
    example:
      '#include <map>\n' +
      '#include <vector>\n\n' +
      'std::map<std::string, std::vector<int>> m;\n' +
      '// C++03 写法又臭又长，C++11 一行搞定\n' +
      'for (auto it = m.begin(); it != m.end(); ++it) { /* ... */ }\n\n' +
      'auto x = 42;            // int\n' +
      'const auto& s = get();  // const 引用，避免拷贝\n' +
      'auto f = [](int a){ return a * 2; };   // 函数对象类型\n\n' +
      '// 返回引用时确保 auto&，否则拿到的是副本\n' +
      'std::vector<int> v{1,2,3};\n' +
      'auto v2 = v;            // 拷贝整个 vector\n' +
      'auto& v3 = v;          // 别名，修改 v3 影响 v'
  },
  {
    id: 'range-for',
    title: '范围 for 循环',
    category: '核心语言',
    version: 'C++11',
    level: '入门',
    summary: 'for (auto& x : container) 遍历容器/数组/初始化列表，告别 begin/end 样板。',
    detail: [
      '范围 for 等价于对 begin()/end() 的迭代，语义清晰且不易越界。',
      '值拷贝还是引用取决于声明：auto x 拷贝（对大对象昂贵），auto& 可变引用，const auto& 只读避免拷贝。',
      '任何提供 begin()/end()（成员或自由函数均可）的类型都能用范围 for，包括 C 数组和 initializer_list。'
    ],
    notes: [
      '遍历时修改容器结构（增删元素）会使迭代器失效，范围 for 内不要做 erase/insert。',
      '需要索引时范围 for 不方便，用普通下标或 <ranges> 的 views::enumerate（C++23）。'
    ],
    example:
      '#include <vector>\n' +
      '#include <string>\n\n' +
      'std::vector<int> v{1, 2, 3, 4};\n' +
      'for (const auto& x : v)\n' +
      '    std::cout << x << " ";\n\n' +
      '// 需要修改元素就用引用\n' +
      'for (auto& x : v)\n' +
      '    x *= 2;          // 1 2 3 4 → 2 4 6 8\n\n' +
      '// 遍历 map 解构需要结构化绑定（C++17），C++11 这样写\n' +
      'std::map<int, std::string> m{{1,"a"}};\n' +
      'for (const auto& kv : m)\n' +
      '    std::cout << kv.first << ":" << kv.second << "\\n";\n\n' +
      '// C 数组也可用\n' +
      'int arr[] = {5, 6, 7};\n' +
      'for (int x : arr) { /* ... */ }'
  },
  {
    id: 'move-semantics',
    title: '右值引用与移动语义',
    category: '核心语言',
    version: 'C++11',
    level: '高级',
    summary: 'T&& 接管"临时对象"的资源，把深拷贝变成指针交换，性能飞跃。',
    detail: [
      '右值引用（T&&）只能绑定到右值（临时对象/将亡值）；移动构造/移动赋值借此"窃取"资源而非复制。',
      'std::move(x) 只是把一个左值**强制转换**为右值引用（cast，不移动任何东西），真正的资源转移发生在移动构造函数里。',
      '标准库容器、string 都获得了移动构造，从函数返回大对象、容器间赋值都是 O(1) 指针交换了。',
      '移动后源对象进入"有效但未指定状态"：只能析构或重新赋值，不能再依赖其值。'
    ],
    notes: [
      '不要对可能被继续使用的对象使用 std::move；也别 std::move 一个返回值（会阻止 RVO）。',
      '为自定义类型实现移动构造/移动赋值时，通常要 =default 或手动 swap，并确保不抛异常（标 noexcept 以便 vector 扩容时优先移动）。'
    ],
    example:
      '#include <string>\n' +
      '#include <vector>\n' +
      '#include <utility>\n\n' +
      'std::string build() {\n' +
      '    std::string s = "hello";\n' +
      '    return s;                 // 移动（甚至 RVO 直接构造到调用方）\n' +
      '}\n\n' +
      'std::vector<int> make() { return {1, 2, 3}; }\n' +
      'std::vector<int> a = make();  // 移动，不拷贝\n\n' +
      'std::string x = "data";\n' +
      'std::string y = std::move(x); // y 接管 x 的缓冲区，x 变空\n' +
      '// x 此后只应被赋值或析构\n\n' +
      '// 自定义类型的移动构造\n' +
      'struct Buffer {\n' +
      '    char* p; size_t n;\n' +
      '    Buffer(Buffer&& o) noexcept : p(o.p), n(o.n) { o.p = nullptr; o.n = 0; }\n' +
      '};'
  },
  {
    id: 'perfect-forwarding',
    title: '通用引用与完美转发',
    category: '核心语言',
    version: 'C++11',
    level: '高级',
    summary: 'template<class T> void f(T&&) 的 && 是"通用引用"，forward 保留值类别。',
    detail: [
      '当 T 是模板参数时，T&& 不是普通右值引用而是通用引用（forwarding reference）：T 推导为左值引用时退化为左值引用。',
      'std::forward<T>(arg) 按推导出的 T 还原原始值类别（左值保持左值、右值保持右值），从而实现"完美转发"。',
      '这是工厂函数 make_unique、emplace、容器插入接口统一"既接受左值也接受右值"的基石。'
    ],
    notes: [
      '通用引用只在"auto&& 或模板参数 T&& 且 T 待推导"时成立；对具体类型 T&& 就是普通右值引用。',
      '转发时参数几乎总是声明为 T&& 并原样 forward，不要在其中做移动。'
    ],
    example:
      '#include <utility>\n' +
      '#include <memory>\n\n' +
      '// 完美转发工厂\n' +
      'template <typename T, typename... Args>\n' +
      'std::unique_ptr<T> make_unique(Args&&... args) {\n' +
      '    return std::unique_ptr<T>(new T(std::forward<Args>(args)...));\n' +
      '}\n\n' +
      'struct Widget { Widget(int); Widget(int, double); };\n\n' +
      'auto a = make_unique<Widget>(1);            // 转发左值/右值\n' +
      'auto b = make_unique<Widget>(1, 2.0);\n\n' +
      '// 通用引用本身\n' +
      'template <typename T>\n' +
      'void relay(T&& x) {\n' +
      '    sink(std::forward<T>(x));   // 左值进来左值出去，右值进来右值出去\n' +
      '}'
  },
  {
    id: 'smart-pointers',
    title: '智能指针 unique_ptr / shared_ptr',
    category: '标准库',
    version: 'C++11',
    level: '进阶',
    summary: 'RAII 管理堆对象：独占拥有用 unique_ptr，共享引用计数用 shared_ptr。',
    detail: [
      'unique_ptr 独占所有权，零额外开销（和裸指针一样大），不可拷贝只能移动，离开作用域自动 delete。',
      'shared_ptr 通过控制块维护引用计数；拷贝时计数 +1，归零时才析构对象。weak_ptr 打破循环引用、不增加计数。',
      'make_shared<T>(args) 一次分配"对象 + 控制块"，比 new T 再构造 shared_ptr 更高效且异常安全。',
      '优先用 unique_ptr，仅在确实需要共享所有权时才用 shared_ptr——共享引用计数是有成本的。'
    ],
    notes: [
      '不要用同一个裸指针构造两个 shared_ptr，会各自拥有独立控制块导致二次释放。',
      'shared_ptr 的引用计数本身是原子操作，跨线程拷贝有同步开销；必要时用 enable_shared_from_this。'
    ],
    example:
      '#include <memory>\n' +
      '#include <vector>\n\n' +
      'auto p = std::make_unique<int>(42);    // 独占\n' +
      '// auto q = p;                         // ✘ 不能拷贝\n' +
      'auto q = std::move(p);                  // ✔ 转移所有权\n\n' +
      'auto s1 = std::make_shared<std::string>("hi");\n' +
      'auto s2 = s1;                           // 引用计数变 2\n' +
      'std::cout << s1.use_count();            // 2\n\n' +
      'struct Node { std::shared_ptr<Node> next; std::weak_ptr<Node> back; };  // weak 防环\n\n' +
      '// 作为容器元素、函数参数传递所有权\n' +
      'std::vector<std::unique_ptr<Widget>> widgets;\n' +
      'widgets.push_back(std::make_unique<Widget>(1));'
  },
  {
    id: 'nullptr',
    title: 'nullptr 代替 NULL',
    category: '核心语言',
    version: 'C++11',
    level: '入门',
    summary: '类型安全的空指针字面量，类型为 std::nullptr_t 而非整型 0。',
    detail: [
      'C++ 里 NULL 通常被定义为 0（整型），导致重载时 void f(int) 与 void f(char*) 传入 NULL 会错误匹配 int 版本。',
      'nullptr 的类型是专属的 std::nullptr_t，能隐式转换为任意指针类型，但不能转换为整型，消除了上述歧义。',
      '现代 C++ 一律用 nullptr，并把整型 0 与空指针彻底区分开。'
    ],
    example:
      'void f(int)   { std::cout << "int\\n"; }\n' +
      'void f(char*) { std::cout << "ptr\\n"; }\n\n' +
      'f(NULL);       // 调用 f(int)   —— 反直觉的坑\n' +
      'f(nullptr);    // 调用 f(char*) —— 符合预期\n' +
      'f(0);          // 调用 f(int)\n\n' +
      'int* p = nullptr;\n' +
      'if (p == nullptr) { /* 显式判断 */ }'
  },
  {
    id: 'enum-class',
    title: '枚举类 enum class',
    category: '核心语言',
    version: 'C++11',
    level: '入门',
    summary: '强类型枚举：作用域隔离 + 不会隐式转 int，终结枚举污染命名空间。',
    detail: [
      '传统 enum 的枚举值泄漏到外层作用域，且会隐式转换为整型（带来意外的比较/运算）。',
      'enum class 把枚举值限制在枚举名作用域内（Color::Red），且不会隐式转换给 int，必须显式 cast。',
      '可指定底层类型：enum class Mode : uint8_t { ... }，控制 ABI 大小与序列化布局。'
    ],
    notes: [
      '需要底层整型参与位运算时，enum class 仍可用 static_cast 转回整数，或用 enum（非 class）但小心作用域污染。'
    ],
    example:
      'enum class Color { Red, Green, Blue };   // 强类型\n' +
      'enum class Permission : uint8_t { Read = 1, Write = 2 };\n\n' +
      'Color c = Color::Red;\n' +
      '// if (c == 0) ...        // ✘ 不能隐式转 int\n' +
      '// int x = c;             // ✘ 必须 static_cast<int>(c)\n\n' +
      '// 传统 enum 的坑：\n' +
      'enum Old { A, B };\n' +
      '// int y = A;             // ✔ 隐式转换，容易出 bug'
  },
  {
    id: 'lambda11',
    title: 'Lambda 表达式',
    category: '核心语言',
    version: 'C++11',
    level: '入门',
    summary: '[capture](params){ body } 就地定义匿名函数对象，STL 算法的好搭档。',
    detail: [
      'Lambda 本质是编译器生成的带 operator() 的闭包类，捕获列表决定它能访问哪些外部变量。',
      '捕获方式：值捕获 [x]、引用捕获 [&x]、[=] 全部值捕获、[&] 全部引用捕获、混合 [&, x]（除 x 外都引用）。',
      'mutable 让按值捕获的变量可在函数体内修改（默认 const 成员函数）。',
      '无捕获 lambda 可隐式转换为函数指针，方便对接 C 风格回调。'
    ],
    notes: [
      '引用捕获的变量生命周期必须长于 lambda 执行期（异步场景极易悬空）。',
      'std::function 包裹 lambda 会有类型擦除的微小分配开销，热路径可用模板参数保持泛型。'
    ],
    example:
      '#include <algorithm>\n' +
      '#include <vector>\n\n' +
      'std::vector<int> v{3, 1, 4, 1, 5};\n' +
      'std::sort(v.begin(), v.end(), [](int a, int b) { return a > b; });  // 降序\n\n' +
      'int threshold = 2;\n' +
      'auto big = std::count_if(v.begin(), v.end(), [threshold](int x) {\n' +
      '    return x > threshold;     // 值捕获 threshold\n' +
      '});\n\n' +
      'int sum = 0;\n' +
      'std::for_each(v.begin(), v.end(), [&sum](int x) { sum += x; });  // 引用捕获求和'
  },
  {
    id: 'constexpr11',
    title: 'constexpr 编译期常量',
    category: '核心语言',
    version: 'C++11',
    level: '进阶',
    summary: 'constexpr 把函数/变量标记为可在编译期求值，编译期算出查表与常量。',
    detail: [
      'constexpr 变量必须在编译期可知；constexpr 函数若传入编译期常量实参则结果也是编译期常量。',
      'C++11 的 constexpr 函数限制很严：只能有一条 return 语句（递归是允许的替代手法），不能含循环或局部变量。',
      '用途：定义数组大小、模板非类型参数、编译期校验（配合 static_assert）。',
      'C++14/17 逐版放宽（见 C++14、C++17 条目）。'
    ],
    notes: [
      'constexpr 函数也可以在运行期调用（当实参不是常量时），此时退化为普通函数。'
    ],
    example:
      'constexpr int factorial(int n) {\n' +
      '    return n <= 1 ? 1 : n * factorial(n - 1);   // C++11 只允许条件+递归\n' +
      '}\n\n' +
      'constexpr int N = factorial(5);     // 编译期算得 120\n' +
      'int arr[N];                        // 数组大小可为 constexpr\n' +
      'static_assert(N == 120, "compile time");\n\n' +
      '// 也可在运行期使用\n' +
      'int x = factorial(someRuntimeValue);'
  },
  {
    id: 'uniform-init',
    title: '统一初始化与初始化列表',
    category: '核心语言',
    version: 'C++11',
    level: '入门',
    summary: '花括号 {} 初始化万物，std::initializer_list 支持 {1,2,3} 构造。',
    detail: [
      '{} 可用于变量、数组、聚合、类成员、返回值等几乎所有初始化场景，行为一致且禁止缩窄转换。',
      'std::initializer_list<T> 让 vector({1,2,3})、map 这样的构造接收花括号列表，库容器大量支持它。',
      'std::make_shared<T>(...) 与 { ... } 不能混用，需用 push_back/emplace 或在圆括号里显式 initializer_list。'
    ],
    notes: [
      '"最令人头疼的解析"：A a(()); 是函数声明而非对象——统一初始化也无法完全避免，vector<int> v(istream_iterator...) 用圆括号。',
      '花括号初始化会优先匹配 initializer_list 构造，可能导致与期望的 (int,int) 构造歧义。'
    ],
    example:
      'struct Point { int x, y; };\n' +
      'Point p{1, 2};                 // 聚合初始化\n' +
      'int a[]{1, 2, 3};              // 数组\n' +
      'double b[]{1.0, 2.5};\n\n' +
      '#include <vector>\n' +
      'std::vector<int> v{1, 2, 3, 4};        // initializer_list 构造\n' +
      'std::vector<std::string> names{"a", "b"};\n\n' +
      'int narrow = 5;\n' +
      '// char c{999};               // ✘ 缩窄转换在 {} 里被禁止\n' +
      'char c{5};                     // ✔'
  },
  {
    id: 'default-delete',
    title: '=default 与 =delete',
    category: '核心语言',
    version: 'C++11',
    level: '进阶',
    summary: '显式要求/禁止编译器生成特殊成员函数，精确控制类的可拷贝可移动性。',
    detail: [
      '=default 让编译器生成默认实现（构造/拷贝/移动/析构），行为与手写一致且可能更高效（trivial）。',
      '=delete 显式删除某函数，常用于禁止拷贝（把拷贝构造与拷贝赋值 =delete 得到"只移动类型"）。',
      '五大函数规则：声明了任意析构/拷贝/移动之一，编译器对其它成员的行为会改变——用 =default/=delete 显式表达意图最安全。'
    ],
    notes: [
      '删除函数不必是成员，也可删除普通函数重载以屏蔽某类实参（如禁止 bool 隐式转换的重载）。'
    ],
    example:
      'class NonCopyable {\n' +
      'public:\n' +
      '    NonCopyable() = default;            // 显式要默认构造\n' +
      '    NonCopyable(const NonCopyable&) = delete;   // 禁止拷贝\n' +
      '    NonCopyable& operator=(const NonCopyable&) = delete;\n' +
      '    NonCopyable(NonCopyable&&) = default;       // 允许移动\n' +
      '    NonCopyable& operator=(NonCopyable&&) = default;\n' +
      '};\n\n' +
      '// 阻止隐式 bool 转换导致的误用\n' +
      'void process(int);\n' +
      'void process(bool) = delete;    // 传入 bool 直接编译失败'
  },
  {
    id: 'type-traits',
    title: '类型萃取与 static_assert',
    category: '模板元编程',
    version: 'C++11',
    level: '高级',
    summary: '编译期"询问类型性质"——<type_traits> 与 static_assert 编译期断言。',
    detail: [
      'std::is_integral<T>、std::is_same_v<T,U>、std::enable_if_t 等 trait 在编译期描述类型性质，是 SFINAE 与概念出现前的约束手段。',
      'static_assert(bool_expr, "message") 在编译期检查条件，不满足直接报错，是模板库的防护网。',
      '配合 std::enable_if 可以"按类型特征启用/禁用"某个重载或特化。'
    ],
    notes: [
      'C++20 的 Concepts 是 type_traits + enable_if 的人体工学升级版，新代码优先用概念。'
    ],
    example:
      '#include <type_traits>\n\n' +
      'template <typename T>\n' +
      'T add(T a, T b) {\n' +
      '    static_assert(std::is_arithmetic_v<T>, "T 必须是算术类型");\n' +
      '    return a + b;\n' +
      '}\n\n' +
      '// SFINAE 按特征启用重载\n' +
      'template <typename T>\n' +
      'typename std::enable_if<std::is_pointer_v<T>, void>::type\n' +
      '    reset(T& p) { delete p; p = nullptr; }'
  },
  {
    id: 'thread-lib',
    title: '线程库 <thread> / <mutex> / <atomic>',
    category: '并发',
    version: 'C++11',
    level: '进阶',
    summary: '标准终于自带多线程：std::thread、std::mutex、std::atomic、条件变量。',
    detail: [
      'std::thread 封装操作系统线程，join() 等待结束、detach() 分离；忘记 join 会使程序 terminate。',
      'std::mutex + std::lock_guard/std::unique_lock 提供 RAII 加锁；std::condition_variable 做线程间通知。',
      'std::atomic<T> 提供无锁原子操作，适合计数器、标志位，比互斥锁轻得多。',
      'std::async / std::future 提供更高层的异步任务抽象（见并行/异步库条目）。'
    ],
    notes: [
      'std::thread 不可拷贝，必须用 std::move 转移；容器存线程用 emplace_back 或 push_back(move)。',
      '数据竞争不会编译报错，必须靠原子/锁保护——善用 ThreadSanitizer 检测。'
    ],
    example:
      '#include <thread>\n' +
      '#include <mutex>\n' +
      '#include <atomic>\n\n' +
      'std::mutex mtx;\n' +
      'int shared = 0;\n' +
      'std::atomic<int> counter{0};\n\n' +
      'void worker() {\n' +
      '    {\n' +
      '        std::lock_guard<std::mutex> lk(mtx);\n' +
      '        ++shared;\n' +
      '    }\n' +
      '    counter.fetch_add(1, std::memory_order_relaxed);\n' +
      '}\n\n' +
      'int main() {\n' +
      '    std::thread t1(worker), t2(worker);\n' +
      '    t1.join(); t2.join();\n' +
      '}'
  },
  {
    id: 'override-final',
    title: 'override 与 final 说明符',
    category: '核心语言',
    version: 'C++11',
    level: '入门',
    summary: 'override 显式标记重写，final 禁止进一步重写/继承——编译期抓出拼写错误。',
    detail: [
      'override 要求该函数确实重写基类虚函数；基类改了签名或不是虚函数时，误写的"伪重写"会立即编译报错。',
      'final 用于虚函数表示不可再被派生类重写；用于类表示整个类不可被继承。',
      '两者只是说明符（不是关键字），但强烈建议给每个重写函数都加 override。'
    ],
    example:
      'struct Base {\n' +
      '    virtual void draw() const;\n' +
      '    virtual int id() const;\n' +
      '};\n\n' +
      'struct Derived : Base {\n' +
      '    void draw() const override;       // ✔ 确实重写了\n' +
      '    // int Id() const override;       // ✘ 编译错误：没有名为 Id 的基类虚函数\n' +
      '};\n\n' +
      'struct Leaf final : Derived {\n' +
      '    // void draw() const override;     // ✘ 基类已 final，不能再重写\n' +
      '};\n\n' +
      '// class Sealed final { };\n' +
      '// class Bad : Sealed { };             // ✘ 不能继承 final 类'
  },
  {
    id: 'noexcept',
    title: 'noexcept 说明符',
    category: '核心语言',
    version: 'C++11',
    level: '进阶',
    summary: '声明函数不抛异常，既是契约也是性能提示（移动/ swap 应标 noexcept）。',
    detail: [
      'noexcept 告诉编译器该函数不会抛异常（抛了则直接调用 std::terminate）；运行时几乎零成本。',
      '标准库在扩容容器时，若元素类型的移动构造标了 noexcept 就优先移动，否则回退到拷贝——所以移动操作 noexcept 很重要。',
      'noexcept 也可作为运算符 noexcept(expr) 在编译期探询表达式是否会抛异常。'
    ],
    example:
      'void log() noexcept;               // 承诺不抛异常\n\n' +
      '// 移动构造标 noexcept 才能让 vector 放心地移动\n' +
      'struct Widget {\n' +
      '    Widget(Widget&&) noexcept = default;\n' +
      '    Widget& operator=(Widget&&) noexcept = default;\n' +
      '};\n\n' +
      'template <typename T>\n' +
      'void move_if_noexcept(T& dst, T& src) {\n' +
      '    if constexpr (noexcept(T(std::declval<T&&>()))) {\n' +
      '        dst = std::move(src);   // 可能 noexcept 才移动\n' +
      '    }\n' +
      '}'
  }
];
