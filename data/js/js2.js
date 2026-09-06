// JavaScript 语法教程 —— 第二阶段：函数、对象与数据结构
module.exports = [
  {
    id: 'js-function-basics',
    title: '16. 函数基础',
    category: '函数与对象',
    version: '入门',
    level: '入门',
    summary: '函数声明、函数表达式、参数、返回值与提升。',
    detail: [
      '函数声明：function foo() {}，会被提升到作用域顶部，可在定义前调用。',
      '函数表达式：const foo = function() {}，不会被提升，必须先定义后使用。',
      '用 return 返回值；没有 return 时函数返回 undefined。参数可设默认值。',
      '函数也是对象，可作为值传递（回调）、赋值给变量、作为返回值。'
    ],
    example:
      'function add(a, b) {\n' +
      '  return a + b;\n' +
      '}\n' +
      'console.log(add(2, 3));        // 5\n\n' +
      'const greet = function (name) {\n' +
      '  return "你好 " + name;\n' +
      '};\n' +
      'console.log(greet("Tom"));\n\n' +
      'function mul(a, b = 2) {\n' +
      '  return a * b;\n' +
      '}\n' +
      'console.log(mul(3));           // 6（b 取默认值）',
    example3Title: '实战：函数作为一等公民（回调 / 工厂）',
    example3:
      '// 1) 回调：把函数传给另一个函数\n' +
      'const nums = [5, 2, 8, 1];\n' +
      'nums.sort((a, b) => a - b);\n' +
      'console.log(nums);            // [1, 2, 5, 8]\n\n' +
      '// 2) 工厂函数：返回一个"记住参数"的函数\n' +
      'function multiply(factor) {\n' +
      '  return x => x * factor;\n' +
      '}\n' +
      'const double = multiply(2);\n' +
      'const triple = multiply(3);\n' +
      'console.log(double(10), triple(10)); // 20 30\n\n' +
      '// 3) 对象里的方法也是函数\n' +
      'const math = { add: (a, b) => a + b };\n' +
      'console.log(math.add(4, 5)); // 9'
  },
  {
    id: 'js-arrow',
    title: '17. 箭头函数',
    category: '函数与对象',
    version: 'ES6',
    level: '入门',
    summary: '简洁的函数写法，且不绑定自己的 this。',
    detail: [
      '箭头函数：(参数) => 表达式 或 (参数) => { 语句 }，单参数可省括号，单返回值可省大括号和 return。',
      '它没有自己的 this、arguments、super，this 取自上一级作用域（词法 this）。',
      '因此箭头函数不适合用作对象方法或构造函数（不能用 new），但非常适合做回调。'
    ],
    example:
      'const square = x => x * x;\n' +
      'console.log(square(4));        // 16\n\n' +
      'const nums = [1, 2, 3];\n' +
      'const doubled = nums.map(n => n * 2);\n' +
      'console.log(doubled);          // [2, 4, 6]\n\n' +
      'const obj = {\n' +
      '  value: 10,\n' +
      '  get: () => this.value        // 这里的 this 不是 obj！\n' +
      '};\n' +
      '// obj.get();  // undefined（箭头函数 this 非 obj）',
    example3Title: '实战：箭头函数正确捕获 this',
    example3:
      '// 错误示范：对象方法用箭头函数，this 指向外层（window/undefined）\n' +
      'const bad = {\n' +
      '  value: 1,\n' +
      '  get: () => this.value        // this 不是 bad\n' +
      '};\n' +
      '// bad.get();  // undefined\n\n' +
      '// 正确：方法用普通函数，回调用箭头函数\n' +
      'const timer = {\n' +
      '  count: 0,\n' +
      '  start() {\n' +
      '    // 箭头函数的 this 继承 start 的 this（即 timer）\n' +
      '    setInterval(() => {\n' +
      '      this.count++;\n' +
      '      console.log(this.count);\n' +
      '    }, 1000);\n' +
      '  }\n' +
      '};\n' +
      '// timer.start();  // 每秒打印 1 2 3 ...'
  },
  {
    id: 'js-rest-params',
    title: '18. rest 参数与 arguments',
    category: '函数与对象',
    version: 'ES6',
    level: '入门',
    summary: '收集任意数量的参数为数组。',
    detail: [
      '在函数最后一个参数前加 ...，即可把剩余参数收集成一个真实数组（rest 参数）。',
      '老式的 arguments 是类数组对象，不具数组方法；优先使用 rest 参数。',
      'rest 参数必须放在参数列表最后。'
    ],
    example:
      'function sum(...nums) {\n' +
      '  return nums.reduce((a, b) => a + b, 0);\n' +
      '}\n' +
      'console.log(sum(1, 2, 3, 4));    // 10\n\n' +
      'function first(a, ...rest) {\n' +
      '  console.log("首个:", a);\n' +
      '  console.log("其余:", rest);\n' +
      '}\n' +
      'first(1, 2, 3);                  // 首个: 1  其余: [2, 3]',
    example3Title: '实战：rest 配合解构与真实可变参数',
    example3:
      '// 解构 + rest：取首个，其余收集\n' +
      'const [head, ...tail] = [10, 20, 30, 40];\n' +
      'console.log(head, tail);     // 10 [20, 30, 40]\n\n' +
      '// 真实可变参数函数：用分隔符拼接任意字符串\n' +
      'function join(sep, ...parts) {\n' +
      '  return parts.join(sep);\n' +
      '}\n' +
      'console.log(join("-", "a", "b", "c")); // a-b-c\n\n' +
      '// 把类数组 arguments 转成真数组（老代码兼容）\n' +
      'function legacy() {\n' +
      '  return [...arguments].map(Number);\n' +
      '}\n' +
      'console.log(legacy("1", "2")); // [1, 2]'
  },
  {
    id: 'js-scope-closure',
    title: '19. 作用域与闭包',
    category: '函数与对象',
    version: '进阶',
    level: '进阶',
    summary: '函数记住其词法作用域，就形成了闭包。',
    detail: [
      '作用域决定变量可见范围：全局、函数、块级（let/const）。内层可访问外层变量。',
      '闭包：内部函数引用了外部函数的变量，即使外部函数已返回，这些变量依然被"记住"。',
      '闭包是 JS 实现私有状态、工厂函数、回调捕获数据的基础，也是许多 bug 的来源（循环中 var 的经典坑）。'
    ],
    notes: [
      '循环中创建闭包时，用 let 而非 var，因为 let 每次迭代都有独立绑定。'
    ],
    example:
      'function makeCounter() {\n' +
      '  let count = 0;\n' +
      '  return function () {        // 闭包，记住了 count\n' +
      '    count++;\n' +
      '    return count;\n' +
      '  };\n' +
      '}\n' +
      'const c = makeCounter();\n' +
      'console.log(c(), c(), c());    // 1 2 3\n\n' +
      '// 循环闭包用 let 才正确\n' +
      'for (let i = 0; i < 3; i++) {\n' +
      '  setTimeout(() => console.log(i), 10);  // 0 1 2（var 会全输出 3）\n' +
      '}',
    example3Title: '实战：用闭包封装私有状态（模块模式）',
    example3:
      '// 闭包让 balance 对外不可直接访问，只能通过返回的方法修改\n' +
      'function createBank(initial) {\n' +
      '  let balance = initial;           // 私有变量\n' +
      '  return {\n' +
      '    deposit(n) { balance += n; },\n' +
      '    withdraw(n) { if (n <= balance) balance -= n; },\n' +
      '    getBalance() { return balance; }\n' +
      '  };\n' +
      '}\n' +
      'const bank = createBank(100);\n' +
      'bank.deposit(50);\n' +
      'console.log(bank.getBalance());    // 150\n' +
      '// bank.balance;  // undefined：外部无法直接读写私有变量'
  },
  {
    id: 'js-this',
    title: '20. this 的绑定规则',
    category: '函数与对象',
    version: '进阶',
    level: '进阶',
    summary: 'this 指向取决于函数的调用方式。',
    detail: [
      '普通函数调用（非严格）this 指向全局对象；严格模式下是 undefined。',
      '作为对象方法调用时，this 指向该对象。',
      '用 call / apply / bind 可显式指定 this；箭头函数没有自己的 this，沿用外层。',
      'new 调用构造函数时，this 指向新创建的对象。'
    ],
    example:
      'const obj = {\n' +
      '  name: "Tom",\n' +
      '  say() { console.log(this.name); }\n' +
      '};\n' +
      'obj.say();                       // Tom（this 是 obj）\n\n' +
      'const fn = obj.say;\n' +
      'fn();                            // undefined（this 丢失）\n\n' +
      'const bound = fn.bind(obj);\n' +
      'bound();                         // Tom（显式绑定）',
    example3Title: '实战：事件回调里的 this 丢失与修复',
    example3:
      'const btn = {\n' +
      '  label: "提交",\n' +
      '  onClick() { console.log("点击了", this.label); }\n' +
      '};\n\n' +
      '// 把方法当回调传出去，this 会丢失\n' +
      'const handler = btn.onClick;       // this 不再指向 btn\n\n' +
      '// 修复一：bind 永久绑定\n' +
      'const bound = btn.onClick.bind(btn);\n\n' +
      '// 修复二：用箭头函数包一层\n' +
      'const wrapped = () => btn.onClick();\n\n' +
      '// 类中使用：构造时绑定一次，避免每次渲染新建函数\n' +
      'class View {\n' +
      '  constructor() { this.click = this.click.bind(this); }\n' +
      '  click() { console.log("this 稳定"); }\n' +
      '}'
  },
  {
    id: 'js-array-basics',
    title: '21. 数组与常用方法',
    category: '函数与对象',
    version: '入门',
    level: '入门',
    summary: '数组是 JS 最常用的数据结构，map/filter/reduce 是核心三件套。',
    detail: [
      '数组用 [] 创建，是对象的一种，索引从 0 开始；可存放任意类型混合元素。',
      '增删改：push/pop（尾）、unshift/shift（头）；查：indexOf/includes。',
      'map 映射为新数组、filter 过滤、reduce 累积；它们都不会改动原数组（纯函数）。',
      'find/findIndex 按条件查找；every/some 判断全部/部分满足。'
    ],
    example:
      'const nums = [1, 2, 3, 4, 5];\n' +
      'const even = nums.filter(n => n % 2 === 0);\n' +
      'console.log(even);            // [2, 4]\n' +
      'const squares = nums.map(n => n * n);\n' +
      'console.log(squares);         // [1, 4, 9, 16, 25]\n' +
      'const total = nums.reduce((a, b) => a + b, 0);\n' +
      'console.log(total);           // 15\n' +
      'console.log(nums.find(n => n > 3));    // 4\n' +
      'console.log(nums.some(n => n > 10));   // false',
    example3Title: '实战：链式调用 map/filter/reduce 做数据聚合',
    example3:
      'const orders = [\n' +
      '  { user: "A", amount: 120 },\n' +
      '  { user: "B", amount: 80 },\n' +
      '  { user: "A", amount: 60 }\n' +
      '];\n\n' +
      '// 只统计金额 > 100 的订单，并求总额\n' +
      'const total = orders\n' +
      '  .filter(o => o.amount > 100)\n' +
      '  .reduce((sum, o) => sum + o.amount, 0);\n' +
      'console.log(total);            // 120\n\n' +
      '// 按用户分组（reduce 造对象）\n' +
      'const byUser = orders.reduce((m, o) => {\n' +
      '  (m[o.user] ||= []).push(o.amount);\n' +
      '  return m;\n' +
      '}, {});\n' +
      'console.log(byUser);           // { A: [120, 60], B: [80] }'
  },
  {
    id: 'js-array-methods2',
    title: '22. 数组：slice / splice / sort',
    category: '函数与对象',
    version: '入门',
    level: '入门',
    summary: '切片、插入删除与排序的正确姿势。',
    detail: [
      'slice(start, end) 返回子数组副本，不改动原数组；splice 会就地增删改，返回被删部分。',
      'sort 默认按字符串排序，数字排序必须传比较函数 (a, b) => a - b。',
      '翻转用 reverse；合并用 concat（不改原数组）或展开运算符。'
    ],
    example:
      'const a = [1, 2, 3, 4];\n' +
      'console.log(a.slice(1, 3));   // [2, 3]（不改原数组）\n' +
      'a.splice(1, 2, "x");          // 从索引1删2个，插入"x"\n' +
      'console.log(a);               // [1, "x", 4]\n\n' +
      'const b = [3, 1, 2];\n' +
      'b.sort((x, y) => x - y);\n' +
      'console.log(b);               // [1, 2, 3]',
    example3Title: '实战：不可变地排序与增删',
    example3:
      'const data = [3, 1, 2];\n\n' +
      '// 错误：sort 会就地改动原数组\n' +
      '// data.sort();  // data 已被改变\n\n' +
      '// 正确：先拷贝再排序，保留原数组\n' +
      'const sorted = [...data].sort((a, b) => a - b);\n' +
      'console.log(sorted, data);     // [1,2,3] [3,1,2]\n\n' +
      '// 不可变删除某项：用 filter\n' +
      'const list = ["a", "b", "c"];\n' +
      'const withoutB = list.filter(x => x !== "b");\n' +
      'console.log(withoutB);         // ["a", "c"]\n\n' +
      '// 不可变插入：展开运算符拼接\n' +
      'const inserted = [...list.slice(0, 1), "x", ...list.slice(1)];\n' +
      'console.log(inserted);         // ["a","x","b","c"]'
  },
  {
    id: 'js-string-methods',
    title: '23. 字符串方法详解',
    category: '函数与对象',
    version: '入门',
    level: '入门',
    summary: '截取、查找、替换、拆分与拼接的常用手段。',
    detail: [
      '截取：slice、substring、substr（已不推荐）；查找：indexOf、lastIndexOf、includes、startsWith、endsWith。',
      '替换：replace（仅替换首个，用正则 /g 替换全部）、replaceAll；拆分：split 转数组。',
      '重复 repeat、补全 padStart/padEnd、匹配 match/matchAll（配合正则）。'
    ],
    example:
      'const s = "Hello World";\n' +
      'console.log(s.slice(0, 5));          // Hello\n' +
      'console.log(s.replace("World", "JS"));// Hello JS\n' +
      'console.log(s.split(" "));           // ["Hello", "World"]\n' +
      'console.log("5".padStart(3, "0"));   // 005\n' +
      'console.log("abac".replaceAll("a", "x")); // xbxc',
    example3Title: '实战：用正则提取与清洗文本',
    example3:
      'const text = "姓名: Tom, 年龄: 18";\n\n' +
      '// 用正则提取数字\n' +
      'const age = text.match(/\\d+/);\n' +
      'console.log(age && age[0]);     // 18\n\n' +
      '// 提取 key: value 成对数据\n' +
      'const pairs = text.split(",").map(s => s.split(":").map(p => p.trim()));\n' +
      'console.log(pairs);             // [["姓名","Tom"],["年龄","18"]]\n\n' +
      '// 模板替换：把 {name} 占位符换成真实值\n' +
      'const tpl = "你好 {name}，剩余 {n} 天";\n' +
      'const out = tpl.replace(/\\{(\\w+)\\}/g, (_, k) => ({\n' +
      '  name: "Tom", n: 3\n' +
      '}[k]));\n' +
      'console.log(out);               // 你好 Tom，剩余 3 天'
  },
  {
    id: 'js-object-basics',
    title: '24. 对象字面量与属性',
    category: '函数与对象',
    version: '入门',
    level: '入门',
    summary: '对象是键值对的集合，JS 的核心数据结构。',
    detail: [
      '对象用 { key: value } 创建；键通常是字符串（可省略引号），值可以是任意类型包括函数（即方法）。',
      '访问属性用点号 obj.x 或方括号 obj["x"]（键为变量或特殊字符时必须用方括号）。',
      '动态键：用计算属性名 { [变量]: 值 }；删除属性用 delete；判断存在用 "in" 或 hasOwnProperty。'
    ],
    example:
      'const user = {\n' +
      '  name: "Tom",\n' +
      '  age: 18,\n' +
      '  sayHi() { console.log("Hi " + this.name); }\n' +
      '};\n' +
      'console.log(user.name);       // Tom\n' +
      'user.age = 20;               // 修改\n' +
      'user.city = "Beijing";       // 新增属性\n' +
      'user.sayHi();                // Hi Tom\n\n' +
      'const key = "score";\n' +
      'const obj = { [key]: 100 };  // 计算属性名\n' +
      'console.log(obj.score);      // 100',
    example3Title: '实战：getter / setter 与 Object 静态方法',
    example3:
      '// 用 getter/setter 控制属性读写\n' +
      'const product = {\n' +
      '  _price: 0,\n' +
      '  get price() { return this._price; },\n' +
      '  set price(v) { this._price = v < 0 ? 0 : v; }\n' +
      '};\n' +
      'product.price = -5;\n' +
      'console.log(product.price);    // 0（负数被拦截）\n\n' +
      '// 对象 ↔ Map 互转\n' +
      'const obj = { a: 1, b: 2 };\n' +
      'const map = new Map(Object.entries(obj));\n' +
      'map.set("c", 3);\n' +
      'console.log(Object.fromEntries(map)); // { a:1, b:2, c:3 }\n\n' +
      '// 判断属性是否存在（含原型链用 in）\n' +
      'console.log("toString" in obj); // true（来自原型）'
  },
  {
    id: 'js-destructuring',
    title: '25. 解构赋值',
    category: '函数与对象',
    version: 'ES6',
    level: '入门',
    summary: '从数组或对象中快速提取值到变量。',
    detail: [
      '数组解构：const [a, b] = arr；可跳过 [a, , c]；可用 ...rest 收集剩余。',
      '对象解构：const { name, age } = obj；可重命名 { name: n }；可设默认值 { x = 1 }。',
      '嵌套解构和函数参数解构让代码更简洁，常用于从接口返回的数据中取值。'
    ],
    example:
      'const arr = [1, 2, 3];\n' +
      'const [first, ...rest] = arr;\n' +
      'console.log(first, rest);     // 1 [2, 3]\n\n' +
      'const user = { name: "Tom", age: 18 };\n' +
      'const { name, age: a } = user;\n' +
      'console.log(name, a);         // Tom 18\n\n' +
      'function print({ name = "匿名" }) {\n' +
      '  console.log(name);\n' +
      '}\n' +
      'print({});                   // 匿名',
    example3Title: '实战：解构在真实场景中的妙用',
    example3:
      '// 1) 交换变量（无需临时变量）\n' +
      'let a = 1, b = 2;\n' +
      '[a, b] = [b, a];\n' +
      'console.log(a, b);            // 2 1\n\n' +
      '// 2) 从接口返回里取值\n' +
      'const res = { data: { list: [1, 2], total: 2 } };\n' +
      'const { data: { list, total } } = res;\n' +
      'console.log(list, total);     // [1,2] 2\n\n' +
      '// 3) 函数参数解构 + 默认值 + 重命名\n' +
      'function draw({ x = 0, y = 0, color: c = "black" } = {}) {\n' +
      '  console.log(c, x, y);\n' +
      '}\n' +
      'draw({ x: 10 });             // black 10 0'
  },
  {
    id: 'js-spread',
    title: '26. 展开运算符 ...',
    category: '函数与对象',
    version: 'ES6',
    level: '入门',
    summary: '把可迭代对象"展开"成元素，常用于复制与合并。',
    detail: [
      '数组：const c = [...a, ...b] 合并；[...arr] 做浅拷贝。',
      '对象：const o = { ...a, ...b } 合并（后者覆盖前者）；{ ...obj } 做浅拷贝。',
      '函数调用：Math.max(...nums) 把数组展开成参数列表。',
      '注意展开是浅拷贝：嵌套对象仍共享引用。'
    ],
    example:
      'const a = [1, 2], b = [3, 4];\n' +
      'console.log([...a, ...b]);    // [1, 2, 3, 4]\n' +
      'const copy = [...a];          // 浅拷贝\n\n' +
      'const o1 = { x: 1 }, o2 = { y: 2 };\n' +
      'console.log({ ...o1, ...o2 });// { x: 1, y: 2 }\n' +
      'console.log(Math.max(...[3, 7, 2])); // 7',
    example3Title: '实战：浅拷贝的陷阱与深拷贝',
    example3:
      'const a = { x: 1, nest: { v: 1 } };\n' +
      'const b = { ...a };            // 浅拷贝\n' +
      'b.x = 9;\n' +
      'b.nest.v = 99;          // 注意：嵌套对象仍共享引用！\n' +
      'console.log(a.nest.v);  // 99（被改到）\n\n' +
      '// 需要深拷贝时用 structuredClone（现代环境）\n' +
      'const c = structuredClone(a);\n' +
      'c.nest.v = 0;\n' +
      'console.log(a.nest.v);  // 99（a 不受影响）\n\n' +
      '// 数组合并并去重\n' +
      'const merged = [...new Set([1, 2, 2, 3])];\n' +
      'console.log(merged);     // [1, 2, 3]'
  },
  {
    id: 'js-prototype',
    title: '27. 原型与原型链',
    category: '函数与对象',
    version: '进阶',
    level: '进阶',
    summary: 'JS 靠原型实现"继承"，访问属性会沿原型链向上查找。',
    detail: [
      '每个对象都有一个内部 [[Prototype]]（可用 __proto__ 或 Object.getPrototypeOf 访问），指向它的原型对象。',
      '读取属性时，若自身没有，就沿原型链逐级向上查找，直到 null。这就是"原型链"。',
      '构造函数通过 prototype 属性共享方法；new 会创建对象并把其原型指向构造函数的 prototype。',
      '理解原型链是理解 JS 面向对象与 class 语法糖的基础。'
    ],
    example:
      'function Person(name) { this.name = name; }\n' +
      'Person.prototype.sayHi = function () {\n' +
      '  console.log("Hi " + this.name);\n' +
      '};\n' +
      'const p = new Person("Tom");\n' +
      'p.sayHi();                    // Hi Tom（方法来自原型）\n' +
      'console.log(p.__proto__ === Person.prototype); // true\n' +
      'console.log(Object.getPrototypeOf(p) === Person.prototype); // true',
    example3Title: '实战：原型链查找与 hasOwnProperty',
    example3:
      'function Animal(name) { this.name = name; }\n' +
      'Animal.prototype.say = function () { return this.name; };\n' +
      'const cat = new Animal("咪咪");\n\n' +
      '// 读取 say：自身没有 → 沿原型链找到 Animal.prototype\n' +
      'console.log(cat.say());        // 咪咪\n\n' +
      '// 判断属性是"自身"还是"来自原型"\n' +
      'console.log(cat.hasOwnProperty("name"));   // true\n' +
      'console.log(cat.hasOwnProperty("say"));     // false\n\n' +
      '// 用 Object.create 手动指定原型\n' +
      'const proto = { greet() { return "hi"; } };\n' +
      'const obj = Object.create(proto);\n' +
      'console.log(obj.greet());      // hi（来自原型）'
  },
  {
    id: 'js-class',
    title: '28. class 与继承',
    category: '函数与对象',
    version: 'ES6',
    level: '入门',
    summary: 'class 是原型继承的语法糖，让面向对象更易读。',
    detail: [
      'class 用 constructor 定义构造逻辑；方法直接写在类体内。',
      'extends 实现继承，super() 调用父类构造或方法；静态方法用 static 定义。',
      'ES2022 支持私有字段（#field）和私有方法，真正封装内部状态。',
      'class 本质仍是基于原型的，只是写法更接近传统 OOP。'
    ],
    example:
      'class Animal {\n' +
      '  constructor(name) { this.name = name; }\n' +
      '  speak() { console.log(this.name + " 叫"); }\n' +
      '}\n' +
      'class Dog extends Animal {\n' +
      '  speak() { console.log(this.name + " 汪汪"); }\n' +
      '}\n' +
      'const d = new Dog("旺财");\n' +
      'd.speak();                    // 旺财 汪汪\n\n' +
      'class Counter {\n' +
      '  #count = 0;                // 私有字段\n' +
      '  inc() { this.#count++; return this.#count; }\n' +
      '}\n' +
      'const c = new Counter();\n' +
      'console.log(c.inc(), c.inc()); // 1 2',
    example3Title: '实战：继承 + 私有字段 + 静态方法',
    example3:
      'class Shape {\n' +
      '  constructor(color) { this.color = color; }\n' +
      '  describe() { return `${this.color} 形状`; }\n' +
      '  static compare(a, b) { return a.area() - b.area(); }\n' +
      '}\n' +
      'class Circle extends Shape {\n' +
      '  #r;                         // 私有字段\n' +
      '  constructor(r) { super("红"); this.#r = r; }\n' +
      '  area() { return Math.PI * this.#r ** 2; }\n' +
      '  get radius() { return this.#r; }   // 只读 getter\n' +
      '}\n' +
      'const c = new Circle(2);\n' +
      'console.log(c.describe());     // 红 形状\n' +
      'console.log(Shape.compare(c, c) === 0); // true（静态方法）\n' +
      '// c.#r;  // 语法错误：私有字段外部不可访问'
  },
  {
    id: 'js-error',
    title: '29. 错误处理',
    category: '函数与对象',
    version: '入门',
    level: '入门',
    summary: '用 try/catch 捕获异常，保证程序健壮。',
    detail: [
      'try 块中抛出的错误会被 catch 捕获；finally 无论是否出错都会执行（常用于清理）。',
      '用 throw 主动抛错，可抛出任意值；推荐抛出 Error 对象以获得堆栈。',
      '可抛出自定义错误类（继承 Error），或用 try/catch 包裹可能失败的 JSON 解析、网络请求等。'
    ],
    example:
      'try {\n' +
      '  const data = JSON.parse("不是合法json");\n' +
      '} catch (e) {\n' +
      '  console.log("解析失败:", e.message);\n' +
      '} finally {\n' +
      '  console.log("清理工作");\n' +
      '}\n\n' +
      'class MyError extends Error {}\n' +
      'function check(age) {\n' +
      '  if (age < 0) throw new MyError("年龄不能为负");\n' +
      '}\n' +
      'try { check(-1); } catch (e) { console.log(e.message); }',
    example3Title: '实战：异步错误与 Result 风格处理',
    example3:
      '// 1) async/await 的错误要用 try/catch 包住\n' +
      'async function load() {\n' +
      '  try {\n' +
      '    const r = await fetch("/api");\n' +
      '    if (!r.ok) throw new Error("HTTP " + r.status);\n' +
      '    return await r.json();\n' +
      '  } catch (e) {\n' +
      '    console.error("加载失败:", e.message);\n' +
      '    return null;\n' +
      '  }\n' +
      '}\n\n' +
      '// 2) 可选链 + 空值合并，减少防御性报错\n' +
      'const user = {};\n' +
      'console.log(user?.profile?.email ?? "无邮箱"); // 无邮箱\n\n' +
      '// 3) 统一错误类型便于区分\n' +
      'class NetworkError extends Error {}\n' +
      'try { throw new NetworkError("断网"); }\n' +
      'catch (e) { console.log(e instanceof NetworkError); } // true'
  }
];
