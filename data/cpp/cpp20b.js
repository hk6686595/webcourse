// C++20 特性 —— 第二部分：标准库与并发
module.exports = [
  {
    id: 'ranges',
    title: 'Ranges（范围库）与视图',
    category: '标准库',
    status: 'C++20 库',
    level: '进阶',
    summary: '管道式算法 views::filter | transform | take，惰性求值零拷贝组合。',
    detail: [
      '传统 STL 算法需要传 begin()/end() 迭代器；Ranges 直接接收容器，并提供 | 管道语法把视图串联起来。',
      'views 是惰性的：不生成中间容器，遍历时逐元素流过整条管道，内存占用恒定。',
      '常用视图：filter、transform、take/drop、take_while/drop_while、iota、reverse、split、join、elements(取 tuple 字段)。',
      'range 概念分层：input_range → forward_range → bidirectional_range → random_access_range → contiguous_range，不同算法要求不同层级。'
    ],
    notes: [
      'view 不拥有数据，底层容器必须比 view 活得久；对临时容器创建 view 是悬空行为。',
      'filter 后再 reverse 之类操作某些组合不可用（编译报错），因为过滤破坏了双向遍历的前提。'
    ],
    example:
      '#include <ranges>\n' +
      '#include <vector>\n' +
      '#include <iostream>\n\n' +
      'namespace rv = std::views;\n\n' +
      'int main() {\n' +
      '    std::vector<int> nums{8, 3, 7, 1, 9, 4, 6};\n\n' +
      '    // 取偶数 → 平方 → 前三个\n' +
      '    for (int x : nums | rv::filter([](int n){ return n % 2 == 0; })\n' +
      '                       | rv::transform([](int n){ return n * n; })\n' +
      '                       | rv::take(3)) {\n' +
      '        std::cout << x << " ";          // 64 16 36\n' +
      '    }\n\n' +
      '    // 无限序列 + 惰性截断：前 10 个偶数\n' +
      '    for (int i : rv::iota(0) | rv::filter([](int n){ return n%2==0; })\n' +
      '                             | rv::take(10))\n' +
      '        std::cout << i << " ";\n' +
      '}',
    example2Title: 'split / join / elements 组合',
    example2:
      'std::string csv = "alice,30,beijing\\nbob,25,shanghai";\n\n' +
      '// 按行 split，再把每行按逗号 split\n' +
      'for (auto row : csv | rv::split(\'\\n\')) {\n' +
      '    for (auto cell : std::string_view(row) | rv::split(\',\'))\n' +
      '        std::cout << "[" << std::string_view(cell) << "] ";\n' +
      '    std::cout << "\\n";\n' +
      '}\n\n' +
      '// vector<pair> 取每个元素的 second 组成新视图\n' +
      'std::vector<std::pair<std::string,int>> scores{\n' +
      '    {"math",90}, {"eng",85}};\n' +
      'for (int s : scores | rv::elements<1>)   // 只看分数\n' +
      '    std::cout << s << " ";'
  },
  {
    id: 'ranges-algorithms',
    title: 'Ranges 算法：投影参数',
    category: '标准库',
    status: 'C++20 库',
    level: '进阶',
    summary: 'std::ranges::sort / find / count 直接收容器，还内置 projection 免手写比较器。',
    detail: [
      '所有经典算法都有 ranges 版本：接收整个容器、返回迭代器或子范围（find 返回 optional 风格的 borrowed iterator）。',
      '杀手级特性是 projection：直接指定"按哪个成员"排序/查找，不再需要手写 lambda 比较器。',
      'ranges::sort(v) 默认 operator<；ranges::sort(v, std::greater{}, &Employee::salary) 表示"按 salary 降序"。'
    ],
    example:
      '#include <ranges>\n' +
      '#include <algorithm>\n' +
      '#include <vector>\n' +
      '#include <string>\n\n' +
      'struct Employee {\n' +
      '    std::string name;\n' +
      '    int         age;\n' +
      '    double      salary;\n' +
      '};\n\n' +
      'std::vector<Employee> staff{{"张三",28,9000},{"李四",35,12000},{"王五",24,7000}};\n\n' +
      '// 按 salary 降序：第三个参数就是 projection！\n' +
      'std::ranges::sort(staff, std::greater<double>{}, &Employee::salary);\n\n' +
      '// 按 name 查找，直接给字符串也行\n' +
      'auto it = std::ranges::find(staff, "李四", &Employee::name);\n' +
      'if (it != staff.end())\n' +
      '    std::cout << it->age << "\\n";\n\n' +
      '// 统计与判断同样简洁\n' +
      'bool allAdult = std::ranges::all_of(staff, [](int a){ return a >= 18; },\n' +
      '                                    &Employee::age);\n' +
      'std::ranges::for_each(staff, [](const auto& e){ /* ... */ });'
  },
  {
    id: 'format',
    title: 'std::format 格式化库',
    category: '标准库',
    status: 'C++20 库',
    level: '入门',
    summary: 'Python 风格 "{}" 占位符格式化，类型安全、可扩展，取代 printf/iostream。',
    detail: [
      '"{}" 自动按位置替换，"{0}" "{1}" 按序号，"{:>10}" 控制宽度对齐，"{:.2f}" 控制精度。',
      '类型安全：参数数量或类型不匹配直接编译错误，这是相对 printf 的本质优势。',
      '自定义类型支持格式化：特化 std::formatter<T, charT> 并实现 parse 与 format。',
      'C++23 补充了 std::print / std::println，输出更顺手。'
    ],
    example:
      '#include <format>\n' +
      '#include <iostream>\n\n' +
      'int main() {\n' +
      '    std::string name = "C++";\n' +
      '    double ver = 20.0;\n\n' +
      '    auto s = std::format("欢迎来到 {} {:.0f}!", name, ver);\n' +
      '    std::cout << s << "\\n";       // 欢迎来到 C++ 20!\n\n' +
      '    // 对齐与填充\n' +
      '    std::cout << std::format("[{:>8}]", "hi")   << "\\n";  // [      hi]\n' +
      '    std::cout << std::format("[{:<8}]", "hi")   << "\\n";  // [hi      ]\n' +
      '    std::cout << std::format("[{:^8}]", "hi")   << "\\n";  // [   hi   ]\n' +
      '    std::cout << std::format("{:.2f}", 3.14159) << "\\n";  // 3.14\n' +
      '    std::cout << std::format("{:#x}", 255)      << "\\n";  // 0xff\n' +
      '    std::cout << std::format("{:+05d}", 42)     << "\\n";  // +0042\n' +
      '}'
  },
  {
    id: 'span',
    title: 'std::span 轻量视图',
    category: '标准库',
    status: 'C++20 库',
    level: '进阶',
    summary: '(指针+长度) 的非拥有连续内存视图，统一数组/vector/string 的传参。',
    detail: [
      'span 不拥有数据、拷贝廉价（两个指针大小），可安全携带长度避免裸指针+size 的组合。',
      '动态 extent 的 span 支持 subspan() 切片、first()/last() 截取；是 C++20 版的"切片类型"。',
      '固定 extent 的 span<int, 4> 把长度编入类型系统，长度不匹配编译失败。'
    ],
    notes: [
      'span 只是视图：底层容器被销毁或扩容后 span 即悬空，不要长期持有。',
      '只读场景一律用 span<const T>，防止意外修改并允许绑定 string/初始化列表等只读数据。'
    ],
    example:
      '#include <span>\n' +
      '#include <vector>\n\n' +
      '// 一个签名吃遍 C 数组、std::array、std::vector\n' +
      'int sum(std::span<const int> data) {\n' +
      '    int total = 0;\n' +
      '    for (int x : data) total += x;\n' +
      '    return total;\n' +
      '}\n\n' +
      'int main() {\n' +
      '    int arr[] = {1, 2, 3, 4, 5};\n' +
      '    std::vector<int> vec{1, 2, 3, 4, 5};\n\n' +
      '    sum(arr);                 // OK\n' +
      '    sum(vec);                 // OK\n\n' +
      '    std::span s{vec};\n' +
      '    auto head  = s.first(3);      // 前 3 个\n' +
      '    auto tail  = s.last(2);       // 后 2 个\n' +
      '    auto mid   = s.subspan(1, 3); // [1, 4) 区间\n' +
      '    head[0] = 100;                // 视图可写，底层 vector 被改\n' +
      '}'
  },
  {
    id: 'string-view-enhancements',
    title: 'starts_with / ends_with 与 char8_t',
    category: '标准库',
    status: 'C++20 库',
    level: '入门',
    summary: 'string/string_view 新增 starts_with、ends_with（contains 为 C++23）；char8_t 落地。',
    detail: [
      '以前要写 s.compare(0, pre.size(), pre) == 0 或 s.rfind(pre, 0) == 0 这种晦涩代码，现在语义直白。',
      'char8_t/u8string 把 UTF-8 字符从 char 中独立出来加强类型安全（实践中有争议，需注意生态兼容）。',
      'starts_with 同时接受字符、字符指针和 string_view 三种重载。'
    ],
    example:
      '#include <string>\n' +
      '#include <string_view>\n\n' +
      'bool is_https(std::string_view url) {\n' +
      '    return url.starts_with("https://");\n' +
      '}\n\n' +
      'bool is_pdf(std::string_view f) {\n' +
      '    return f.ends_with(".pdf");\n' +
      '}\n\n' +
      'std::string file = "report_2026.pdf";\n' +
      'is_pdf(file);                            // true\n' +
      'file.starts_with("report");              // true\n\n' +
      '// 配合 string_view 实现零拷贝判断\n' +
      'std::string_view sv = file;\n' +
      'sv.remove_prefix(sv.find(\'_\') + 1);     // "2026.pdf"'
  },
  {
    id: 'chrono-calendar',
    title: '&lt;chrono&gt; 日历与时区扩展',
    category: '标准库',
    status: 'C++20 库',
    level: '进阶',
    summary: 'year_month_day、weekday、hh_mm_ss、时区转换——日期计算终于不用第三方库。',
    detail: [
      'C++20 给 chrono 加了完整日历类型：year/month/day 可自由组合运算（如 next_month/day + 7）。',
      'weekday 自动处理星期推算；year_month_weekday 能表达"第三个周五"这类业务规则。',
      'std::chrono::current_zone()/locate_zone() 提供 IANA 时区数据库访问，zoned_time 完成跨时区转换。',
      '配合 std::format 输出："{}" 格式的 time_point 会按 ISO 8601 打印。'
    ],
    example:
      '#include <chrono>\n' +
      '#include <format>\n' +
      '#include <iostream>\n\n' +
      'using namespace std::chrono;\n\n' +
      'int main() {\n' +
      '    auto today = year_month_day{floor<days>(system_clock::now())};\n' +
      '    std::cout << today << "\\n";            // 2026-08-26\n\n' +
      '    // 月份运算自动进位\n' +
      '    auto next = year_month{today.year(), today.month()} + months(5);\n' +
      '    std::cout << next << "\\n";             // 2027-01\n\n' +
      '    // 某天是星期几\n' +
      '    weekday wd{today};\n' +
      '    std::cout << wd << "\\n";               // Wed\n\n' +
      '    // 时区转换：本地时间 ↔ 东京时间\n' +
      '    auto tk = zoned_time{"Asia/Tokyo", system_clock::now()};\n' +
      '    std::cout << tk << "\\n";\n\n' +
      '    // 格式化\n' +
      '    std::cout << std::format("{:%Y年%m月%d日}", today) << "\\n";\n' +
      '}'
  },
  {
    id: 'source-location',
    title: 'std::source_location 替代宏',
    category: '标准库',
    status: 'C++20 库',
    level: '入门',
    summary: '函数默认参数里拿到调用点的 文件/行号/函数名，告别 __LINE__ 宏拼接。',
    detail: [
      'source_location::current() 作为默认实参时会捕获**调用方**的位置信息，这是它替代 LOG 宏的核心原理。',
      '字段：file_name()、function_name()、line()、column()。比 __FILE__/__LINE__ 类型安全且可用于类成员。',
      '日志、断言、错误上报组件的标准基础设施。'
    ],
    example:
      '#include <source_location>\n' +
      '#include <iostream>\n' +
      '#include <string_view>\n\n' +
      'void log_msg(std::string_view msg,\n' +
      '             const std::source_location& loc\n' +
      '                 = std::source_location::current())   // 关键：默认实参\n' +
      '{\n' +
      '    std::cout << loc.file_name() << ":"\n' +
      '              << loc.line() << " ["\n' +
      '              << loc.function_name() << "] "\n' +
      '              << msg << "\\n";\n' +
      '}\n\n' +
      'void business_logic() {\n' +
      '    log_msg("处理开始");     // 打印出的是这一行的位置！\n' +
      '}'
  },
  {
    id: 'jthread',
    title: 'std::jthread 与停止令牌',
    category: '并发',
    status: 'C++20 库',
    level: '进阶',
    summary: '自动 join 的线程 + 协作式取消 stop_token，线程管理的现代答案。',
    detail: [
      'jthread 析构时自动 request_stop() 并 join()，杜绝忘记 join 导致的 std::terminate。',
      'stop_token/stop_callback 提供标准化的协作式取消机制；回调在触发停止时执行，可做资源清理。',
      'condition_variable_any 支持 wait(lock, stop_token)，让等待既能被通知也能被取消。'
    ],
    notes: [
      'jthread 不可拷贝只能移动；把线程对象存入容器用 push_back(std::move(t)) 或 emplace_back。'
    ],
    example:
      '#include <thread>\n' +
      '#include <chrono>\n' +
      '#include <iostream>\n\n' +
      'using namespace std::chrono_literals;\n\n' +
      'int main() {\n' +
      '    std::jthread worker([](std::stop_token st) {\n' +
      '        int round = 0;\n' +
      '        while (!st.stop_requested()) {\n' +
      '            std::cout << "working... " << ++round << "\\n";\n' +
      '            std::this_thread::sleep_for(200ms);\n' +
      '        }\n' +
      '        std::cout << "graceful exit\\n";\n' +
      '    });\n\n' +
      '    // 注册停止回调（可选）\n' +
      '    std::stop_callback cb(worker.get_stop_token(),\n' +
      '                          []{ std::cout << "收到停止请求\\n"; });\n\n' +
      '    std::this_thread::sleep_for(1s);\n' +
      '    worker.request_stop();     // 显式请求取消\n' +
      '}   // 即使忘了上面这行，析构也会自动 stop + join'
  },
  {
    id: 'latch-barrier-semaphore',
    title: 'latch / barrier / semaphore',
    category: '并发',
    status: 'C++20 库',
    level: '高级',
    summary: '三个新同步原语：一次性倒计时、阶段栅栏、计数信号量。',
    detail: [
      'std::latch：一次性计数门闩，count_down 后等待者放行；适合"等 N 个任务全部完成"。',
      'std::barrier：可复用、带完成回调的阶段同步——一批线程到齐后进入下一轮，适合并行迭代算法。',
      'std::counting_semaphore：轻量信号量，try_acquire 支持带超时尝试；比 mutex 更适合资源配额控制。',
      '它们都只依赖原子操作实现，比 condition_variable 方案更快更简单。'
    ],
    example:
      '#include <semaphore>\n' +
      '#include <latch>\n' +
      '#include <barrier>\n' +
      '#include <thread>\n\n' +
      'std::counting_semaphore<4> slots(4);   // 最多 4 个并发\n' +
      'std::latch done(3);                     // 等 3 个任务完成\n' +
      'std::barrier sync(2, [] noexcept {     // 每轮结束打印\n' +
      '    /* completion function */\n' +
      '});\n\n' +
      'void task(int id) {\n' +
      '    slots.acquire();                    // P 操作\n' +
      '    // ... 受限并发的工作 ...\n' +
      '    slots.release();                    // V 操作\n' +
      '    done.count_down();                  // 报告完成\n' +
      '}\n\n' +
      'int main() {\n' +
      '    for (int i = 0; i < 10; ++i)\n' +
      '        std::jthread(task, i).detach();\n' +
      '    done.wait();                        // 全部完成后返回\n' +
      '}'
  },
  {
    id: 'atomic-wait-notify',
    title: 'atomic wait / notify 原子等待',
    category: '并发',
    status: 'C++20 库',
    level: '高级',
    summary: 'atomic 变量自带阻塞等待：wait/notify_one/notify_all，条件变量的新选择。',
    detail: [
      'atomic<T>::wait(old) 阻塞直到原子值 != old（可能伪唤醒，需循环检查），notify_one/notify_all 唤醒等待者。',
      '相比 condition_variable + mutex 的组合：不需要锁、不需要共享的谓词检查循环样板，代码短得多。',
      '典型用途：状态标志位通知、无锁队列的消费者唤醒。'
    ],
    example:
      '#include <atomic>\n' +
      '#include <thread>\n' +
      '#include <chrono>\n\n' +
      'using namespace std::chrono_literals;\n\n' +
      'std::atomic<bool> ready{false};\n' +
      'std::atomic<int>  value{0};\n\n' +
      'void consumer() {\n' +
      '    // 阻塞等待 ready 变为 true（无需 mutex）\n' +
      '    ready.wait(false);\n' +
      '    std::printf("got %d\\n", value.load());\n' +
      '}\n\n' +
      'void producer() {\n' +
      '    std::this_thread::sleep_for(100ms);\n' +
      '    value.store(42);\n' +
      '    ready.store(true);\n' +
      '    ready.notify_one();                 // 唤醒消费者\n' +
      '}'
  },
  {
    id: 'lib-misc',
    title: '杂项库增强速览',
    category: '标准库',
    status: 'C++20 库',
    level: '入门',
    summary: 'erase_if、to_array、midpoint/lerp、bind_front、osyncstream……一批实用小工具。',
    detail: [
      'std::erase/std::erase_if 统一了各容器的删除语法，一行顶 erase-remove 惯用法两行。',
      'std::to_array 从 C 数组/字面量创建 std::array 且自动推导大小；midpoint/lerp 提供防溢出的中点与插值。',
      'std::bind_front 绑定前几个参数并保持完美转发（比 bind 更直观）；std::osyncstream 让多线程 cout 不再交错输出。',
      '<bit> 头的 popcount/countl_zero 等位操作与 bit_cast 也是本批入库（另有专门条目）。'
    ],
    example:
      '#include <vector>\n' +
      '#include <deque>\n' +
      '#include <array>\n' +
      '#include <functional>\n' +
      '#include <syncstream>\n' +
      '#include <numeric>\n\n' +
      'int main() {\n' +
      '    // 删除偶数：一行搞定（旧时代是 remove_if + erase 两步）\n' +
      '    std::vector v{1,2,3,4,5,6};\n' +
      '    std::erase_if(v, [](int x){ return x % 2 == 0; });   // {1,3,5}\n\n' +
      '    // to_array：自动推导大小\n' +
      '    auto arr = std::to_array("hello");   // std::array<char,6>\n\n' +
      '    // 防溢出中点\n' +
      '    int lo = INT_MAX, hi = INT_MAX;\n' +
      '    int mid = std::midpoint(lo, hi);     // 安全！不会像 (lo+hi)/2 溢出\n\n' +
      '    // bind_front：绑定前 N 个参数\n' +
      '    auto shout = [](std::string prefix, std::string msg) {\n' +
      '        return prefix + msg;\n' +
      '    };\n' +
      '    auto warn = std::bind_front(shout, "[WARN] ");\n\n' +
      '    // 多线程输出不再交错\n' +
      '    std::osyncstream(std::cout) << "线程安全的一整行\\n";\n' +
      '}'
  }
];
