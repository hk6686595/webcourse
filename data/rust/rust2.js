// Rust 教程 6–10：所有权与内存
const rust6 = {
  id: 'rust-ownership',
  title: '6. 所有权 Ownership：Rust 内存安全的基石',
  category: '所有权',
  version: '1.0+',
  level: '入门',
  summary: '所有权三原则：每个值有一个所有者、同一时刻只有一个所有者、值离开作用域即被 drop 释放。',
  detail: [
    'Rust 用所有权管理堆内存，无需 GC——这是它内存安全的根本。',
    '规则一：Rust 中每个值都有一个变量（owner）。',
    '规则二：同一时刻只能有一个所有者，赋值或传参会转移所有权（move）。',
    '规则三：当所有者（变量）离开作用域时，值调用 drop 自动释放。',
    'String、Vec 等堆类型遵循 move 语义；i32 等可 Copy 的类型赋值是拷贝而非 move。',
    '理解 move 能避免悬垂指针：被转移的所有者不能再被使用。',
  ],
  notes: [
    'Copy trait（整型、浮点、bool、char、元组）赋值是拷贝；String、Vec 默认 move。',
    'move 后原变量失效："use of moved value" 是常见编译错误。',
  ],
  example: `fn main() {
    // 堆类型（String）→ move 语义
    let s1 = String::from("hello");
    let s2 = s1;               // 所有权从 s1 转移到 s2
    // println!("{}", s1);     // 编译错误：s1 已被 move
    println!("{}", s2);        // hello

    // Copy 类型（i32）→ 拷贝语义
    let x = 5;
    let y = x;                 // 拷贝，x 仍可用
    println!("{} {}", x, y);   // 5 5

    // 传参也会 move
    let name = String::from("Rust");
    take_ownership(name);
    // println!("{}", name);   // 错误：所有权已转移进函数
}

fn take_ownership(s: String) {
    println!("took: {}", s);   // s 离开作用域后自动 drop
}`,
};

const rust7 = {
  id: 'rust-references',
  title: '7. 引用与借用：& 与 &mut，借用规则',
  category: '所有权',
  version: '1.0+',
  level: '入门',
  summary: '引用（&T 和 &mut T）允许访问值而不转移所有权，受借用检查器规则约束。',
  detail: [
    '借用（borrow）通过引用实现：&s 借用不可变引用，&mut s 可变引用。',
    '借用规则一：任意时刻只能有一个可变引用（&mut），或任意多个不可变引用（&）。',
    '借用规则二：可变引用与不可变引用不能同时存在。',
    '借用规则三：借用不能超过其作用域/所有者的生命周期（避免悬垂）。',
    '函数参数用 & 接收可避免 move，从而能多次使用。',
    '引用默认不可变；要修改借用的值必须用 &mut。',
  ],
  notes: [
    '借用规则在编译期检查，违反会得到 "cannot borrow as mutable" 错误。',
    '借用检查器（borrow checker）是 Rust 新手最常遇到的编译器报错来源。',
  ],
  example: `fn main() {
    let mut s = String::from("hello");

    // 不可变借用（多个可同时存在）
    let r1 = &s;
    let r2 = &s;
    println!("{} {}", r1, r2);

    // 可变借用（只能一个）
    let rm = &mut s;
    rm.push_str(" world");
    // println!("{}", r1);   // 错误：r1 的可变借用 rm 仍持有
    println!("{}", rm);      // hello world

    // 通过函数借用
    let len = length(&s);
    println!("len = {}", len);
}

fn length(x: &String) -> usize {
    x.len()  // 借用只读，不转移所有权
}`,
};

const rust8 = {
  id: 'rust-lifetimes',
  title: '8. 生命周期 Lifetime：悬垂引用的防线',
  category: '所有权',
  version: '1.0+',
  level: '进阶',
  summary: '生命周期标注（\'a）告诉编译器引用有效范围，防止悬垂引用；省略规则与 elision。',
  detail: [
    '生命周期是编译器用来跟踪引用有效性的机制，确保引用不会指向已释放的内存。',
    '标注语法：fn f<\'a>(x: &\'a str) -> &\'a str，意思输入输出生命周期相同。',
    '生命周期省略（elision）规则：大部分常见情况（单输入单输出绑定）编译器自动推断，无需手写。',
    '当函数返回的引用与某个输入参数绑定时，需显式标注以连接它们。',
    'API 设计：不要返回函数内创建的局部变量的引用（悬垂）。',
    '静态生命周期 \'static：整个程序运行期间都有效的引用（如字符串字面量）。',
  ],
  notes: [
    '生命周期标注不改变实际内存分配，只用于帮助借用检查器分析。',
    '最常见需要手写生命周期的是自定义结构体持有引用时：struct Foo<\'a> { x: &\'a str }。',
  ],
  example: `// 省略规则自动处理：单输入，返回值生命周期绑定
fn first_word(s: &str) -> &str {
    match s.find(' ') { Some(i) => &s[..i], None => s }
}

// 需要显式标注：返回的引用必须与两个输入之一生命周期一致
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

// 结构体持有引用需标注
struct Person<'a> {
    name: &'a str,
}

fn main() {
    let a = String::from("hello world");
    let w = first_word(&a);
    println!("{}", w);  // hello

    let x = "abcd";
    let y = "efghijk";
    println!("{}", longest(x, y));  // efghijk
}`,
};

const rust9 = {
  id: 'rust-slices',
  title: '9. 切片 Slice：没有所有权的视图',
  category: '所有权',
  version: '1.0+',
  level: '入门',
  summary: '切片是对连续数据的引用视图 &[T] 和 &str，不拥有数据。',
  detail: [
    '切片（slice）是对数组/String 的一部分的不可变引用，含起始位置和长度。',
    '字符串切片类型是 &str，通过 &s[..] 或字符串字面量获得。',
    '数组切片 &[i32]：&arr[1..3] 取索引 1 到 2（左闭右开）。',
    '切片没有所有权，是引用的一种，避免拷贝大数据。',
    '字符串字面量 "hello" 的类型就是 &str（静态生命周期）。',
    '函数参数常用 &str 而非 &String，更灵活（能接收字符串字面量）。',
  ],
  notes: [
    '索引越界会 panic；用 get() 返回 Option 更安全。',
    '字面量范围的 String 切片必须落在 UTF-8 字符边界，否则 panic。',
  ],
  example: `fn main() {
    // 数组切片
    let arr = [1, 2, 3, 4, 5];
    let slice: &[i32] = &arr[1..3];
    println!("{:?}", slice);  // [2, 3]

    // 字符串切片
    let s = String::from("hello world");
    let hello = &s[0..5];
    let world = &s[6..];
    println!("{} {}", hello, world);

    // 整串切片
    let whole = &s[..];
    // 注意 UTF-8：s[0..3] 等于 "hel"

    // &str 参数更通用
    fn len(x: &str) -> usize { x.len() }
    println!("{}", len(&s));       // 传 &String
    println!("{}", len(""));        // 传字面量
}`,
};

const rust10 = {
  id: 'rust-string-vs-str',
  title: '10. String 与 &str：可变堆字符串与不可变借用视图',
  category: '所有权',
  version: '1.0+',
  level: '入门',
  summary: '区分 String（拥有所有权、可增长）与 &str（借用、固定内容），以及相互转换。',
  detail: [
    'String 是拥有所有权的、可变、可增长的 UTF-8 字符串（堆分配）。',
    '&str 是不可变字符串切片（借用），本质是 (指针, 长度) 的视图。',
    '创建 String：String::from("x")、s.to_string()、"x".to_owned()。',
    '&str 转 String：to_string() / to_owned()（拷贝一份拥有）。',
    'String 转 &str：&s 或 s.as_str()（借用，不拷贝）。',
    '字符串拼接：+ 或 format!("{} {}", a, b)；+ 的左边需是 String。',
  ],
  notes: [
    '字符串是 UTF-8 编码，s.len() 返回字节数而非字符数；Char 计数用 s.chars().count()。',
    '索引访问字符串需通过 bytes() 或 chars()，不能直接 s[0]。',
  ],
  example: `fn main() {
    // String（拥有）
    let mut s = String::from("Hello");
    s.push_str(", World");       // 追加
    s.push('!');                 // 追加单字符
    println!("{}", s);

    // 转 &str（借用）
    let slice: &str = &s;
    println!("{}", slice);

    // &str 转 String（拷贝）
    let owned: String = slice.to_string();
    let owned2: String = String::from("literal");

    // 拼接
    let a = String::from("foo");
    let b = String::from("bar");
    let c = a + &b;              // a 被 move，b 借用
    println!("{}", c);

    // 字符 vs 字节
    let zh = String::from("你好");
    println!("字节数: {}", zh.len());      // 6
    println!("字符数: {}", zh.chars().count());  // 2
}`,
};

if (typeof module !== 'undefined') module.exports = { rust6, rust7, rust8, rust9, rust10 };