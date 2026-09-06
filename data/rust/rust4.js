// Rust 教程 16–20：进阶特性与并发
const rust16 = {
  id: 'rust-generics-traits',
  title: '16. 泛型与 Trait：抽象与复用',
  category: '进阶特性',
  version: '1.0+',
  level: '进阶',
  summary: '泛型函数与结构体、Trait 定义共享行为、Trait Bound 约束泛型、Trait Object 动态分发。',
  detail: [
    '泛型：fn largest<T: PartialOrd>(list: &[T]) -> &T；struct Point<T> { x: T, y: T }。',
    'Trait 定义共享行为：trait Summary { fn summarize(&self) -> String }。',
    '为类型实现 Trait：impl Summary for NewsArticle { ... }。',
    'Trait Bound 约束：fn f<T: Summary>(x: &T) 或 where T: Summary + Display。',
    'Trait Object：Box<dyn Summary> 运行时动态分发，允许异质类型集合。',
    '标准库常用 Trait：Display、Debug、Clone、Copy、PartialEq、Ord、Iterator。',
  ],
  notes: [
    '静态分发（泛型）在编译期展开，性能好；动态分发（dyn）用虚表，灵活但略慢。',
    'Rust 无继承，Trait 通过 Bound 组合实现代码复用。',
  ],
  example: `trait Greet {
    fn greet(&self) -> String;
}

struct Person { name: String }
struct Robot { id: u32 }

impl Greet for Person {
    fn greet(&self) -> String { format!("Hi, I'm {}", self.name) }
}
impl Greet for Robot {
    fn greet(&self) -> String { format!("Beep, unit {}", self.id) }
}

// 泛型 + Trait Bound（静态分发）
fn announce<T: Greet>(item: &T) {
    println!("{}", item.greet());
}

// Trait Object（动态分发）
fn print_all(items: &Vec<Box<dyn Greet>>) {
    for item in items { println!("{}", item.greet()); }
}

fn main() {
    let p = Person { name: String::from("Alice") };
    let r = Robot { id: 42 };
    announce(&p);   // Hi, I'm Alice
    announce(&r);   // Beep, unit 42

    let items: Vec<Box<dyn Greet>> = vec![Box::new(p), Box::new(r)];
    print_all(&items);
}`,
};

const rust17 = {
  id: 'rust-macros',
  title: '17. 宏 Macros：声明式宏与过程宏',
  category: '进阶特性',
  version: '1.0+',
  level: '高级',
  summary: '宏在编译期生成代码：声明式 macro_rules!、过程宏（derive / attribute / function-like）。',
  detail: [
    '宏 vs 函数：函数在运行时调用，宏在编译期对代码进行文本/语法树变换。',
    '声明式宏 macro_rules!：匹配模式并展开，如 vec!、println!。',
    '宏规则用 $ 捕获片段（$x:expr、$t:ty），用 pattern => expansion。',
    '过程宏（procedural macro）：自定义 derive（如 #[derive(Serialize)]）、属性宏、函数宏，用 syn/quote 处理 TokenStream。',
    '常见宏：println!、vec!、format!、todo!、panic!、assert!。',
    '宏能大幅减少样板代码，但过度使用会让代码难调试。',
  ],
  notes: [
    '过程宏通常写在单独的 crate 中，因为需要 proc-macro crate type。',
    'derive 宏最常用，如 serde 的 Serialize/Deserialize。',
  ],
  example: `// 声明式宏
macro_rules! say_hello {
    () => { println!("Hello!"); };
    ($name:expr) => { println!("Hello, {}!", $name); };
}

macro_rules! vec2 {
    ($($x:expr),*) => {{
        let mut temp_vec = Vec::new();
        $(temp_vec.push($x);)*
        temp_vec
    }};
}

fn main() {
    say_hello!();
    say_hello!("Rust");

    let nums = vec2![1, 2, 3, 4];
    println!("{:?}", nums);  // [1,2,3,4]

    // 防崩溃宏
    // todo!("还没实现");
    // unimplemented!();
}`,
};

const rust18 = {
  id: 'rust-concurrency',
  title: '18. 多线程并发：std::thread / 通道 / Mutex',
  category: '并发',
  version: '1.0+',
  level: '进阶',
  summary: '线程创建、join、消息传递 channel、共享状态 Mutex 与 Send/Sync 特征。',
  detail: [
    'std::thread::spawn(closure) 创建线程，handle.join() 等待完成。',
    'move 关键字让闭包获得所需数据的所有权，避免借用冲突。',
    '通道 std::sync::mpsc::channel()：tx.send() / rx.recv()，多生产者单消费者。',
    '共享状态用 Mutex<T>：lock() 获取 MutexGuard，配合 Arc 多线程共享。',
    'Rc<T> 单线程引用计数；Arc<T> 原子引用计数用于多线程共享。',
    'Send（可跨线程转移）与 Sync（可安全共享引用）是编译期检查的并发安全 trait。',
  ],
  notes: [
    'Rust 靠所有权 + Send/Sync 在编译期"消除数据竞争"——这是 Rust 并发安全的独特优势。',
    '多线程修改共享数据，必须 Mutex + Arc，编译器会强制。',
  ],
  example: `use std::thread;
use std::sync::{mpsc, Arc, Mutex};

fn main() {
    // 线程 + join
    let handle = thread::spawn(|| {
        let sum: i32 = (0..100).sum();
        sum
    });
    println!("sum = {}", handle.join().unwrap());

    // 通道
    let (tx, rx) = mpsc::channel();
    thread::spawn(move || {
        for i in 0..3 {
            tx.send(i).unwrap();
        }
    });
    for received in rx { println!("got {}", received); }

    // 共享状态：Mutex + Arc
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];
    for _ in 0..5 {
        let c = Arc::clone(&counter);
        handles.push(thread::spawn(move || {
            let mut num = c.lock().unwrap();
            *num += 1;
        }));
    }
    for h in handles { h.join().unwrap(); }
    println!("counter = {}", *counter.lock().unwrap());  // 5
}`,
};

const rust19 = {
  id: 'rust-async',
  title: '19. async/await 异步编程：Tokio 运行时',
  category: '并发',
  version: '1.39+',
  level: '高级',
  summary: 'async 函数、await 挂起、Future trait，以及 Tokio 异步运行时与常见模式。',
  detail: [
    'async fn 返回 Future，需 await 或运行时执行器（executor）驱动。',
    '.await 会挂起当前任务，让出线程给其他任务——实现高并发 I/O。',
    'tokio 是最流行的异步运行时：#[tokio::main] 宏设置 executor。',
    '常用组件：tokio::spawn（并发任务）、tokio::fs、tokio::time::sleep、TcpListener。',
    '多 Future 并发：tokio::join!（并发等待多个）、tokio::select!（谁先完成）。',
    '异步与并发：async 解决低效阻塞，配合多线程 executor 实现高吞吐网络服务。',
  ],
  notes: [
    'async 函数不能直接调用阻塞操作（如 std::thread::sleep），要用 tokio::time::sleep。',
    'Send Future: 跨 await 捕获的非 Send 类型会报错；需用 Arc/Mutex 或确保 Send。',
  ],
  example: `use tokio::time::{sleep, Duration};

async fn fetch(id: u32) -> u32 {
    sleep(Duration::from_millis(100)).await;  // 模拟网络请求
    println!("fetched {}", id);
    id * 2
}

#[tokio::main]
async fn main() {
    // 顺序 await
    let a = fetch(1).await;
    let b = fetch(2).await;

    // 并发 await（同时发起）
    let (x, y) = tokio::join!(fetch(10), fetch(20));
    println!("{} {} {}", a + b, x, y);

    // spawn 并发任务
    let handle = tokio::spawn(fetch(99));
    let result = handle.await.unwrap();
    println!("spawned result {}", result);
}
// Cargo.toml 需加: tokio = { version = "1", features = ["full"] }`,
};

const rust20 = {
  id: 'rust-smart-pointers',
  title: '20. 智能指针：Box / Rc / RefCell / Arc',
  category: '内存',
  version: '1.0+',
  level: '高级',
  summary: '智能指针拥有数据并提供额外能力：Box 堆分配、Rc 引用计数、RefCell 内部可变性、Arc 线程安全。',
  detail: [
    'Box<T>：在堆上分配值，作用域结束自动释放，最简单的智能指针。',
    'Rc<T>：单线程引用计数，允许多个所有者（不可变共享）；Rc::clone 增加计数。',
    'RefCell<T>：内部可变性，运行时检查借用规则（绕过编译期借用检查）。',
    'Arc<T>：原子引用计数，多线程共享（配合 Mutex 做修改）。',
    'Rc<RefCell<T>>：多所有者 + 内部可变，常见于图/树结构。',
    '循环引用会内存泄漏；用 Weak<T> 打破强引用环。',
  ],
  notes: [
    'Rc 不能跨线程（非 Send）；要用 Arc。',
    'RefCell 在运行时违反借用规则会 panic——不如编译期安全，需谨慎。',
  ],
  example: `use std::cell::RefCell;
use std::rc::Rc;
use std::sync::{Arc, Mutex};

// Box：堆分配
fn main() {
    let b = Box::new(5);
    println!("{}", *b);  // 5

    // Rc<RefCell<T>>：多所有者 + 内部可变
    let v = Rc::new(RefCell::new(vec![1, 2]));
    let a = Rc::clone(&v);
    let c = Rc::clone(&v);
    a.borrow_mut().push(3);   // 可变借入
    c.borrow_mut().push(4);
    println!("{:?}", v.borrow());  // [1,2,3,4]

    // Arc<Mutex<T>>：多线程共享可变
    let m = Arc::new(Mutex::new(0));
    let m2 = Arc::clone(&m);
    // 放入线程中使用
}
// 多线程示例
// let m = Arc::new(Mutex::new(0));
// for _ in 0..3 {
//     let m = Arc::clone(&m);
//     let t = std::thread::spawn(move || {
//         let mut g = m.lock().unwrap();
//         *g += 1;
//     });
// }`,
};

if (typeof module !== 'undefined') module.exports = { rust16, rust17, rust18, rust19, rust20 };