// C++14 特性（C++11 的打磨版）
module.exports = [
  {
    id: 'generic-lambda14',
    title: '泛型 Lambda（参数 auto）',
    category: '核心语言',
    version: 'C++14',
    level: '入门',
    summary: 'C++14 允许 lambda 参数用 auto，于是匿名函数也能"模板化"。',
    detail: [
      '[] (auto x, auto y) { return x + y; } 等价于编译器生成带模板 operator() 的闭包，调用时按实参推导类型。',
      '这把 C++11 lambda（固定类型参数）升级为可作用于任意类型的泛型可调用对象，常用于算法回调。',
      'C++20 进一步允许 []<typename T>(T x) 显式模板参数列表，可访问 T 本身（见 C++20 条目）。'
    ],
    example:
      'auto add = [](auto a, auto b) { return a + b; };\n' +
      'add(1, 2);                       // int\n' +
      'add(1.5, 2.5);                   // double\n' +
      'add(std::string("a"), "b");      // string\n\n' +
      'std::vector<int> v{1,2,3};\n' +
      'std::for_each(v.begin(), v.end(), [](auto x) { std::cout << x; });'
  },
  {
    id: 'return-type-deduction',
    title: '函数返回类型推导',
    category: '核心语言',
    version: 'C++14',
    level: '入门',
    summary: 'auto 作函数返回类型由 return 语句推导；多返回分支须一致可推导。',
    detail: [
      '返回类型写 auto，编译器根据所有 return 表达式推导；有循环/分支时要求每个分支都能推导出相同类型。',
      '递归函数也能用 auto 返回，只要第一个 return 不是递归调用自身（需至少一个非递归出口）。',
      '配合 decltype(auto) 可让返回类型完美保留引用（常用于转发函数）。'
    ],
    notes: [
      '返回 auto 的函数定义与声明必须放在同一编译单元可见处（头文件 inline），否则推导结果不一致。'
    ],
    example:
      'auto square(double x) { return x * x; }    // 推导为 double\n' +
      'auto make() { return std::vector<int>{1,2,3}; }\n\n' +
      '// 保留引用的完美转发返回\n' +
      'template <typename F, typename T>\n' +
      'decltype(auto) call(F&& f, T&& t) {\n' +
      '    return std::forward<F>(f)(std::forward<T>(t));\n' +
      '}\n\n' +
      '// 递归：至少一个非递归出口\n' +
      'auto fib(int n) -> int { return n < 2 ? n : fib(n-1) + fib(n-2); }'
  },
  {
    id: 'variable-templates',
    title: '变量模板',
    category: '模板元编程',
    version: 'C++14',
    level: '进阶',
    summary: 'template<typename T> constexpr T pi = T(3.14159265...); 按类型生成常量。',
    detail: [
      'C++14 允许模板直接作用于变量（不仅是类/函数），最经典的用途是按类型参数化的常量。',
      'std::numeric_limits、ε 阈值等不再需要繁琐的 traits::value 后缀，直接 pi<double> 即可。',
      '标准库 <limits> 虽未全部改成语量模板，但社区惯用法已大量采用。'
    ],
    example:
      'template <typename T>\n' +
      'constexpr T pi = T(3.1415926535897932385L);\n\n' +
      'template <typename T>\n' +
      'constexpr T epsilon = std::numeric_limits<T>::epsilon();\n\n' +
      'double x = pi<double> * 2.0;\n' +
      'float  y = pi<float> * 2.0f;\n' +
      'static_assert(pi<int> == 3, "int 版的 pi 取整数");'
  },
  {
    id: 'make-unique14',
    title: 'std::make_unique',
    category: '标准库',
    version: 'C++14',
    level: '入门',
    summary: 'C++14 补齐了 make_shared 的"孪生兄弟"，统一安全创建独占指针。',
    detail: [
      'C++11 有 make_shared 却没有 make_unique（委员会疏忽，C++14 补回），现在创建 unique_ptr 也应优先用工厂函数。',
      'make_unique<T>(args) 避免裸指针暴露、异常安全（不会因中间步骤抛异常而内存泄漏），且代码更短。',
      '需要自定义删除器时无法用 make_unique，此时才回退 new 显式构造。'
    ],
    example:
      'auto p = std::make_unique<int>(42);\n' +
      'auto v = std::make_unique<std::vector<int>>(3, 1);   // 3 个 1\n\n' +
      '// 对比不推荐的写法\n' +
      '// std::unique_ptr<int> q(new int(42));   // 异常不安全、冗长\n\n' +
      'struct Widget { Widget(int, double); };\n' +
      'auto w = std::make_unique<Widget>(1, 2.0);'
  },
  {
    id: 'digit-sep-binary',
    title: '数字分隔符与二进制字面量',
    category: '核心语言',
    version: 'C++14',
    level: '入门',
    summary: "100'000 提升可读性；0b1010 直接写二进制常量。",
    detail: [
      '单引号可充当数字字面量分隔符（编译期忽略），任意位置都行，纯提升可读性。',
      '0b/0B 前缀写二进制字面量，配合位运算直观。',
      '可与后缀、十六进制自由组合，例如 0xFFFFuLL、二进制字面量等都能插分隔符增强可读性。'
    ],
    example:
      'int million = 1\'000\'000;          // 单引号分隔，清晰\n' +
      'int mask = 0b1010\'1111;           // 二进制字面量\n' +
      'long long big = 0xFFFF\'FFFF;      // 16 进制也行\n' +
      'double pi = 3.14159\'26535;        // 浮点也能用分隔符'
  },
  {
    id: 'lambda-init-capture',
    title: 'Lambda 初始化捕获',
    category: '核心语言',
    version: 'C++14',
    level: '进阶',
    summary: '[x = std::move(y)] 在捕获时就地构造/移动，可移动不可拷贝的对象。',
    detail: [
      'C++11 只能按值/引用捕获已存在的变量；C++14 允许 [name = expr] 形式在闭包内"就地生成"成员。',
      '最常见的用途是 std::move 一个 unique_ptr 进 lambda：[ptr = std::move(up)] {}，C++11 做不到。',
      '也可用于重命名、计算捕获默认值：[sum = a + b] {}。'
    ],
    example:
      '#include <memory>\n\n' +
      'std::unique_ptr<Widget> up = make_widget();\n' +
      '// C++11 不能值捕获 unique_ptr（不可拷贝）\n' +
      'auto task = [w = std::move(up)] {            // C++14 移动进闭包\n' +
      '    w->run();\n' +
      '};\n\n' +
      'int base = 10;\n' +
      'auto adder = [base = base + 1](int x) { return x + base; };  // base 已变为 11\n\n' +
      '// 延迟执行时捕获副本\n' +
      'auto guard = [self = shared_from_this()] { self->cleanup(); };'
  },
  {
    id: 'constexpr14',
    title: 'constexpr 放宽（局部变量与循环）',
    category: '核心语言',
    version: 'C++14',
    level: '进阶',
    summary: 'C++14 允许 constexpr 函数内有局部变量、循环与多个语句。',
    detail: [
      'C++11 的 constexpr 函数被限制为单一 return；C++14 放宽为普通语句：可声明变量、用 if/for/while、多语句。',
      '这极大扩展了编译期可计算的范围（如编译期查找表、编译期字符串处理），为 C++20 的 constexpr 虚函数/动态分配铺路。',
      'constexpr 函数仍不可含有未定义行为、goto、非 constexpr 调用等。'
    ],
    example:
      'constexpr int sum_to(int n) {\n' +
      '    int s = 0;\n' +
      '    for (int i = 1; i <= n; ++i) s += i;   // C++14 允许循环\n' +
      '    return s;\n' +
      '}\n\n' +
      'static_assert(sum_to(100) == 5050, "compile time loop");\n\n' +
      'constexpr int gcd(int a, int b) {\n' +
      '    while (b) { int t = b; b = a % b; a = t; }\n' +
      '    return a;\n' +
      '}'
  },
  {
    id: 'deprecated-attr',
    title: '[deprecated] 属性',
    category: '核心语言',
    version: 'C++14',
    level: '入门',
    summary: '[[deprecated("改用 X")]] 标记即将废弃的 API，使用处触发编译器警告。',
    detail: [
      '[[deprecated]] 可用于类型、函数、变量、枚举值；带字符串说明时编译器会随警告打印该说明。',
      '配套 C++17 的 [[nodiscard]]、[[maybe_unused]]、[[fallthrough]] 一起构成标准属性体系。',
      '用于在保留兼容性的同时引导调用方迁移到新接口。'
    ],
    example:
      '[[deprecated("请改用 new_api()")]]\n' +
      'void old_api();\n\n' +
      'struct [[deprecated]] LegacyConfig { int v; };\n\n' +
      '// 使用时编译器告警：\n' +
      '// old_api();   // warning: \'old_api\' is deprecated: 请改用 new_api()'
  }
];
