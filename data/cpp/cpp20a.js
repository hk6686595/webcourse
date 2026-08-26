// C++20 特性 —— 第一部分：核心语言
module.exports = [
  {
    id: 'concepts',
    title: 'Concepts（概念）',
    category: '核心语言',
    status: 'C++20 核心',
    level: '进阶',
    summary: '给模板参数加上"契约"：requires 表达式约束类型必须支持的操作。',
    detail: [
      'Concepts 是编译期谓词，用于约束模板实参。错误信息从几百行模板报错变成一行清晰提示；重载决议也会优先选择满足更特化约束的版本。',
      '标准库预置了 std::integral、std::same_as、std::convertible_to、std::movable 等数十个概念，位于 <concepts> 头文件。',
      'requires 子句与 requires 表达式是两回事：前者放在模板上做过滤（requires (...)），后者直接书写"表达式是否合法"的检查（requires { ... }）。',
      '简写形式 void f(std::integral auto x) 可以不写模板头，直接用 auto 参数加概念约束。'
    ],
    notes: [
      '概念在语义上必须保持"可交换性"：对同一实参集合，无论在哪里检查都应给出相同结果，不要在概念里写副作用。',
      '约束的偏序规则：更"特化"的概念胜出，类似重载决议，这让标签分发变得优雅。'
    ],
    example:
      '#include <concepts>\n' +
      '#include <iostream>\n\n' +
      '// 定义概念：T 必须可哈希且可相等比较\n' +
      'template <typename T>\n' +
      'concept Hashable = requires(T a) {\n' +
      '    { std::hash<T>{}(a) } -> std::convertible_to<std::size_t>;\n' +
      '    { a == a } -> std::same_as<bool>;\n' +
      '};\n\n' +
      '// 用概念替代 class/typename\n' +
      'template <std::integral T>\n' +
      'T gcd(T a, T b) {\n' +
      '    while (b != 0) { T t = b; b = a % b; a = t; }\n' +
      '    return a;\n' +
      '}\n\n' +
      '// 缩写函数模板：auto 参数直接带概念\n' +
      'void print(std::integral auto value) {\n' +
      '    std::cout << value << "\\n";\n' +
      '}\n\n' +
      'gcd(12, 18);   // OK\n' +
      '// gcd(1.5, 2.5);  // ✘ 约束未满足，错误一目了然',
    example2Title: 'requires 子句做条件过滤',
    example2:
      '// 同名模板按约束偏序选择最合适的版本\n' +
      'template <typename T>\n' +
      'std::string describe(T) { return "未知类型"; }          // 兜底\n\n' +
      'template <std::integral T>\n' +
      'std::string describe(T) { return "整数"; }              // 更特化\n\n' +
      'template <std::floating_point T>\n' +
      'std::string describe(T) { return "浮点数"; }\n\n' +
      '// requires 表达式检查成员是否存在\n' +
      'template <typename T>\n' +
      'concept HasSize = requires(const T& c) {\n' +
      '    c.size();\n' +
      '    typename T::value_type;      // 还要求嵌套类型存在\n' +
      '};'
  },
  {
    id: 'modules',
    title: 'Modules（模块）',
    category: '核心语言',
    status: 'C++20 核心',
    level: '进阶',
    summary: 'import 替代 #include：真正的符号级导入，告别头文件重复解析。',
    detail: [
      '模块把接口与实现编译为二进制模块接口（.ifc/.pcm），宏不外泄、私有实现不泄漏、编译速度大幅提升、不再受 include guard 与包含顺序困扰。',
      'export module 声明模块；export 导出符号；未导出的声明只在模块内部可见——这是 #include 做不到的真正封装。',
      '标准库以 std.core / std.io 等命名模块提供（写作 import std;），MSVC 已完善支持，GCC/Clang 正在跟进。',
      '全局模块片段与头文件单元提供了向旧代码过渡的桥梁。'
    ],
    notes: [
      '构建系统支持尚在成熟中：CMake 3.28+ 对 C++20 模块有原生 target_sources FILE_SET 支持。',
      '同一模块的所有分区必须在同一编译选项下构建，混用不同编译器版本容易出错。'
    ],
    example:
      '// math.ixx —— 模块接口单元（MSVC 约定后缀 .ixx）\n' +
      'export module math;\n\n' +
      'export namespace math {\n' +
      '    int add(int a, int b) { return a + b; }\n' +
      '    constexpr double PI = 3.14159265358979;\n\n' +
      '    class Calculator {\n' +
      '    public:\n' +
      '        double area(double r) const { return PI * r * r; }\n' +
      '    };\n' +
      '}\n\n' +
      '// 内部细节不会被导出，宏也不会泄漏\n' +
      'static int helper() { return 42; }\n\n\n' +
      '// main.cpp —— 使用方\n' +
      'import math;\n' +
      'import std;              // 标准库模块（较新实现支持）\n\n' +
      'int main() {\n' +
      '    math::Calculator c;\n' +
      '    return c.area(1.0) > 0 ? math::add(1, 2) : 1;\n' +
      '}'
  },
  {
    id: 'coroutines',
    title: 'Coroutines（协程）',
    category: '核心语言',
    status: 'C++20 核心',
    level: '高级',
    summary: 'co_await / co_yield / co_return 三关键字，函数挂起与恢复的底层原语。',
    detail: [
      '任何包含 co_await/co_yield/co_return 的函数都是协程，编译器将其改写为状态机并在堆上分配协程帧（可被优化省略）。',
      'C++20 只提供语言层机制，没有标准库高层封装（generator 在 C++23 才有），实际使用需自定义 promise_type 或借助 cppcoro、folly::coro、asio awaitable 等第三方库。',
      '典型应用：异步网络 IO、惰性生成无限序列、协作式调度、用户态任务系统。'
    ],
    notes: [
      '协程帧默认堆分配且生命周期跨越挂起点，返回的 handle 必须负责 destroy，忘记就是内存泄漏。',
      'initial_suspend 返回 suspend_always 可实现惰性启动，避免"恢复已结束的协程"这类悬空错误。'
    ],
    example:
      '#include <coroutine>\n' +
      '#include <cstdint>\n\n' +
      '// 手写一个最简 Generator<T>\n' +
      'template <typename T>\n' +
      'struct Generator {\n' +
      '    struct promise_type {\n' +
      '        T current_value{};\n' +
      '        Generator get_return_object() {\n' +
      '            return Generator{std::coroutine_handle<promise_type>::from_promise(*this)};\n' +
      '        }\n' +
      '        std::suspend_always initial_suspend() noexcept { return {}; }\n' +
      '        std::suspend_always final_suspend() noexcept { return {}; }\n' +
      '        std::suspend_always yield_value(T value) { current_value = value; return {}; }\n' +
      '        void return_void() {}\n' +
      '        void unhandled_exception() { std::terminate(); }\n' +
      '    };\n\n' +
      '    std::coroutine_handle<promise_type> h_;\n' +
      '    explicit Generator(std::coroutine_handle<promise_type> h) : h_(h) {}\n' +
      '    ~Generator() { if (h_) h_.destroy(); }     // 别忘了销毁协程帧！\n\n' +
      '    bool next() { h_.resume(); return !h_.done(); }\n' +
      '    T value() const { return h_.promise().current_value; }\n' +
      '};\n\n' +
      '// 斐波那契无限序列\n' +
      'Generator<uint64_t> fibonacci() {\n' +
      '    uint64_t a = 0, b = 1;\n' +
      '    while (true) {\n' +
      '        co_yield a;\n' +
      '        auto t = a + b; a = b; b = t;\n' +
      '    }\n' +
      '}'
  },
  {
    id: 'coroutine-awaiters',
    title: 'Awaiter 原理：co_await 的展开机制',
    category: '核心语言',
    status: 'C++20 核心',
    level: '高级',
    summary: 'co_await expr 背后发生了什么：await_ready / await_suspend / await_resume 三件套。',
    detail: [
      'co_await expr 展开为：获取 awaiter（operator co_await 或 await_transform）→ 调 await_ready() → 挂起并调 await_suspend(handle) → 恢复时调 await_resume() 取结果。',
      'await_ready 返回 true 表示"不用挂起直接继续"，用于快速路径优化（如数据已就绪）。',
      'await_suspend 可返回 void、bool（false 表示不挂起）、或另一个 coroutine_handle（尾调用式跳转，避免栈增长）。',
      '理解这套机制就能自己写 Task/Job/Schedule 等 awaitable 类型，这是 C++ 异步框架的地基。'
    ],
    example:
      '#include <coroutine>\n\n' +
      '// 一个"立即完成"的最小 awaiter\n' +
      'struct Immediate {\n' +
      '    bool await_ready() noexcept { return true; }   // 不用挂起\n' +
      '    void await_suspend(std::coroutine_handle<>) noexcept {}\n' +
      '    int await_resume() noexcept { return 42; }     // 作为 co_await 的值\n' +
      '};\n\n' +
      '// 定时等待型 awaiter 的骨架\n' +
      'struct SleepFor {\n' +
      '    std::chrono::milliseconds dur;\n' +
      '    bool await_ready() noexcept { return dur.count() <= 0; }\n' +
      '    void await_suspend(std::coroutine_handle<> h) {\n' +
      '        timer_arm(dur, [h]{ h.resume(); });   // 到期后恢复协程\n' +
      '    }\n' +
      '    void await_resume() noexcept {}\n' +
      '};\n\n' +
      '// 用法：task 协程内\n' +
      '// int answer = co_await Immediate{};      // 42\n' +
      '// co_await SleepFor{100ms};               // 挂起 100ms'
  },
  {
    id: 'three-way-comparison',
    title: '<=> 三路比较（太空船运算符）',
    category: '核心语言',
    status: 'C++20 核心',
    level: '入门',
    summary: '= default 一行生成全部六个比较运算符，告别手写 operator==/</>…。',
    detail: [
      'operator<=> 返回 std::strong_ordering / weak_ordering / partial_ordering，编译器据此自动推导 ==、!=、<、<=、>、>= 全部关系。',
      '默认语义按成员字典序逐一比较。浮点数得到 partial_ordering（存在 unordered）；忽略大小写字符串等"等价但不相同"的场景用 weak_ordering。',
      '只 default <=> 时 == 不会自动生成（性能考虑），通常把 operator== 也一起 default。'
    ],
    notes: [
      '自定义 <=> 后仍建议显式 default operator==，否则涉及无序比较的类型可能缺少相等判断。',
      '比较运算符重载后，std::sort、map、set 等容器自动可用，无需再传比较器。'
    ],
    example:
      '#include <compare>\n' +
      '#include <string>\n' +
      '#include <set>\n\n' +
      'struct Point {\n' +
      '    int x, y;\n' +
      '    auto operator<=>(const Point&) const = default;   // 一行顶六行\n' +
      '    bool operator==(const Point&) const = default;\n' +
      '};\n\n' +
      'struct Version {\n' +
      '    int major, minor, patch;\n' +
      '    std::string tag;\n' +
      '    auto operator<=>(const Version&) const = default;\n' +
      '};\n\n' +
      'Point p1{1, 2}, p2{1, 3};\n' +
      'bool ok = (p1 <=> p2) < 0;   // true\n\n' +
      'Version v1{1,4,0,""}, v2{1,10,0,""};\n' +
      'bool older = v1 < v2;        // true：字典序逐字段比较\n\n' +
      'std::set<Point> s{{1,2}, {3,4}};   // 自动可用于有序容器'
  },
  {
    id: 'designated-initializers',
    title: '指定初始化器',
    category: '核心语言',
    status: 'C++20 核心',
    level: '入门',
    summary: '.field = value 的聚合初始化写法（源自 C99），跳过字段顺序烦恼。',
    detail: [
      '仅适用于聚合类型（无用户构造函数、无私有非静态成员等）；初始化必须按声明顺序进行，不能跳跃或乱序。',
      '配合 auto 返回结构体的工厂函数非常清爽，配置结构体可以只覆盖关心的字段。',
      '与默认成员初始化器完美配合：未指定的字段走声明处的默认值，配置项"只写关心的部分"成为惯用法。'
    ],
    example:
      '#include <string>\n\n' +
      'struct ServerConfig {\n' +
      '    std::string host = "127.0.0.1";\n' +
      '    int         port = 8080;\n' +
      '    bool        tls  = false;\n' +
      '    int         timeout_ms = 5000;\n' +
      '};\n\n' +
      'ServerConfig cfg{\n' +
      '    .host = "api.example.com",\n' +
      '    .port = 443,\n' +
      '    .tls  = true,\n' +
      '};   // timeout_ms 走默认值 5000\n\n' +
      '// ServerConfig bad{ .tls=true, .host="x" };  // ✘ 必须按声明顺序\n' +
      '// ServerConfig bad2{ .timeout_ms=100 };      // ✘ 不能跳跃前面的字段'
  },
  {
    id: 'constexpr-boost',
    title: 'constexpr 增强 / consteval / constinit',
    category: '核心语言',
    status: 'C++20 核心',
    level: '高级',
    summary: '虚函数、动态分配都能进 constexpr；consteval 强制编译期执行。',
    detail: [
      'C++20 大幅放宽常量求值限制：constexpr 函数现在支持虚函数调用、动态分配（std::vector/std::string constexpr 化）、try-catch（不能真正抛出）。',
      'consteval 函数是"立即函数"：只能在编译期执行，传入运行时值直接编译失败——适合生成查找表、校验常量。',
      'constinit 保证静态存储变量在编译期完成初始化，消灭静态初始化顺序惨案（static initialization order fiasco），但变量本身仍可变。'
    ],
    notes: [
      'constexpr vector/string 在编译期创建，运行期使用没问题，但不能"逃逸"到运行期继续修改后再次进入常量求值。',
      'constinit 与 constexpr 的区别：constexpr 隐含 const 且必须常量初始化；constinit 只保证初始化时机，允许后续修改。'
    ],
    example:
      '#include <vector>\n' +
      '#include <array>\n\n' +
      '// 编译期生成素数表 —— vector 也能用了\n' +
      'consteval std::vector<int> primes_below(int limit) {\n' +
      '    std::vector<int> ps;\n' +
      '    for (int n = 2; n < limit; ++n) {\n' +
      '        bool prime = true;\n' +
      '        for (int d = 2; d * d <= n; ++d)\n' +
      '            if (n % d == 0) { prime = false; break; }\n' +
      '        if (prime) ps.push_back(n);\n' +
      '    }\n' +
      '    return ps;\n' +
      '}\n\n' +
      'constinit static int request_counter = 0;   // 编译期清零，运行期可变\n' +
      '\n' +
      'constexpr int sum(std::vector<int> v) {\n' +
      '    int s = 0;\n' +
      '    for (int x : v) s += x;      // 循环 + 动态内存，全部 OK\n' +
      '    return s;\n' +
      '}\n\n' +
      'constexpr auto ps = primes_below(50);   // 编译期算好\n' +
      'static_assert(sum({1,2,3}) == 6);'
  },
  {
    id: 'lambda-improvements',
    title: 'Lambda 增强：模板形参与捕获',
    category: '核心语言',
    status: 'C++20 核心',
    level: '进阶',
    summary: '泛型 lambda 可显式声明模板参数；无状态 lambda 默认可构造可赋值。',
    detail: [
      'C++20 允许完整模板参数列表 []<typename T>(T x)，解决某些场景下无法指定具体类型的痛点（如取 vector 元素类型）。',
      '无捕获 lambda 现在可以默认构造和赋值，能放进 map 当比较器、作为模板类型参数。',
      'lambda 初始化捕获中解包结构化绑定变量成为合法行为（C++20 放宽）。'
    ],
    example:
      '#include <algorithm>\n' +
      '#include <vector>\n' +
      '#include <string>\n\n' +
      '// 显式模板参数列表\n' +
      'auto concat = []<typename T>(const std::vector<T>& a,\n' +
      '                             const std::vector<T>& b) {\n' +
      '    std::vector<T> r(a);\n' +
      '    r.insert(r.end(), b.begin(), b.end());\n' +
      '    return r;\n' +
      '};\n\n' +
      '// 对元素类型编程\n' +
      'auto size_in_bytes = []<typename T>(const std::vector<T>& v) {\n' +
      '    return sizeof(T) * v.size();\n' +
      '};\n\n' +
      '// 无状态 lambda 可默认构造（如作为关联容器的比较器类型）\n' +
      'struct CaseInsensitiveLess {\n' +
      '    bool operator()(const std::string& a, const std::string& b) const;\n' +
      '};\n\n' +
      'std::vector<int> v{3, 1, 2};\n' +
      'std::sort(v.begin(), v.end(), [](int a, int b){ return a > b; });'
  },
  {
    id: 'misc-core',
    title: '其他核心改进速览',
    category: '核心语言',
    status: 'C++20 核心',
    level: '入门',
    summary: '[[likely]] [[no_unique_address]]、括号初始化聚合体、char8_t……一批中小特性。',
    detail: [
      '属性标注分支概率帮助优化器安排代码布局；[[no_unique_address]] 显式启用空成员优化，压缩组合式类布局。',
      '聚合体可以用括号初始化（Agg v(1,2)），让 make_xxx 风格工厂统一处理聚合与非聚合类型。',
      'char8_t/u8char 把 UTF-8 字符从 char 中独立出来加强类型安全（实践中有争议，需注意第三方库兼容）。',
      '另外还有：模板形参列表中的 lambda、删除了很多上下文中的冗余 typename、立即函数内的 asm 禁令等。'
    ],
    example:
      '#include <map>\n' +
      '#include <string>\n\n' +
      '// 结构化绑定可以直接捕获到 lambda（C++20）\n' +
      'std::map<std::string, int> ages{{"alice", 30}, {"bob", 25}};\n' +
      'for (const auto& [name, age] : ages) {\n' +
      '    auto show = [name, age] { /* 直接捕获解构出的变量 */ };\n' +
      '}\n\n' +
      '// 分支预测提示\n' +
      'int hot_path(bool rare_condition, int x) {\n' +
      '    if (rare_condition) [[unlikely]] {\n' +
      '        return -1;\n' +
      '    }\n' +
      '    return x * 2;   // 常规路径\n' +
      '}\n\n' +
      'struct Empty {};\n' +
      'struct WithEBO {\n' +
      '    [[no_unique_address]] Empty e;   // 不占空间（空成员优化）\n' +
      '    int value;\n' +
      '};\n' +
      'static_assert(sizeof(WithEBO) == sizeof(int));'
  }
];
