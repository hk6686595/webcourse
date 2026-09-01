// Rust 教程 21–26：工程实践与实战
const rust21 = {
  id: 'rust-modules',
  title: '21. 模块系统与 Cargo 生态：mod / use / crate',
  category: '工程实践',
  version: '1.0+',
  level: '进阶',
  summary: 'Rust 模块组织：mod 声明、use 引入、pub 可见性、文件模块与 crate 架构。',
  detail: [
    'mod 声明子模块：mod utils { ... } 或对应文件（lib.rs / main.rs 中 mod utils; 指向 utils.rs）。',
    '可见性默认私有：pub 公开、pub(crate) 仅 crate 内、pub(super) 父模块。',
    'use path::to::Item 引入到作用域；use std::collections::HashMap。',
    'as 别名：use std::io::Result as IoResult。',
    'crate 根：二进制 crate（main.rs）或库 crate（lib.rs）。',
    '片段 use a::b::{c, d}；通配 use a::b::*；嵌套路径 use a::{b, c::d}。',
  ],
  notes: [
    '模块文件和目录：文件 foo.rs 是模块 foo，目录 foo/mod.rs 或主文件 foo.rs + foo/ 子文件。',
    'src/bin/ 下的每个文件是一个独立可执行 crate。',
  ],
  example: `// src/main.rs
mod math;   // 读取 math.rs

use crate::math::add;

fn main() {
    println!("{}", add(2, 3));
}

// ---- src/math.rs ----
// pub fn add(a: i32, b: i32) -> i32 { a + b }

// ---- 嵌套模块 ----
// 目录结构：
// src/
//   main.rs
//   utils/
//     mod.rs   （mod utils; 声明）
//     time.rs  （mod time; 声明）
// 访问：use crate::utils::time::now;

// ---- 第三方 crate ----
// use serde::{Serialize, Deserialize};
// #[derive(Serialize)]
// struct Data { id: u32 }`,
};

const rust22 = {
  id: 'rust-testing',
  title: '22. 测试：单元测试、集成测试与 #[test]',
  category: '工程实践',
  version: '1.0+',
  level: '进阶',
  summary: '编写单元测试（#[cfg(test)] + #[test]）、集成测试（tests/ 目录）、常用断言与 cargo test。',
  detail: [
    '单元测试在模块内用 #[test] 标注函数，配合 #[cfg(test)] 条件编译。',
    '断言：assert!、assert_eq!(a, b)、assert_ne!；统一消息 assert_eq!(a, b, "msg {}", x)。',
    '集成测试：tests/ 目录下的每个 .rs 文件作为独立 crate 测试公共 API。',
    'cargo test 运行所有测试；cargo test 名称 只运行匹配的测试。',
    '错误处理测试：should_panic 属性、Result<T,E> 返回类型测试。',
    '文档测试：/// ``` 代码块可被 cargo test 当作测试执行。',
  ],
  notes: [
    '公共 API 用集成测试验证，私有细节用单元测试。',
    '#[should_panic(expected = "...")] 断言 panic 消息。',
  ],
  example: `// -------- 单元测试 --------
pub fn add(a: i32, b: i32) -> i32 { a + b }

pub fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 { Err("divide by zero".to_string()) }
    else { Ok(a / b) }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add() {
        assert_eq!(add(2, 3), 5);
        assert_ne!(add(2, 2), 5);
    }

    #[test]
    fn test_divide() {
        assert!(divide(10.0, 2.0).is_ok());
        let err = divide(1.0, 0.0).unwrap_err();
        assert_eq!(err, "divide by zero");
    }

    #[test]
    #[should_panic]
    fn test_panic() {
        panic!("expected");
    }
}

// -------- 集成测试 tests/integration.rs --------
// use mylib::add;
// #[test]
// fn it_works() { assert_eq!(add(1, 1), 2); }
//
// 运行：cargo test`,
};

const rust23 = {
  id: 'rust-docs',
  title: '23. 文档注释与 cargo doc',
  category: '工程实践',
  version: '1.0+',
  level: '进阶',
  summary: '三斜线文档注释 ///、文档测试、cargo doc 生成 HTML 文档、常用文档风格。',
  detail: [
    '/// 文档注释放在项（函数/结构体/模块）前，用 Markdown 书写，可含代码块（文档测试）。',
    '#[doc = "..."] 属性形式；//! 是模块/文件级文档注释（放在文件开头）。',
    '文档中的 ```rust 代码块会被 cargo test 执行，作为文档测试。',
    'cargo doc 生成 HTML 文档到 target/doc/，cargo doc --open 浏览器打开。',
    '标准库 crate 文档结�：功能简介、示例、Panics 段、Errors 段、Safety 段。',
    '良好的文档是 Rust crate 质量的重要部分，Rust 对文档支持一流。',
  ],
  notes: [
    '文档测试很强大：可杜绝文档示例过期导致的错误。',
    '可用 ["Read more"] 隐藏长示例代码。',
  ],
  example: `/// 计算两个整数的和。
///
/// # 示例
/// \`\`\`
/// let result = add(2, 3);
/// assert_eq!(result, 5);
/// \`\`\`
///
/// # Panics
/// 仅当参数溢出时（debug 模式）才 panic。
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

//! 这个文件的模块级文档。
//! 用 //! 写在文件开头。

fn main() {
    println!("{}", add(1, 2));
}
// 生成文档：cargo doc --open`,
};

const rust24 = {
  id: 'rust-cli',
  title: '24. 实战：命令行工具（CLI）——文件行数统计',
  category: '实战',
  version: '1.0+',
  level: '进阶',
  summary: '用 std::env、std::fs 和 clap 库构建一个统计文件行数/单词数的命令行工具。',
  detail: [
    'std::env::args() 读取命令行参数；更专业用 clap 库解析。',
    'std::fs::read_to_string 读取文件；错误用 Result 传播。',
    '遍历目录可递归读取多个文件。',
    '用 clap 实现子命令、参数校验、帮助信息、版本号。',
    '输出到 stdout，支持管道和重定向。',
    '发布：cargo build --release 得到可执行文件，cargo install 全局安装。',
  ],
  notes: [
    'clap 提供 derive 宏，代码简洁：#[derive(Parser)] struct Args。',
    '错误处理用 anyhow 库简化（? 运算符 + 自定义上下文）。',
  ],
  example: `use std::env;
use std::fs;

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        println!("用法: cli <文件名>");
        return;
    }
    let filename = &args[1];
    match fs::read_to_string(filename) {
        Ok(content) => {
            println!("行数: {}", content.lines().count());
            println!("单词数: {}", content.split_whitespace().count());
        }
        Err(e) => println!("读取失败: {}", e),
    }
}`,
};

const rust25 = {
  id: 'rust-web-server',
  title: '25. 实战：用 Axum 构建 Web 服务（REST API）',
  category: '实战',
  version: '1.0+',
  level: '高级',
  summary: '用 Axum + Tokio 构建一个异步 REST API 服务，含路由、状态、JSON 序列化。',
  detail: [
    'Axum 是 Tokio 官方 Web 框架，基于 tower 中间件生态，类型安全。',
    '路由：Router::new().route("/hello", get(handler))。',
    '处理函数签名决定注入：Path<T> 路径参数、State<T> 共享状态、Json<T> 请求体。',
    'JSON 序列化/反序列化用 serde + serde_json。',
    '共享状态用 Arc<AppState> 包裹，跨请求安全共享。',
    'Cargo.toml 依赖：axum、tokio、serde、serde_json。',
  ],
  notes: [
    'Axum 是当前最流行的 Rust Web 框架，替代了早期的 tokio-rs 微服务方案。',
    '异步运行时 Tokio + Axum 能处理极高并发连接。',
  ],
  example: `use axum::{
    routing::get,
    Router,
    extract::{Path, State},
    Json,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use std::collections::HashMap;

#[derive(Serialize)]
struct User {
    id: u32,
    name: String,
}

type AppState = Arc<HashMap<u32, String>>;

async fn get_user(Path(id): Path<u32>, State(db): State<AppState>) -> Json<User> {
    let name = db.get(&id).cloned().unwrap_or_default();
    Json(User { id, name })
}

async fn hello() -> &'static str {
    "Hello, Rust!"
}

#[tokio::main]
async fn main() {
    let mut db = HashMap::new();
    db.insert(1, String::from("Alice"));
    let state: AppState = Arc::new(db);

    let app = Router::new()
        .route("/", get(hello))
        .route("/user/:id", get(get_user))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    println!("服务已启动 http://localhost:3000");
    axum::serve(listener, app).await.unwrap();
}
// Cargo.toml:
// axum = "0.7", tokio = { version = "1", features = ["full"] },
// serde = { version = "1", features = ["derive"] }, serde_json = "1"`,
};

const rust26 = {
  id: 'rust-roadmap',
  title: '26. Rust 学习路线：从入门到工程化',
  category: '实战',
  version: '1.0+',
  level: '高级',
  summary: '系统总结 Rust 学习路径，推荐进阶方向：系统编程、Web 后端、Wasm、嵌入式与安全。',
  detail: [
    '阶段一（已覆盖）：语法、所有权、借用、生命周期、数据结构、错误处理。',
    '阶段二：泛型、Trait、宏、迭代器/闭包、并发（thread/channel/Mutex/async）。',
    '阶段三：工程化——模块、测试、文档、cargo 工作区、CI/CD、性能分析（cargo flamegraph）。',
    '进阶方向 A：Web 后端（Axum/Actix）+ 数据库（sqlx/diesel）。',
    '进阶方向 B：系统编程（OS、驱动、安全工具）；WebAssembly（wasm-bindgen/wasm-pack）。',
    '权威资源：《The Rust Programming Language》(Rust Book)、Rust by Example、rustlings 练习；可选 RUST-101。',
  ],
  notes: [
    '强烈建议通过 rustlings 交互式练习 + 动手写真实项目巩固。',
    '可尝试 Rust 认证（AXE）或参与开源 Rust 项目提升实战能力。',
  ],
  example: `# 安装工具链
rustup update
rustup component add clippy rustfmt

# 常用命令
cargo new myapp && cd myapp
cargo run
cargo build --release
cargo test
cargo clippy
cargo fmt
cargo doc

# 推荐练习路径
# 1. rustlings 练习（逐步过语法）
# 2. 实现一个 CLI 工具（如文件重命名器）
# 3. 用 Axum 写一个 REST API
# 4. 用 wasm-bindgen 写一个前端模块
# 5. 阅读 std 库源码，理解常见类型的实现

# 在线资源
# https://doc.rust-lang.org/book/
# https://play.rust-lang.org/`,
};

if (typeof module !== 'undefined') module.exports = { rust21, rust22, rust23, rust24, rust25, rust26 };