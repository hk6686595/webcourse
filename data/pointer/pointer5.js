// C++ 指针详解 20–21：实战
module.exports = [
  {
    id: 'ptr-list',
    title: '20. 指针实战：单链表',
    category: '指针实战',
    version: 'C++98',
    level: '实战',
    lang: 'cpp',
    summary: '用指针亲手实现单链表：插入、删除、遍历，理解数据结构中的指针连接。',
    detail: [
      '节点结构：struct Node { int val; Node* next; };next 是指向下一个节点的指针。',
      '插入：new 一个新节点，把前驱节点的 next 指向它——"改指针连接"就是插入。',
      '删除：先把待删节点从链中摘出去（前驱 next 跳过它），再 delete，顺序错了会丢引用。',
      '遍历：for (Node* n = head; n; n = n->next) 指针为 nullptr 就是链尾哨兵。',
      '常见坑：新建节点后 next 一定要置 nullptr，否则遍历到尾部解引用空指针崩溃。',
      '工程上直接使用 std::list/容器即可，但指针版链表的每一行都是理解许多代码库的钥匙。',
    ],
    notes: [
      '删除节点要先保存指针再改链接再 delete，否则 delete 后读取 next 是未定义行为。',
      '头指针本身可能被修改（删除头节点），要用 Node** 或 Node*& 传入。',
    ],
    example: `struct Node {
    int   val;
    Node* next;
};
Node* head = nullptr;

void push_front(int v) {
    Node* n = new Node{v, head};   // new: 指针连接
    head = n;
}

void pop_front() {
    if (!head) return;
    Node* old = head;              // 先保存
    head = head->next;             // 先改连接
    delete old;                    // 再释放
}

void print() {
    for (Node* n = head; n; n = n->next)  // 空指针 = 链尾
        std::cout << n->val << ' ';
    std::cout << "\\n";
}

int main() {
    push_front(3); push_front(2); push_front(1);
    print();      // 1 2 3
    pop_front();
    print();      // 2 3
}`,
  },
  {
    id: 'ptr-poly',
    title: '21. 指针与多态：基类指针调虚函数',
    category: '指针实战',
    version: 'C++11',
    level: '实战',
    lang: 'cpp',
    summary: '用基类指针驾驭派生类多态，理解虚表与动态分发的运行时行为。',
    detail: [
      'Base* p = new Derived(); 后调用虚函数会走 Derived 的实现——按对象实际类型运行时分发。',
      '基类虚函数（virtual）才触发运行时多态；非虚成员函数按指针的静态类型调用。',
      '虚表（vtable）：多态对象内部藏一个 vptr 指针，指向虚表；查表得到真正的函数地址。',
      '通过基类指针释放派生对象要求析构函数声明为 virtual，否则只析构基类部分，造成泄漏。',
      '不要用基类指针指向派生类数组去做 p[i] 下标——步长按基类计算，全部错位。',
      '引用同样可多态；用 make_unique<Derived> 赋给基类 unique_ptr 也触发同样机制。',
    ],
    notes: [
      '多态只对指针/引用生效：按值传递会切片（slicing），派生部分被截掉。',
      'dynamic_cast / typeid 依赖多态信息，对非虚类不适用。',
    ],
    example: `struct Shape {
    virtual double area() const = 0;      // 纯虚
    virtual ~Shape() = default;           // 必须 virtual 析构
};
struct Circle : Shape {
    double r;
    Circle(double x) : r(x) {}
    double area() const override { return 3.14 * r * r; }
};
struct Square : Shape {
    double s;
    Square(double x) : s(x) {}
    double area() const override { return s * s; }
};

int main() {
    std::vector<std::unique_ptr<Shape>> v;
    v.push_back(std::make_unique<Circle>(1.0));
    v.push_back(std::make_unique<Square>(2.0));

    for (const auto& sp : v)              // 基类指针
        std::cout << sp->area() << "\\n"; // 各自动态分发
    // 3.14
    // 4
}`,
  },
];