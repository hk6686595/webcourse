// JavaScript 语法详解 —— 第三部分：ES 新特性、集合与元编程
module.exports = [
  {
    id: 'symbol',
    title: 'Symbol 类型',
    category: '类型与元编程',
    version: 'ES6 (ES2015)',
    level: '进阶',
    summary: '唯一且不可变的原始值，常用作对象属性的"隐藏键"。',
    detail: [
      'Symbol(description) 每次创建都独一无二，即使描述相同也不相等，因此可用作避免命名冲突的属性键。',
      'Symbol 作键的属性不会出现在 for...in、Object.keys、JSON.stringify 中（隐藏语义），但可用 Object.getOwnPropertySymbols 枚举。',
      '内置 Symbol 如 Symbol.iterator、Symbol.toStringTag、Symbol.asyncIterator 是语言的"钩子"，用于定制行为。',
      'Symbol.for(key) 从全局注册表取/建共享 Symbol；Symbol.keyFor 取回 key。'
    ],
    example:
      'const id = Symbol("id");\n' +
      'const user = { name: "张三", [id]: 123 };\n\n' +
      'user[id];                    // 123\n' +
      'Object.keys(user);           // ["name"]（Symbol 键不可见）\n' +
      'Object.getOwnPropertySymbols(user); // [Symbol(id)]\n\n' +
      '// 自定义迭代钩子\n' +
      'const iterable = {\n' +
      '  [Symbol.iterator]() { return [1, 2, 3][Symbol.iterator](); }\n' +
      '};'
  },
  {
    id: 'es-modules',
    title: '模块 import / export',
    category: '工程化',
    version: 'ES2015',
    level: '进阶',
    summary: 'ES 模块用 import/export 取代 IIFE 与 CommonJS，浏览器与 Node 原生支持。',
    detail: [
      'export 导出绑定（命名导出或默认导出 default）；import 引入，命名导入用花括号，默认导入不加花括号。',
      '模块是严格模式、单例、文件作用域隔离；导入的是"活绑定"，对导出值的修改在导入侧可见。',
      'import * as ns 整体导入；import "x" 仅执行副作用；type-only 导入（TS）不出现在运行时。',
      '浏览器中用 <script type="module"> 加载；Node 中 .mjs 或 package.json 设 "type":"module"。'
    ],
    notes: [
      '默认导出与命名导出可混用，但一个模块只能有一个 default；重命名用 import { a as b }。',
      '循环依赖在 ES 模块中是允许的，活绑定机制通常能工作，但初始化顺序要谨慎。'
    ],
    example:
      '// math.js\n' +
      'export const PI = 3.14;\n' +
      'export function add(a, b) { return a + b; }\n' +
      'export default class Calculator {}\n\n' +
      '// main.js\n' +
      'import Calc, { PI, add as plus } from "./math.js";\n' +
      'import * as math from "./math.js";\n\n' +
      'console.log(PI, plus(1, 2), new Calc());\n' +
      'console.log(math.add(3, 4));'
  },
  {
    id: 'dynamic-import',
    title: '动态 import()',
    category: '工程化',
    version: 'ES2020',
    level: '进阶',
    summary: 'import() 返回 Promise，按需加载模块实现代码分割。',
    detail: [
      '静态 import 必须在顶层；import() 是函数式调用，可在任意位置、条件分支、事件回调里动态加载。',
      '返回的 Promise resolve 为模块命名空间对象，与静态 import 的 ns 一致。',
      '常用于路由懒加载、按需加载重型依赖，减少首屏体积。',
      '顶层 await 与动态 import 配合可做条件性初始化。'
    ],
    example:
      'button.addEventListener("click", async () => {\n' +
      '  const { openEditor } = await import("./editor.js");\n' +
      '  openEditor();\n' +
      '});\n\n' +
      '// 条件加载 polyfill\n' +
      'if (!window.fetch) {\n' +
      '  await import("whatwg-fetch");\n' +
      '}'
  },
  {
    id: 'collections-map-set',
    title: 'Map / Set / WeakMap / WeakSet',
    category: '集合',
    version: 'ES6 (ES2015)',
    level: '入门',
    summary: '真正的键值集合：Map 任意键、Set 去重、Weak 版可被 GC 回收。',
    detail: [
      'Map 的键可以是任意值（对象、函数），不强制转字符串；Object 的键只能是字符串/symbol。',
      'Set 是值的集合，自动去重，常用于数组去重 new Set(arr) 与成员判断 has。',
      'WeakMap/WeakSet 只持有弱引用，键必须是对象，不可枚举、不能遍历，但允许键被回收，适合缓存/私有数据。',
      '遍历：Map 有 entries/keys/values，for...of 直接遍历 [key,value]。'
    ],
    notes: [
      '需要序列化或用普通属性访问语法（obj.x）时仍用普通对象；需要任意键或频繁增删用 Map。',
      'WeakMap 不能 .size、不能清空、不能遍历——它的价值正是"弱引用"。'
    ],
    example:
      'const m = new Map();\n' +
      'm.set("a", 1).set(42, "num").set({k: 1}, "obj");  // 链式\n' +
      'm.get(42);                    // "num"\n' +
      'm.has("a");                   // true\n\n' +
      'const s = new Set([1, 1, 2, 3]);  // {1,2,3}\n' +
      's.has(2);                     // true\n\n' +
      '// 私有数据弱引用缓存\n' +
      'const cache = new WeakMap();\n' +
      'cache.set(obj, expensive);    // obj 被回收时缓存一并释放'
  },
  {
    id: 'proxy-reflect',
    title: 'Proxy 与 Reflect',
    category: '类型与元编程',
    version: 'ES6 (ES2015)',
    level: '高级',
    summary: 'Proxy 拦截对象操作，Reflect 提供对应的默认行为调用。',
    detail: [
      'Proxy(target, handler) 包裹目标对象，handler 里可拦截 get/set/deleteProperty/has/apply/construct 等陷阱（trap）。',
      'Reflect 的方法与 handler 陷阱一一对应，用 Reflect.get(target, key, receiver) 调用"默认"行为，避免手写 this 绑定出错。',
      '典型应用：数据校验、双向绑定（Vue 3 响应式）、日志、不可变包装、默认值。',
      'Proxy 是浅代理：嵌套对象访问不会自动代理，需要递归包装（或懒代理）。'
    ],
    notes: [
      'Proxy 有性能开销，热路径不要给每个对象都包一层。',
      '已被代理对象的 === 与原对象不再相等。'
    ],
    example:
      'const target = { name: "张三", age: 20 };\n' +
      'const proxy = new Proxy(target, {\n' +
      '  get(t, key, recv) {\n' +
      '    console.log("读取", key);\n' +
      '    return Reflect.get(t, key, recv);\n' +
      '  },\n' +
      '  set(t, key, val, recv) {\n' +
      '    if (key === "age" && val < 0) throw new Error("年龄非法");\n' +
      '    return Reflect.set(t, key, val, recv);\n' +
      '  }\n' +
      '});\n\n' +
      'proxy.name;        // 日志：读取 name\n' +
      'proxy.age = -1;    // 抛错'
  },
  {
    id: 'bigint',
    title: 'BigInt 大整数',
    category: '类型与元编程',
    version: 'ES2020',
    level: '入门',
    summary: '表示任意精度整数，解决 Number 精度不足问题。',
    detail: [
      'BigInt 字面量在整数后加 n（如 123n）；或用 BigInt("123") 从字符串构造，避免大数先被 Number 截断。',
      'BigInt 与 Number 不能混合运算（会抛 TypeError），需显式转换；精度对比 Number 无损。',
      '适用于加密、大 ID、高精度计数等；JSON 不直接支持 BigInt（需手动序列化）。'
    ],
    notes: [
      '比较时 1n === 1 为 false（不同类型），但 1n == 1 为 true（宽松相等允许）。',
      'typeof 123n 返回 "bigint"。'
    ],
    example:
      'const max = 9007199254740991n;      // 超过 Number.MAX_SAFE_INTEGER\n' +
      'max + 1n;                            // 9007199254740992n（精确）\n\n' +
      'const big = BigInt("123456789012345678901234567890");\n' +
      'big * 2n;\n\n' +
      '// 与 Number 不能混算\n' +
      '// big + 1;                          // TypeError\n' +
      'big + BigInt(1);                     // OK'
  },
  {
    id: 'logical-assignment',
    title: '逻辑赋值运算符',
    category: 'ES 新特性',
    version: 'ES2021',
    level: '入门',
    summary: '??=、||=、&&= 把"判断 + 赋值"合并成一步。',
    detail: [
      'a ??= b：当 a 为 null/undefined 时才把 b 赋给 a。',
      'a ||= b：当 a 为假值时赋值；a &&= b：当 a 为真值时赋值。',
      '等价于先判断再赋值，但只求值一次右侧，更简洁也更安全。'
    ],
    example:
      'let config = {};\n' +
      'config.timeout ??= 3000;          // timeout 为空则设默认\n' +
      'config.debug ||= false;           // 假值则补默认\n\n' +
      'let user = { name: "x" };\n' +
      'user.name &&= user.name.toUpperCase();   // 有值才转大写'
  },
  {
    id: 'object-static-methods',
    title: 'Object 静态方法集',
    category: '对象与类',
    version: 'ES2015+',
    level: '入门',
    summary: 'entries / fromEntries / keys / values / assign 串起对象与 Map 互转。',
    detail: [
      'Object.entries(obj) 返回 [key,value] 数组，便于用数组方法处理对象；Object.fromEntries 反向还原。',
      'Object.keys/values 取键/值数组（不含 Symbol 键）；Object.getOwnPropertyNames 含不可枚举。',
      'Object.assign 浅拷贝合并（目标优先），现代更推荐展开 ...；Object.freeze/seal/preventExtensions 控制可变性。',
      'Object.hasOwn(obj, key)（ES2022）取代 obj.hasOwnProperty 调用，避免原型上方法被覆盖的问题。'
    ],
    example:
      'const obj = { a: 1, b: 2 };\n' +
      'const entries = Object.entries(obj);   // [["a",1],["b",2]]\n\n' +
      '// 对象 → Map → 处理 → 对象\n' +
      'const map = new Map(Object.entries(obj));\n' +
      'map.set("c", 3);\n' +
      'Object.fromEntries(map);  // { a:1, b:2, c:3 }\n\n' +
      'const merged = Object.assign({}, obj, { b: 9 });  // { a:1, b:9 }\n' +
      'const frozen = Object.freeze({ x: 1 });\n' +
      'Object.hasOwn(frozen, "x");           // true'
  },
  {
    id: 'numeric-separators',
    title: '数值分隔符与顶层 await',
    category: 'ES 新特性',
    version: 'ES2021 / ES2022',
    level: '入门',
    summary: '1_000_000 提升大数可读性；顶层 await 让模块初始化可等待。',
    detail: [
      '数字字面量可用下划线分隔：1_000_000、0b1010_1111、0xFF_FF，编译期忽略，纯提升可读性。',
      '顶层 await 允许在 ES 模块顶层直接写 await，模块会等待其完成后再执行后续导入者——适合配置加载、连接数据库。',
      '顶层 await 只能在模块（type=module）中使用，普通脚本不可用。'
    ],
    example:
      'const bytes = 1_024_000;          // 一目丁然\n' +
      'const mask = 0b1111_0000;\n\n' +
      '// module.mjs 顶层 await\n' +
      'const config = await fetch("/config.json").then(r => r.json());\n' +
      'export const apiBase = config.apiBase;   // 导入方拿到的已是就绪配置'
  },
  {
    id: 'strict-mode',
    title: '严格模式 "use strict"',
    category: '基础',
    version: 'ES5',
    level: '进阶',
    summary: '更严格的解析与报错，消除静默错误，是现代 JS 的默认前提。',
    detail: [
      '在脚本或函数顶部加 "use strict" 即开启严格模式：禁止意外的全局变量、删除不可删属性抛错、this 不再默认指向全局。',
      'ES6 的 class、模块自动处于严格模式，无需手动声明。',
      '严格模式让一些"草率写法"在开发期就暴露，也利于引擎优化。'
    ],
    notes: [
      '老代码拼接到严格模式里可能报错（如给未声明变量赋值），迁移时按文件粒度开启更稳妥。'
    ],
    example:
      '"use strict";\n\n' +
      '// 非严格模式：给未声明变量赋值会创建全局变量\n' +
      '// 严格模式：直接抛出 ReferenceError\n' +
      'function f() {\n' +
      '  // undeclared = 1;     // 严格模式下报错\n' +
      '  "use strict";\n' +
      '  const ok = 1;\n' +
      '  return ok;\n' +
      '}\n\n' +
      '// 禁止重复参数名、八进制字面量 010 也会报错'
  }
];
