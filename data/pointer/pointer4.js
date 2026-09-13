// C++ 指针详解 16–19：智能指针
module.exports = [
  {
    id: 'ptr-rai',
    title: '16. 为什么要智能指针：RAII 的救赎',
    category: '智能指针',
    version: 'C++11',
    level: '进阶',
    lang: 'cpp',
    summary: '理解 RAII 思想：资源随对象生命周期自动释放，从而消灭裸指针泄漏。',
    detail: [
      'RAII（资源获取即初始化）把堆内存、文件句柄、锁、网络连接等资源的获取放在构造、释放放在析构；对象离开作用域时自动回收。',
      '裸指针痛点：忘记 delete、异常中途 return 跳过释放、多个指针共享同一内存缺乏纪律。',
      '智能指针就是 RAII 的落地实现：析构时自动调用 delete/释放，无需手动配对。',
      'C++11 标准提供三种：unique_ptr（独占所有权）、shared_ptr（共享+引用计数）、weak_ptr（弱引用观察者）。',
      '智能指针支持 -> 与 * 解引用，用法上平滑过渡，养成习惯后能消灭整类 bug。',
      '心智模型：裸指针仅在极短作用域里作为临时句柄使用，所有权一律交给智能指针。',
    ],
    notes: [
      'unique_ptr 不能按值拷贝，传递时要用 std::move() 转移所有权或传裸指针借用。',
      '智能指针开销极低（一般就是一个裸指针大小），在绝大多数场景可忽略。',
    ],
    example: `#include <iostream>
#include <memory>
#include <vector>

int main() {
    // 裸指针：手工管理，有泄漏风险
    int* raw = new int(1);
    // ... 忘记 delete

    // unique_ptr：自动回收，无需手动释放
    auto sp = std::make_unique<int>(2);
    std::cout << *sp << "\\n";    // 2
    // 作用域结束，自动 delete

    // 放进容器
    std::vector<std::unique_ptr<int>> v;
    v.push_back(std::make_unique<int>(3));
    v.push_back(std::make_unique<int>(4));
    for (auto& p : v)
        std::cout << *p << ' ';   // 3 4
}`,
  },
  {
    id: 'ptr-unique',
    title: '17. unique_ptr：独占所有权',
    category: '智能指针',
    version: 'C++11',
    level: '进阶',
    lang: 'cpp',
    summary: '掌握 unique_ptr 的创建、移动转移与拷贝禁用，处理独占所有权。',
    detail: [
      'std::unique_ptr<T> 独占一块内存，拷贝被禁止（防止两个 unique_ptr 都 delete），移动才转移所有权。',
      '推荐用 std::make_unique<T>(args) 创建（C++14）：一次分配控制块+对象，异常安全，不用写裸 new。',
      '移动语义：unique_ptr<T> b = std::move(a); 后 a 变为 nullptr。',
      '访问操作：-> 调成员，* 解引用，get() 借裸指针（不接管），release() 放弃所有权并返回裸指针。',
      'reset() 释放当前内存并可选接管新指针；单独调用 reset() 等于释放。',
      '作为函数返回值按值返回会自动 move，返回 unique_ptr 是最干净的工厂模式。',
    ],
    notes: [
      '类型删除器可定制：std::unique_ptr<T[]> 处理数组，自定义 deleter 接管文件/网络等资源。',
      '不要对 unique_ptr 管理的内存再手动 delete，也不要 delete release() 返回的裸指针——职责只应有一个。',
    ],
    example: `#include <iostream>
#include <memory>

int main() {
    auto p1 = std::make_unique<int>(10);
    std::cout << *p1 << "\\n";    // 10

    // 拷贝禁止
    // auto p2 = p1;             // 编译错误

    // 移动所有权
    std::unique_ptr<int> p2 = std::move(p1);
    std::cout << (p1 == nullptr) << "\\n";   // 1（已转移）
    std::cout << *p2 << "\\n";               // 10

    p2.reset(new int(20));     // 释放旧的，接管新的
    std::cout << *p2 << "\\n";               // 20
    p2 = nullptr;              // 释放
}`,
  },
  {
    id: 'ptr-shared',
    title: '18. shared_ptr：共享所有权与引用计数',
    category: '智能指针',
    version: 'C++11',
    level: '进阶',
    lang: 'cpp',
    summary: '理解 shared_ptr 引用计数原理、线程安全边界与循环引用隐患。',
    detail: [
      '多个 shared_ptr 管理同一对象时引用计数 >1，最后一个 shared_ptr 销毁时才真正 delete。',
      '用 std::make_shared<T>(args) 创建：一次分配控制块+对象，比分开 new + 构造效率更高且异常安全。',
      '拷贝 shared_ptr 递增引用计数；移动不递增（整体所有权转移）。',
      '线程安全：引用计数的加减操作原子保证线程安全，但"所指向对象本身"的读写仍需你自己加锁。',
      '隐患：循环引用（a 与 b 各自持对方的 shared_ptr）导致计数永不归零，内存泄漏。',
      '循环引用需配合 weak_ptr 打破：一方改持 weak，只观察不延长生命，循环自然解除。',
    ],
    notes: [
      'use_count() 调试时有用，跨线程读取不精确；单线程使用最安全。',
      'make_shared 的唯一弱点：控制块与对象同块分配，weak_ptr 仍在时对象会"延迟释放"——极少数场景才影响。',
    ],
    example: `#include <iostream>
#include <memory>

int main() {
    auto sp1 = std::make_shared<int>(42);
    std::cout << "count=" << sp1.use_count() << "\\n";  // 1

    {
        std::shared_ptr<int> sp2 = sp1;   // 拷贝，计数 +1
        std::cout << "count=" << sp1.use_count() << "\\n"; // 2
    }
    // sp2 销毁，计数归 1
    std::cout << "count=" << sp1.use_count() << "\\n"; // 1
    std::cout << *sp1 << "\\n";  // 42 仍在

    // 循环引用示例（有泄漏风险，见 weak_ptr 详解）
}`,
  },
  {
    id: 'ptr-weak',
    title: '19. weak_ptr：打破循环引用',
    category: '智能指针',
    version: 'C++11',
    level: '进阶',
    lang: 'cpp',
    summary: '用 weak_ptr 作弱引用观察者，解决 shared_ptr 循环引用泄漏问题。',
    detail: [
      'std::weak_ptr<T> 不增加引用计数，只是"观察"一个 shared_ptr 管理的对象是否还活着。',
      '使用前必须 lock()：返回空表示对象已释放，成功则拿到一个临时的 shared_ptr 获得访问权。',
      '典型用途：父子/兄弟间双向引用（父持子 shared，子持父 weak）；实现观察者/回调存活检查。',
      '不能对 weak_ptr 直接解引用（没有 operator*），必须 lock() 后再操作临时 shared_ptr。',
      'weak 不延长目标生命周期：lock 拿到的 shared 一用完就析构，观察结束不会拖长对象寿命。',
      'expired() 与 lock() 组合使用：先查是否失效、再尝试获取，是标准的弱引用使用模式。',
    ],
    notes: [
      '循环引用是最隐蔽的 C++ 内存问题之一，weak_ptr 是标准解法。',
      'std::enable_shared_from_this 用 weak 持有 this 指针，实现安全的 shared_ptr 自增，解决异步回调生命周期问题。',
    ],
    example: `#include <iostream>
#include <memory>

struct B;                   // 前置声明

struct A {
    std::shared_ptr<B> b_ptr;
    ~A() { std::cout << "A 析构\\n"; }
};
struct B {
    std::weak_ptr<A> a_ptr;   // 用 weak 打破循环
    ~B() { std::cout << "B 析构\\n"; }
};

int main() {
    auto a = std::make_shared<A>();
    auto b = std::make_shared<B>();
    a->b_ptr = b;    // b 持 a 为 shared
    b->a_ptr = a;    // a 持 b 为 weak，不增加计数

    std::cout << "a count=" << a.use_count() << "\\n";  // 1
    std::cout << "b count=" << b.use_count() << "\\n";  // 2 (a+b_ptr)
}
// 若 a_ptr 也是 shared，两边计数永远 >=1 → 泄漏
// 用 weak 后，a 先析构，b 的 a_ptr.lock() 返回空`,
  },
];