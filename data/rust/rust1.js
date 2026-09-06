// Rust 教程 1–5：入门基础
const rust1 = {
  id: 'rust-intro',
  title: '1. Rust 是什么：内存安全 + 高并发 + 零成本抽象',
  category: '入门',
  version: '1.0+',
  level: '入门',
  summary: '理解 Rust 的核心设计目标：无 GC 的内存安全、无数据竞争的并发、零成本抽象，以及它为何连续多年成为最受喜爱的语言。',
  detail: [
    'Rust 由 Mozilla 于 2010 年启动，2015 年发布 1.0，所有权（Ownership）系统在编译期保证内存安全，无需垃圾回收器（GC）。',
    '三大承诺：内存安全（无空指针、无悬垂引用、无缓冲区溢出）、线程安全（避免数据竞争）、零成本抽象（抽象不牺牲性能）。',
    '没有 GC 意味着不像 Java/Go 有暂停，性能接近 C/C++，可用在系统编程、嵌入式、WebAssembly。',
    '编译器 rustc 极其严格，会拒绝大量其他语言能编译但运行时崩溃的代码——"编译不过"是常态，通过即安全。',
    '生态有包管理器 Cargo，类似 npm/pip，配合 crates.io 分发库，rustup 管理工具链。',
    '广泛用途：CLI 工具（ripgrep、bat）、操作系统内核、游戏引擎（Bevy）、区块链、网络服务（Tokio）、前端（Wasm）。',
  ],
  notes: [
    'Rust 学习曲线陡峭（借用检查器），但一旦理解所有权模型，代码会非常稳健。',
    'Rust 没有继承，用 Trait 组合代替——这是与 OOP 语言的显著差异。',
  ],
  example: `fn main() {
    // 不可变变量（默认）
    let name = "Rust";
    println!("Hello, {}!", name);

    // Rust 保证内存安全：以下代码无法通过编译
    // let r;
    // { let x = 5; r = &x; }  // 悬垂引用：x 已被 drop
    // println!("{}", r);
}`,
  example2: `# 安装 Rust（rustup，官方推荐）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

# 查看版本
rustc --version
cargo --version

# 在线体验：https://play.rust-lang.org`,
};

const rust2 = {
  id: 'rust-cargo-intro',
  title: '2. Cargo 项目管理：创建、构建、运行、依赖',
  category: '入门',
  version: '1.0+',
  level: '入门',
  summary: '掌握 Rust 官方构建工具 Cargo：项目初始化、构建运行、依赖管理、发布。',
  detail: [
    'cargo new myapp 创建二进制项目；cargo new --lib mylib 创建库项目。',
    'cargo build 编译（debug）；cargo build --release 发布优化（启用 -O）。',
    'cargo run 编译并运行；cargo check 快速检查编译错误（不生成二进制）。',
    'Cargo.toml 声明依赖：[dependencies] serde = "1.0"；Cargo.lock 锁定精确版本。',
    'cargo add serde 添加依赖；cargo update 更新；cargo doc 生成文档。',
    'cargo test 运行测试；cargo fmt 格式化；cargo clippy 静态检查。',
  ],
  notes: [
    'Cargo.toml 中 [package] 段的 edition 字段指明版本（2021 / 2024）。',
    'Rust 有 edition 模式，版本演进不破坏旧代码，比 Python 的 2/3 迁移温和得多。',
  ],
  example: `# 创建项目
cargo new --vcs git hello
cd hello

# 运行
cargo run

# 添加依赖
cargo add serde --features derive
cargo add tokio --features full

# Cargo.toml 示例
# [package]
# name = "hello"
# version = "0.1.0"
# edition = "2021"
#
# [dependencies]
# serde = { version = "1.0", features = ["derive"] }
# tokio = { version = "1.0", features = ["full"] }`,
};

const rust3 = {
  id: 'rust-variables-types',
  title: '3. 变量与数据类型：let / mut / 整型 / 浮点 / 布尔 / 字符',
  category: '入门',
  version: '1.0+',
  level: '入门',
  summary: 'Rust 变量默认不可变（immutable），数据类型、整型范围、类型推断与显式标注。',
  detail: [
    'let 声明的变量默认不可变；let mut x = 5 才可变。不可变性是 Rust 并发安全的基石。',
    'Rust 是静态强类型：编译期类型检查严格，写错类型直接报错。',
    '整型：i8/i16/i32/i64/i128/isize、u8/u16/u32/u64/u128/usize（有符号/无符号，usize 指针大小）。',
    '浮点：f32、f64；默认 f64。布尔 bool；字符 char（单个 Unicode 字符，4 字节）。',
    '类型推断：let x = 5 默认 i32，let c = 3.14 默认 f64；可用 let x: u32 = 5 显式标注。',
    '常量 const MAX: u32 = 100；必须显式标注类型，编译期求值，全大写命名。',
  ],
  notes: [
    '数值溢出在 debug 模式会 panic，release 模式默认环绕（可用 wrapping_* 明确）。',
    '字符串用双引号 "..."；单引号(英文符号) 用于 char 类型（单个字符）。',
  ],
  example: `fn main() {
    // 不可变
    let x = 5;
    // x = 6;  // 编译错误：x 不可变

    // 可变
    let mut y = 5;
    y = 6;

    // 类型标注与推断
    let a: i32 = -100;
    let b: u32 = 100;
    let c = 3.14;        // f64
    let flag: bool = true;
    let letter: char = 'R';

    // 常量
    const MSG: &str = "HELLO";

    println!("{} {} {} {} {}", a, b, c, flag, letter);
}`,
};

const rust4 = {
  id: 'rust-functions',
  title: '4. 函数：参数、返回值、表达式与语句',
  category: '入门',
  version: '1.0+',
  level: '入门',
  summary: 'Rust 函数定义、参数类型、返回值，以及表达式（expression）与语句（statement）的区别。',
  detail: [
    'fn add(a: i32, b: i32) -> i32 {} 定义函数，参数必须标类型，返回标在 -> 后。',
    '函数体最后一个表达式（无分号）即为返回值；也可用 return 显式返回。',
    '表达式（expression）有值：如 x + 1、函数调用；语句（statement）无值：如 let、赋值。',
    '空返回值用 -> () 或省略；() 是零元祖（unit），相当于 void。',
    '函数可以嵌套定义；命名用 snake_case。',
    '在 Rust 中，if / match / block 都可以作为表达式使用。',
  ],
  notes: [
    '函数体内的表达式以无分号结尾才返回值；多加了分号则变成语句返回 ()。',
    'return 用于提前返回，通常只在函数体中间或条件分支使用。',
  ],
  example: `fn add(a: i32, b: i32) -> i32 {
    a + b  // 表达式，无分号 → 返回值
}

fn show(x: i32) {
    println!("x = {}", x);  // 无 return → 默认返回 ()
}

fn main() {
    let sum = add(2, 3);
    println!("sum = {}", sum);  // 5

    // if 作为表达式
    let result = if sum > 4 { "big" } else { "small" };
    println!("{}", result);

    // block 作为表达式
    let val = {
        let y = 10;
        y * 2
    };
    println!("val = {}", val);  // 20
}`,
};

const rust5 = {
  id: 'rust-print-io',
  title: '5. 格式化输出与基础输入：print! / println! / format! / 标准输入',
  category: '入门',
  version: '1.0+',
  level: '入门',
  summary: 'Rust 的格式化输出宏、占位符语法，以及如何读取标准输入。',
  detail: [
    'println!("{}", x) 输出并换行；print! 不换行；eprintln! / eprint! 输出到 stderr。',
    '格式化占位符：{} 显示 Display；{:?} 调试 Debug（结构体等需 derive Debug）。',
    '位置参数：{0} {1}；命名参数：{name}；格式控制：{:>10} 右对齐、{:.2} 小数位、{:x} 十六进制。',
    'format! 返回格式化的 String（不打印）。',
    '读标准输入：use std::io; io::stdin().read_line(&mut input)。',
    '输入解析：trim() 去空白，parse::<i32>() 转数字（返回 Result）。',
  ],
  notes: [
    '读取输入后务必 trim()，否则会带上换行符，parse 会失败。',
    'String 默认按 UTF-8 处理，读取多字节中文注意字节偏移。',
  ],
  example: `use std::io;

fn main() {
    // 输出
    println!("Hello {}", "World");
    println!("{:?}", vec![1, 2, 3]);
    println!("{0} and {1} and {0}", "A", "B");  // A and B and A
    println!("{:>8}", "hi");                    // 右对齐宽度 8
    println!("{:.2}", 3.14159);                 // 3.14
    let s = format!("{} + {} = {}", 1, 2, 3);   // 生成 String

    // 输入
    println!("请输入数字:");
    let mut input = String::new();
    io::stdin().read_line(&mut input).expect("读取失败");
    let num: i32 = input.trim().parse().expect("不是数字");
    println!("你输入了: {}", num);
}`,
};

if (typeof module !== 'undefined') module.exports = { rust1, rust2, rust3, rust4, rust5 };