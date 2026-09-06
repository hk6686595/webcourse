// C++17 特性（现代 C++ 成熟期）
module.exports = [
  {
    id: 'structured-bindings',
    title: '结构化绑定',
    category: '核心语言',
    version: 'C++17',
    level: '入门',
    summary: 'auto [a, b] = pair; 一行拆开 tuple/pair/结构体/数组的元素。',
    detail: [
      '结构化绑定能解构 std::pair、std::tuple、数组以及"所有公开成员同类型可绑定"的聚合体。',
      '遍历 map 从此告别 kv.first/kv.second：for (const auto& [k, v] : m) 直接拿到键与值。',
      '可以绑定为引用 auto& [x, y] 来修改被解构对象；可用 tie 把值写回已有变量。'
    ],
    notes: [
      'C++17 的结构化绑定不能声明为 static 或 constexpr；解构数组数量必须匹配。'
    ],
    example:
      '#include <map>\n' +
      '#include <tuple>\n\n' +
      'std::map<int, std::string> m{{1, "a"}, {2, "b"}};\n' +
      'for (const auto& [id, name] : m)\n' +
      '    std::cout << id << ":" << name << "\\n";\n\n' +
      'std::tuple<int, double, std::string> t{1, 2.5, "x"};\n' +
      'auto [i, d, s] = t;\n\n' +
      '// 修改被解构的对象\n' +
      'std::pair<int, int> p{1, 2};\n' +
      'auto& [x, y] = p;\n' +
      'x = 10;                       // p.first 变成 10\n\n' +
      '// 写回已有变量\n' +
      'int a, b; std::tie(a, b) = std::make_pair(3, 4);'
  },
  {
    id: 'if-init',
    title: 'if / switch 带初始化器',
    category: '核心语言',
    version: 'C++17',
    level: '入门',
    summary: 'if (auto p = f(); p) 把变量作用域限制在分支内，终结"先声明再判断"。',
    detail: [
      'if (init; cond) 与 switch (init; cond) 在条件前先做初始化，变量只在该语句及其分支作用域内可见。',
      '典型场景：查找后立刻判空、加锁后判状态——避免把临时变量泄漏到外层作用域。',
      '与结构化绑定配合尤其优雅：if (auto [it, ok] = m.emplace(...); ok) { ... }。'
    ],
    example:
      '// 之前：变量泄漏到外层\n' +
      'auto it = m.find(key);\n' +
      'if (it != m.end()) { /* ... */ }\n\n' +
      '// C++17：作用域收紧\n' +
      'if (auto it = m.find(key); it != m.end()) {\n' +
      '    use(it->second);\n' +
      '}\n\n' +
      '// 加锁后判状态\n' +
      'if (std::lock_guard lk(mtx); ready) {\n' +
      '    process();\n' +
      '}\n\n' +
      'if (auto [pos, inserted] = cache.emplace(k, v); inserted) {\n' +
      '    std::cout << "新插入: " << pos->second << "\\n";\n' +
      '}'
  },
  {
    id: 'if-constexpr',
    title: 'if constexpr 编译期分支',
    category: '模板元编程',
    version: 'C++17',
    level: '高级',
    summary: 'if constexpr (cond) 不满足的分支直接不参与编译，现代模板分派的利器。',
    detail: [
      'if constexpr 的条件必须是编译期布尔常量；不满足的分支不会被实例化，因此可以写"对某种类型合法、对另一种类型会编译失败"的代码而不报错。',
      '它取代了 C++11/14 那种靠标签分发、SFINAE 才能实现的"按类型走不同逻辑"，可读性大幅提升。',
      '常用于泛型序列化、类型分派、递归模板的终止条件。'
    ],
    notes: [
      'if constexpr 分支内仍要满足基本语法（不能有关键字错误），但语义错误在丢弃分支里不会触发。'
    ],
    example:
      '#include <type_traits>\n\n' +
      'template <typename T>\n' +
      'void serialize(std::ostream& os, const T& v) {\n' +
      '    if constexpr (std::is_pointer_v<T>) {\n' +
      '        if (v) serialize(os, *v);     // 指针：解引用后递归\n' +
      '    } else if constexpr (std::is_arithmetic_v<T>) {\n' +
      '        os << v;\n' +
      '    } else {\n' +
      '        v.serialize(os);               // 自定义类型\n' +
      '    }\n' +
      '}\n\n' +
      '// 终止递归：编译期 false 分支被丢弃，不会实例化 *v\n' +
      'template <typename T>\n' +
      'T sqrt_impl(T x, int n) { return n == 0 ? x : sqrt_impl(x, n - 1); }'
  },
  {
    id: 'fold-expressions',
    title: '折叠表达式',
    category: '模板元编程',
    version: 'C++17',
    level: '高级',
    summary: '(... op args) 一行对参数包做"累加/逻辑与/逗号序列"展开。',
    detail: [
      '折叠表达式让变长模板参数包用 (pack op ...) 或 (init op ... op pack) 形式折叠成单个表达式，无需写递归。',
      '支持所有二元运算符：+ - * / && || , == 等，以及一元左/右折叠。',
      '常见用途：求和、类型检查 (&& ...)、打印 (<< ... <<)、可变参数构造转发。'
    ],
    example:
      'template <typename... Ts>\n' +
      'auto sum(Ts... ts) { return (ts + ...); }            // 左折叠求和\n\n' +
      'template <typename... Ts>\n' +
      'bool all_true(Ts... ts) { return (ts && ...); }      // 逻辑与\n\n' +
      'template <typename... Args>\n' +
      'void print_all(Args&&... args) {\n' +
      '    (std::cout << ... << args) << "\\n";             // 逗号/流式打印\n' +
      '}\n\n' +
      '// 带初值的折叠：避免空包无操作数\n' +
      'template <typename... Ts>\n' +
      'int total(Ts... ts) { return (0 + ... + ts); }'
  },
  {
    id: 'ctad',
    title: '类模板参数推导（CTAD）',
    category: '核心语言',
    version: 'C++17',
    level: '入门',
    summary: '从构造函数实参自动推导模板参数，写 vector v{1,2,3} 不必 vector<int>。',
    detail: [
      'CTAD 让编译器根据构造实参推导类模板的类型参数，标准容器、智能指针、锁都受益。',
      '可写 std::pair p{1, "x"}、std::lock_guard lk(mtx)（推导到 unique_lock 等）、std::array a{1,2,3}。',
      '也可提供推导指引（deduction guide）自定义推导规则。'
    ],
    notes: [
      '聚合类型的 CTAD 可能推导出你不想要的引用类型，必要时显式标注。'
    ],
    example:
      'std::vector v{1, 2, 3};             // 推导 vector<int>\n' +
      'std::pair p{1, "hi"};               // 推导 pair<int, const char*>\n' +
      'std::array a{1, 2, 3};              // 推导 array<int, 3>\n' +
      'std::lock_guard lk(mtx);            // 推导 lock_guard<decltype(mtx)>\n\n' +
      '// 显式仍允许\n' +
      'std::vector<int> w{1, 2, 3};'
  },
  {
    id: 'string-view17',
    title: 'std::string_view 只读视图',
    category: '标准库',
    version: 'C++17',
    level: '进阶',
    summary: '指向下标字符串的 (指针,长度) 视图，函数传参免拷贝、免分配。',
    detail: [
      'string_view 不拥有字符串，只是 (const char*, size) 的视图，拷贝是 O(1)，非常适合作为函数参数接收字符串字面量或字符串片段。',
      '接口设计与 std::string 高度一致（substr、find、operator[]），但 substr 是 O(1) 且不分配。',
      'await 注意：视图不保证以 \\0 结尾，传给需要 C 字符串的 API 前要先转回 std::string 或确保有 NUL。'
    ],
    notes: [
      'string_view 是悬空炸弹：底层字符串被销毁后视图即失效，不要长期保存或返回它。'
    ],
    example:
      '#include <string_view>\n\n' +
      '// 接收任何字符串来源都零拷贝\n' +
      'size_t count_a(std::string_view s) {\n' +
      '    return s.find_first_not_of("a") == std::string_view::npos\n' +
      '        ? s.size() : s.find_first_not_of("a");\n' +
      '}\n\n' +
      'count_a("hello");                  // 字面量直接构造\n' +
      'count_a(std::string("world"));     // 隐式从 string 构造\n\n' +
      'std::string huge = "...";\n' +
      'std::string_view head = huge;\n' +
      'auto mid = head.substr(2, 5);      // 不分配新内存'
  },
  {
    id: 'filesystem',
    title: 'std::filesystem 文件系统库',
    category: '标准库',
    version: 'C++17',
    level: '进阶',
    summary: '标准、跨平台的路径与目录操作，终于告别 boost::filesystem。',
    detail: [
      'std::filesystem::path 抽象路径（自动处理 / 与 \\ 分隔符）；exists/copy/rename/remove 等做文件操作。',
      'recursive_directory_iterator 一行递归遍历目录；file_size、last_write_time 读取元数据。',
      '操作失败抛出 filesystem_error，也可用不抛异常的 ec 重载返回错误码。'
    ],
    example:
      '#include <filesystem>\n' +
      'namespace fs = std::filesystem;\n\n' +
      'fs::path p = "data/input.txt";\n' +
      'if (fs::exists(p)) {\n' +
      '    std::cout << fs::file_size(p) << " bytes\\n";\n' +
      '}\n\n' +
      'for (const auto& entry : fs::recursive_directory_iterator("logs")) {\n' +
      '    std::cout << entry.path().string() << "\\n";\n' +
      '}\n\n' +
      'fs::create_directories("out/cache");\n' +
      'fs::copy("a.txt", "b.txt", fs::copy_options::overwrite_existing);'
  },
  {
    id: 'optional',
    title: 'std::optional 可能为空的值',
    category: '标准库',
    version: 'C++17',
    level: '进阶',
    summary: '用类型表达"可能有值"，取代用特殊值（如 -1、nullptr）表示失败的歧义。',
    detail: [
      'optional<T> 要么含一个 T，要么为空，比返回裸指针或哨兵值更安全、更明确。',
      '通过 has_value()/operator bool 判断，value() 取值（空时抛 bad_optional_access），value_or(def) 给默认值。',
      '适合工厂函数"可能失败但失败不稀奇"的场景（如查找、解析），比抛异常更轻量。'
    ],
    notes: [
      'optional<bool> 与 bool 不同：前者有三态（有true/有false/空），注意区分。',
      'optional<T> 占用 T 大小 + 一个标志位，对大对象仍是拷贝开销，可配 optional<T&>? 没有，用指针替代。'
    ],
    example:
      '#include <optional>\n\n' +
      'std::optional<int> to_int(std::string_view s) {\n' +
      '    try { return std::stoi(std::string(s)); }\n' +
      '    catch (...) { return std::nullopt; }\n' +
      '}\n\n' +
      'if (auto v = to_int("42")) {\n' +
      '    std::cout << *v << "\\n";\n' +
      '}\n' +
      'int safe = to_int("x").value_or(-1);   // -1'
  },
  {
    id: 'variant',
    title: 'std::variant 类型安全联合',
    category: '标准库',
    version: 'C++17',
    level: '高级',
    summary: '联合但记住当前类型，访问前必须检查，杜绝 union 的未定义行为。',
    detail: [
      'variant<Ts...> 同一时刻只持有其中一个可选类型，并记住当前是哪个；替代裸 union 且类型安全。',
      '用 std::holds_alternative / std::get_if / std::get 访问，错误类型访问会抛 bad_variant_access。',
      'std::visit 配合重载 lambda 对当前类型做分派，是 visitor 模式的现代实现。'
    ],
    notes: [
      'variant 默认构造第一个类型，若第一个类型不可默认构造需指定 std::monostate 作为首类型。'
    ],
    example:
      '#include <variant>\n' +
      '#include <string>\n\n' +
      'std::variant<int, std::string, double> v = "hi";\n' +
      'v = 42;\n\n' +
      '// 类型安全的访问分派\n' +
      'std::visit([](auto&& arg) {\n' +
      '    using T = std::decay_t<decltype(arg)>;\n' +
      '    if constexpr (std::is_same_v<T, int>)\n' +
      '        std::cout << "int " << arg;\n' +
      '    else if constexpr (std::is_same_v<T, std::string>)\n' +
      '        std::cout << "str " << arg;\n' +
      '    else std::cout << "other";\n' +
      '}, v);\n\n' +
      'if (auto p = std::get_if<int>(&v)) std::cout << *p;'
  },
  {
    id: 'any',
    title: 'std::any 任意类型容器',
    category: '标准库',
    version: 'C++17',
    level: '进阶',
    summary: '能装"任何可拷贝类型"的类型安全盒子，用 any_cast 取回原类型。',
    detail: [
      'any 抹去具体类型但保存类型信息，可存放任何满足可拷贝构造的类型，是类型安全的 void*。',
      'any_cast<T>(a) 取回值，类型不符抛 bad_any_cast；has_value()/type() 查询。',
      '因内部可能有堆分配且取回是运行时检查，性能不如 variant 明确——需要"完全未知类型"时才用。'
    ],
    example:
      '#include <any>\n\n' +
      'std::any a = 42;\n' +
      'a = std::string("hello");\n' +
      'a = 3.14;\n\n' +
      'try {\n' +
      '    int i = std::any_cast<int>(a);          // 当前是 double，抛异常\n' +
      '} catch (const std::bad_any_cast&) { }\n\n' +
      'if (a.type() == typeid(double))\n' +
      '    std::cout << std::any_cast<double>(a);'
  },
  {
    id: 'parallel-stl',
    title: '并行 STL（执行策略）',
    category: '标准库',
    version: 'C++17',
    level: '高级',
    summary: 'std::execution::par 一行让 sort/for_each 并行执行。',
    detail: [
      '算法增加以 execution policy 为首参数的重载：seq（串行）、par（并行）、par_unseq（并行+向量化）。',
      '在数据量大、操作独立时把 std::sort(v.begin(), v.end(), std::execution::par) 即可利用多核。',
      '操作必须无数据竞争且无副作用顺序依赖，否则结果是未定义的。'
    ],
    notes: [
      '并行执行会引入额外开销，小数据集下可能比串行更慢；不要用 par 于有共享可变状态的操作。'
    ],
    example:
      '#include <execution>\n' +
      '#include <algorithm>\n\n' +
      'std::vector<int> v(10\'000\'000);\n' +
      'std::iota(v.begin(), v.end(), 0);\n\n' +
      '// 并行排序\n' +
      'std::sort(std::execution::par, v.begin(), v.end());\n\n' +
      '// 并行 for_each（操作须独立）\n' +
      'std::for_each(std::execution::par_unseq, v.begin(), v.end(),\n' +
      '              [](int& x) { x = x * x; });'
  },
  {
    id: 'inline-vars',
    title: '内联变量 inline variables',
    category: '核心语言',
    version: 'C++17',
    level: '进阶',
    summary: 'inline 变量可在头文件定义，解决"全局常量/模板静态成员"的 ODR 重复定义。',
    detail: [
      'C++17 之前头文件里的非 const 全局变量、类内 static 成员常量都需在一个 .cpp 里单独定义；inline 变量允许在头文件直接定义且保证单一定义。',
      '模板的静态成员、跨文件共享的常量（如全局配置、版本号）用 inline 最干净。',
      'inline 变量默认具有外部链接，多个 TU 共享同一实体。'
    ],
    example:
      '// 头文件中：之前要分 .cpp 定义，现在 inline 直接放头文件\n' +
      'inline const char* kAppName = "MyApp";\n' +
      'inline int g_counter = 0;\n\n' +
      'struct Config {\n' +
      '    static inline const int MaxRetry = 3;   // 类内静态成员直接定义\n' +
      '    static inline std::string Name = "x";\n' +
      '};\n\n' +
      '// 模板静态成员同理\n' +
      'template <typename T>\n' +
      'struct Traits { static inline int id = next_id(); };'
  },
  {
    id: 'nodiscard-attrs',
    title: '[[nodiscard]] / [[maybe_unused]] / [[fallthrough]]',
    category: '核心语言',
    version: 'C++17',
    level: '入门',
    summary: '三个高频属性：强制使用返回值、抑制未用警告、显式贯穿 switch。',
    detail: [
      '[[nodiscard]] 标志函数返回"不可忽略"——调用方没用返回值就警告，常用于错误码、智能指针工厂。',
      '[[maybe_unused]] 告诉编译器某变量/参数可能不被使用，不要告警（跨平台代码常见）。',
      '[[fallthrough]] 在 switch 的 case 末尾显式标注"故意不写 break 往下走"，消除编译器警告并表明意图。'
    ],
    example:
      '[[nodiscard]] int parse(const std::string& s);   // 忽略返回值会告警\n\n' +
      'void f([[maybe_unused]] int debug_only) {\n' +
      '#ifdef NDEBUG\n' +
      '    // debug_only 未使用，但加了属性不告警\n' +
      '#endif\n' +
      '}\n\n' +
      'switch (state) {\n' +
      'case A:\n' +
      '    prepare();\n' +
      '    [[fallthrough]];     // 故意贯穿到 B\n' +
      'case B:\n' +
      '    run();\n' +
      '    break;\n' +
      '}'
  },
  {
    id: 'guaranteed-copy-elision',
    title: '保证复制消除',
    category: '核心语言',
    version: 'C++17',
    level: '高级',
    summary: '特定场景强制省略拷贝/移动，从函数返回临时对象零开销成为语义保证。',
    detail: [
      'C++17 规定：返回 prvalue（如 return T{...} 直接构造）时，对象的构造直接发生在调用方目标位置，不再要求类型可移动/可拷贝。',
      '这意味着"返回不可移动类型"也成为可能，且 NRVO（具名返回值优化）虽仍允许但仍是编译器优化（非强制）。',
      '对性能敏感、含不可拷贝类型（如 std::mutex、锁）的工厂函数意义重大。'
    ],
    example:
      'struct CantMove {\n' +
      '    CantMove() = default;\n' +
      '    CantMove(const CantMove&) = delete;\n' +
      '    CantMove(CantMove&&) = delete;\n' +
      '};\n\n' +
      'CantMove make() {\n' +
      '    return CantMove{};          // C++17 保证零拷贝，无移动也合法\n' +
      '}\n\n' +
      'CantMove m = make();            // 直接构造在 m 处'
  },
  {
    id: 'nested-ns',
    title: '嵌套命名空间与 __has_include',
    category: '核心语言',
    version: 'C++17',
    level: '入门',
    summary: 'namespace A::B::C {} 一行写嵌套命名空间；__has_include 编译期探测头文件。',
    detail: [
      '传统嵌套命名空间要层层套括号，C++17 支持 namespace A::B::C { } 的扁平写法。',
      '__has_include(<header>) 在预处理期检测某头文件是否存在，便于写可移植、可降级代码（如可选依赖实验性头）。',
      '嵌套命名空间的扁平写法让深层命名空间组织更紧凑，大型库（如 boost::asio::ip::tcp）受益明显。'
    ],
    example:
      'namespace app::core::io {\n' +
      '    void load();\n' +
      '}   // 等价于 namespace app { namespace core { namespace io { ... } } }\n\n' +
      '#if __has_include(<optional>)\n' +
      '  #include <optional>\n' +
      '  #define HAS_OPTIONAL 1\n' +
      '#endif\n\n' +
      '#if __has_include(<experimental/filesystem>)\n' +
      '  #include <experimental/filesystem>\n' +
      '#endif'
  }
];
