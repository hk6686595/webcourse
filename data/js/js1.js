// JavaScript 语法教程 —— 第一阶段：从零开始（基础与入门）
module.exports = [
  {
    id: 'js-intro',
    title: '1. JavaScript 是什么 / 怎么运行',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: '认识 JavaScript：一门运行在浏览器和服务端的脚本语言，以及三种运行方式。',
    detail: [
      'JavaScript（简称 JS）诞生于 1995 年，最初只是为了给网页添加简单的交互效果（比如点击按钮弹出提示）。如今它已经发展为世界上使用最广泛的编程语言之一：浏览器里的网页交互、服务器端程序、手机 App、桌面软件甚至小程序，都可以用 JS 编写。',
      'JS 是一门"解释型"语言：不需要像 C/C++ 那样提前编译成可执行文件，写好代码就能直接运行。引擎（如浏览器内置的 V8）会一边读取代码一边执行，出错时会直接在控制台报错并指出行号。',
      'JS 是"动态类型"语言：声明变量时不用指定类型，同一个变量可以先存数字再存字符串。这对新手友好，但也要求自己留心变量里到底装的是什么。',
      '运行方式一（最快上手）：浏览器控制台。用 Chrome 或 Edge 打开任意网页，按 F12 打开开发者工具，切到 Console（控制台）面板，输入代码后回车立即执行。适合做小实验。',
      '运行方式二：写在 HTML 里。新建一个 index.html，在 <body> 末尾加 <script src="app.js"></script>，双击打开网页即会执行 app.js。这是前端开发的正式做法。',
      '运行方式三：Node.js。去 nodejs.org 下载安装 LTS 版本，之后在终端输入 node -v 能看到版本号说明安装成功；再用 node 文件名.js 运行任意 JS 文件。这是后端和脚本开发的做法。',
      '学习建议：准备一个文件夹存放练习文件，每个知识点写一个小文件动手跑一遍。"看懂了"和"写出来了"是两回事，一定要亲手敲代码。',
      '命名注意：JavaScript 和 Java 是两门完全不同的语言，只是当年为了蹭热度取了相似的名字，不要混淆。'
    ],
    notes: [
      'ECMAScript（ES）是 JS 的语言标准，我们常说的 ES6 / ES2015 之后的版本都是这套标准。',
      '推荐编辑器：VS Code（免费），安装 Live Server 插件可以保存后自动刷新网页。'
    ],
    example:
      '// 浏览器控制台或 node 中直接输入：\n' +
      'console.log("Hello, JavaScript");\n\n' +
      '// 也可以写在文件 hello.js 里，用 node hello.js 运行\n' +
      '// 终端会输出：Hello, JavaScript'
  },
  {
    id: 'js-hello',
    title: '2. 第一个程序与注释',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: '用 console.log 输出内容，并学会用注释标注代码。',
    detail: [
      'console.log(...) 是最常用的"打印"函数，会把括号里的内容输出到控制台。它是你调试代码最重要的工具：想知道某个变量的值？console.log 一下就知道。',
      'console.log 可以一次打印多个值，中间用逗号隔开：console.log("年龄:", 18)，输出时各部分之间会有空格。',
      '单行注释用 // 开头：从 // 到本行结束的内容都不会被执行。多行注释以 /* 开始、以 */ 结束，中间可以跨很多行。',
      '注释不会被运行，它的作用有两个：一是给自己和别人解释这段代码在干什么（写复杂逻辑时尤其重要）；二是临时"关掉"某行代码来排查问题——把可疑的代码注释掉看错误是否消失，这叫"二分排查"，是非常实用的调试技巧。',
      'JS 的语句（一句完整的指令）通常以分号 ; 结尾。现代 JS 引擎大多能在换行处自动补分号（称为 ASI 机制），但自动补全偶尔会在意想不到的地方生效导致 bug，所以建议养成显式写分号的习惯。',
      '一条语句一般占一行，一行只写一条语句，这样出错时报错信息里的行号才准确。',
      '字符串（一段文字）必须用引号包起来，单引号和双引号效果完全一样，选一种风格保持统一即可。数字则不需要引号。'
    ],
    notes: [
      'console 还有其他成员：console.warn 警告（黄色）、console.error 错误（红色）、console.table 把数组/对象打印成表格，都值得一试。'
    ],
    example:
      'console.log("你好，世界");\n' +
      'console.log(1 + 2);          // 输出 3\n' +
      'console.log("a =", 1, "b =", 2); // 多个值一起打印\n\n' +
      '/*\n' +
      '  这是一段多行注释\n' +
      '  下面的代码暂时不会执行\n' +
      '*/\n' +
      '// console.log("被注释掉了");',
    example2Title: '常见新手报错',
    example2:
      '// 忘记写引号 —— 字符串没包起来\n' +
      '// console.log(hello);\n' +
      '// 报错：ReferenceError: hello is not defined\n' +
      '// 引擎以为 hello 是一个变量名，但这个变量不存在\n\n' +
      '// 括号不配对\n' +
      '// console.log("hi";\n' +
      '// 报错：SyntaxError: missing ) after argument list\n' +
      '// 看到 SyntaxError 就检查符号是否成对、是否漏写'
  },
  {
    id: 'js-vars',
    title: '3. 变量：let / const / var',
    category: '从零开始',
    version: 'ES6',
    level: '入门',
    summary: '用 let 和 const 声明变量，理解块级作用域与常量。',
    detail: [
      '变量就像一个贴了名字标签的盒子：把数据放进去，之后通过名字随时取用或更换。声明变量的过程就是"造盒子+贴标签"。',
      'let 声明一个可以被重新赋值的变量：let score = 60; 之后可以写 score = 95; 把里面的值换成新的。',
      'const 声明常量：一旦赋值就不能再指向别的东西。注意"不能重新赋值"指的是不能再让这个名字指向别的值；如果 const 存的是对象，对象内部的属性仍然可以修改（因为名字指向的对象本身没变）。',
      '块级作用域：let / const 只在最近一层花括号 {} 内有效。在 if、for 的 {} 里声明的变量，出了这个块就访问不到了。这样做的好处是变量不会"泄漏"到外面干扰其他代码。',
      'var 是 ES6 之前的老写法，作用域是整个函数而不是代码块，还存在"变量提升"（声明被提前到作用域顶部，值为 undefined），容易造成难以察觉的 bug。新代码请一律使用 let 和 const。',
      '暂时性死区（TDZ）：对 let/const 而言，从代码块开始到声明语句之间的区域叫 TDZ，在这段区域访问该变量会直接报错（ReferenceError）。这强制了"先声明、后使用"的好习惯。',
      '命名规则：只能包含字母、数字、下划线 _ 和 $，且不能以数字开头；区分大小写（Age 和 age 是两个变量）；不能用保留字（如 let、if、class 等）作名字。',
      '命名习惯：普通变量用小驼峰式（userName、maxScore），常量配多个单词也用小驼峰；名字要见名知义，宁长勿短——三个月后还能看懂的代码才是好代码。',
      '同一作用域内 let/const 不允许重复声明同名变量，而 var 允许（这也是 var 危险的原因之一）。'
    ],
    notes: [
      '经验法则：默认用 const，只有当变量确实需要被重新赋值时才用 let，几乎不要用 var。',
      '未初始化的 let 变量值为 undefined；const 声明时必须立刻赋值，否则报错。'
    ],
    example:
      'let count = 1;\n' +
      'count = 2;                 // OK，let 可重新赋值\n' +
      'count = count + 10;        // 用旧值算出新值再存回去\n' +
      'console.log(count);        // 12\n\n' +
      'const pi = 3.14;\n' +
      '// pi = 3;                // 报错：const 不能重新赋值\n' +
      'const user = { name: "Tom" };\n' +
      'user.name = "Bob";         // OK，const 存的对象内部属性可以改\n\n' +
      'if (true) {\n' +
      '  let x = 10;\n' +
      '  console.log(x);          // 10，块内可见\n' +
      '}\n' +
      '// console.log(x);        // 报错：x 在块外不可见\n\n' +
      '// 暂时性死区演示\n' +
      '// console.log(y);        // 报错：Cannot access \'y\' before initialization\n' +
      'let y = 5;',
    example2Title: 'var 的坑（了解即可，避免使用）',
    example2:
      'console.log(a);            // undefined（提升：不报错但值不对）\n' +
      'var a = 1;\n\n' +
      'for (var i = 0; i < 3; i++) {}\n' +
      'console.log(i);            // 3：var 泄漏到了循环外\n\n' +
      'for (let j = 0; j < 3; j++) {}\n' +
      '// console.log(j);         // 报错：j is not defined（正确行为）'
  },
  {
    id: 'js-types',
    title: '4. 数据类型概览',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: 'JS 有 7 种原始类型加 1 种对象类型，typeof 查看类型。',
    detail: [
      'JS 中每个值都有一个类型。类型决定了这个值能做什么运算、怎么存储。共 8 种：7 种原始（基本）类型 + 1 种对象类型。',
      '原始类型包括：number（数字）、string（字符串）、boolean（布尔：true/false）、undefined（已声明未赋值）、null（刻意表示"空"）、symbol（唯一标识符，进阶内容）、bigint（超大整数）。原始类型的值不可变，且比较时按"值"比较：两个内容相同的字符串就是相等的。',
      '对象类型 object 是引用类型：包括普通对象、数组、函数等。变量里存的其实是"引用"（类似地址），两个对象即使内容完全一样也不相等，除非它们是同一个对象。',
      'undefined 表示"这里应该有个值，但还没赋"：声明变量没赋初值、函数没有返回值、访问对象上不存在的属性，都会得到 undefined。',
      'null 表示"这里故意留空"：它是程序员主动设置的空值。惯例上：意料之中的空用 null，系统默认的缺失是 undefined。',
      'typeof 操作符返回类型的字符串描述，是最常用的查类型工具。它有一个著名陷阱：typeof null 返回 "object"，这是 20 多年前的历史 bug，为兼容旧代码永远不会修复，只能靠 === null 来判断 null。',
      '判断数组要用专门的 Array.isArray(arr)，因为 typeof 对数组也只会返回 "object"。'
    ],
    notes: [
      '记忆技巧：原始类型像复印的照片（各拿各的，互不影响）；对象像共享的网盘链接（改一处，所有持有链接的人都看到变化，详见后续章节）。'
    ],
    example:
      'typeof 42;            // "number"\n' +
      'typeof "hi";          // "string"\n' +
      'typeof true;          // "boolean"\n' +
      'typeof undefined;     // "undefined"\n' +
      'typeof null;          // "object"（陷阱！）\n' +
      'typeof {};            // "object"\n' +
      'typeof [];            // "object"（数组也是对象）\n' +
      'typeof function(){};  // "function"',
    example2Title: '值比较 vs 引用比较',
    example2:
      '// 原始类型按值比较\n' +
      '"abc" === "abc";           // true\n' +
      '1 === 1;                   // true\n\n' +
      '// 对象按引用比较：内容一样也不是同一个对象\n' +
      '{} === {};                 // false\n' +
      '[1,2] === [1,2];           // false\n\n' +
      'const a = [1, 2];\n' +
      'const b = a;               // b 和 a 指向同一个数组\n' +
      'b.push(3);\n' +
      'console.log(a);            // [1, 2, 3]：改 b 影响了 a！'
  },
  {
    id: 'js-numbers',
    title: '5. 数字与数学运算',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: 'JS 只有一个 number 类型（双精度浮点），以及 Math 工具对象。',
    detail: [
      'JS 不区分整数和小数，所有数字都属于同一个 number 类型（64 位双精度浮点数）。所以 1 和 1.0 是同一个数，10 / 4 的结果是 2.5 而不是整数 2（这点和 C/Java 不同）。',
      '基本运算符：+ 加、- 减、* 乘、/ 除、% 取余、** 幂。取余 % 很常用：判断奇偶（n % 2）、判断倍数（n % 3 === 0）、循环取范围（i % 10 得到 0~9）都靠它。',
      '浮点误差是重点：由于二进制无法精确表示某些小数，0.1 + 0.2 === 0.3 的结果是 false（实际得到 0.30000000000000004）。这不是 JS 独有的问题，所有语言的浮点数都这样。判断小数相等应比较差的绝对值是否足够小。',
      '三个特殊值：NaN（Not a Number，表示"运算结果不是有效数字"，比如 Number("abc") 或 0 / 0）、Infinity（正无穷，如 1 / 0）、-Infinity。NaN 有个反直觉特性：NaN 连自己都不等于，判断 NaN 必须用 Number.isNaN(x)。',
      'Math 是内置的数学工具对象，无需创建直接用：Math.floor 向下取整、Math.ceil 向上取整、Math.round 四舍五入、Math.abs 绝对值、Math.max/min 最值、Math.sqrt 平方根、Math.pow 幂、Math.trunc 去掉小数部分。',
      'Math.random() 返回 [0, 1) 的随机小数。要得到 [min, max] 范围内的随机整数，套公式：Math.floor(Math.random() * (max - min + 1)) + min。例如 1~10 的随机整数：Math.floor(Math.random() * 10) + 1。',
      '数字与字符串转换：Number("3.14") 把字符串转数字（失败得 NaN）；parseInt("42px") 从头解析出整数 42；parseFloat 解析出小数；num.toFixed(2) 保留两位小数（返回字符串）；(123).toString() 数字转字符串。',
      '超出 Number 安全范围（约 ±9 千万亿）的整数计算会失真，此时应使用 bigint 类型：在整数字面量末尾加 n，如 9007199254740993n。'
    ],
    notes: [
      '需要精确金额时，不要直接用浮点，建议用整数分（cents）或 decimal 库。',
      '判断一个值是否为有效数字：Number.isFinite(x) 比 isNaN 更严格可靠。'
    ],
    example:
      'console.log(1 + 2);        // 3\n' +
      'console.log(10 % 3);       // 1（取余）\n' +
      'console.log(2 ** 10);      // 1024\n' +
      'console.log(0.1 + 0.2);    // 0.30000000000000004（浮点误差）\n' +
      'console.log(Math.abs(0.1 + 0.2 - 0.3) < 1e-9);  // true：正确的相等判断\n' +
      'console.log(Math.max(3, 7));// 7\n' +
      'console.log(Math.floor(4.9)); // 4\n' +
      'console.log(Math.ceil(4.1));  // 5\n' +
      'console.log(Math.sqrt(81));   // 9\n' +
      'console.log(10n + 5n);     // 15n（bigint）',
    example2Title: '随机数与进制',
    example2:
      '// 掷骰子：1~6 的随机整数\n' +
      'const dice = Math.floor(Math.random() * 6) + 1;\n' +
      'console.log(dice);\n\n' +
      '// 随机点名（数组索引）\n' +
      'const names = ["小明", "小红", "小刚"];\n' +
      'const idx = Math.floor(Math.random() * names.length);\n' +
      'console.log(names[idx]);\n\n' +
      '// 进制与解析\n' +
      'console.log(0xff);            // 255（十六进制字面量）\n' +
      'console.log(parseInt("42px")); // 42\n' +
      'console.log((3.14159).toFixed(2)); // "3.14"（注意返回的是字符串）'
  },
  {
    id: 'js-strings',
    title: '6. 字符串与模板字符串',
    category: '从零开始',
    version: 'ES6',
    level: '入门',
    summary: '字符串可用单/双/反引号定义，模板字符串支持内嵌表达式。',
    detail: [
      '字符串就是一串文字。可以用单引号、双引号或反引号 ` 定义，单双引号完全等价。反引号定义的叫模板字符串，功能更强。',
      '转义字符：想在字符串里包含引号本身或特殊字符，用反斜杠 \\ 转义。常用的有：\\n 换行、\\t 制表符、\\\\ 反斜杠、\\" 双引号、\\\' 单引号。例如："他说：\\"你好\\""',
      '模板字符串（反引号）三大优势：① 用 ${表达式} 直接嵌入变量或任意表达式，省去 + 拼接；② 天然支持换行，写多行文本不用拼 \\n；③ 引号随便用不用转义。现代代码中拼接文字一律优先用它。',
      '字符串是有序的字符序列，可以通过方括号按下标访问单个字符：s[0] 是第一个字符，s[s.length - 1] 是最后一个。下标从 0 开始计数是编程通用规则。',
      '常用属性和方法：length 长度；toUpperCase/toLowerCase 大小写转换；includes 是否包含；startsWith/endsWith 判断开头结尾；indexOf 查找位置（找不到返回 -1）；slice(start, end) 截取（含头不含尾）；replace 替换第一个匹配；replaceAll 替换全部；split 按分隔符拆成数组；trim 去除首尾空格；repeat 重复多次；padStart/padEnd 补位。',
      '字符串不可变（immutable）：所有看似"修改"的方法其实都返回了一个全新的字符串，原字符串永远不变。所以 s.toUpperCase() 这样单独调用毫无效果，必须用 s = s.toUpperCase() 接住新值。',
      '模板字符串里 ${} 中可以放任意表达式，甚至调用函数：`总价：${price * count} 元`、`结果：${calc(a, b)}`。',
      '字符串比较大小按字典序（逐个字符比编码）：\"b\" > \"a\" 为 true；但要注意 \"Banana\" < \"apple\" 为 true，因为大写字母编码更小，排序前通常先统一大小写。'
    ],
    notes: [
      '遍历字符串可用 for...of：for (const ch of "abc") 会依次拿到 a、b、c。'
    ],
    example:
      'const name = "Alice";\n' +
      'const age = 18;\n' +
      'const msg = `我叫 ${name}，今年 ${age} 岁，明年 ${age + 1} 岁`;\n' +
      'console.log(msg);\n\n' +
      'const s = "JavaScript";\n' +
      'console.log(s.length);             // 10\n' +
      'console.log(s[0], s[s.length - 1]); // J t\n' +
      'console.log(s.toUpperCase());      // JAVASCRIPT\n' +
      'console.log(s.includes("Script")); // true\n' +
      'console.log(s.slice(0, 4));        // Java\n' +
      'console.log(s.replace("Script", "")); // Java\n' +
      'console.log(" a b ".trim());       // "a b"\n' +
      'console.log("ab".repeat(3));       // ababab\n' +
      'console.log("7".padStart(3, "0")); // 007',
    example2Title: '实战：文件名处理',
    example2:
      'const filename = "  report.FINAL.pdf  ";\n' +
      'const clean = filename.trim().toLowerCase();\n' +
      'console.log(clean);                       // report.final.pdf\n\n' +
      'const ext = clean.slice(clean.lastIndexOf(".") + 1);\n' +
      'console.log(ext);                         // pdf\n\n' +
      'const parts = clean.split(".");\n' +
      'console.log(parts);                       // ["report", "final", "pdf"]\n\n' +
      '// 多行模板字符串：天然保留换行与缩进\n' +
      'const html = `<ul>\n' +
      '  <li>苹果</li>\n' +
      '  <li>香蕉</li>\n' +
      '</ul>`;'
  },
  {
    id: 'js-type-conversion',
    title: '7. 类型转换与 == / ===',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: '理解隐式转换，永远优先使用严格相等 ===。',
    detail: [
      'JS 是弱类型语言，不同类型的值参与运算时会自动转换类型，这叫隐式转换（强制转换）。它在方便的同时埋了大量陷阱，是 JS 被吐槽最多的设计。',
      '== 宽松相等：比较前会先把两边转换成相同类型。于是出现 "5" == 5 为 true、null == undefined 为 true、[] == false 也为 true 这些奇怪结果。=== 严格相等：不做任何转换，类型不同直接 false。同理 !== 与 !=。',
      '铁律：代码中永远使用 === 和 !==，把 == 仅用于一个特例——x == null 可以同时判断 null 和 undefined（面试考点，实际项目也可以写成 x === null || x === undefined 更清晰）。',
      '显式（手动）转换是推荐做法，意图清晰：Number(x) 转数字；String(x) 转字符串；Boolean(x) 转布尔；x.toString() 也转字符串（null 和 undefined 会报错）。',
      '转数字规则：Number("") 是 0、Number(null) 是 0、Number(undefined) 是 NaN、Number("12px") 是 NaN；而 parseInt 会从头尽量解析，parseInt("12px") 得 12。表单输入框拿到的永远是字符串，参与数学运算前必须转换。',
      '假值（falsy）只有 6 个：false、0、""（空字符串）、null、undefined、NaN。除此之外的所有值——包括 "0"、"false"、[]、{} 这些看似为空的——都是真值（truthy）。这是高频易错点：空数组 [] 在 if 里是成立的！',
      '转字符串场景：任何值与字符串做 + 运算都会被拼接成字符串，如 1 + "2" 得 "12"；而 - * / 则会把字符串转成数字，如 "6" - 1 得 5。+ 号的双重身份（加法/拼接）是新手 bug 重灾区。',
      '快速转换惯用法：+x 等价 Number(x)；"" + x 等价 String(x)；!!x 等价 Boolean(x)。看得懂即可，团队代码中显式写出更佳。'
    ],
    notes: [
      '口诀：比较用 ===，转换写明确；六个假值要背熟，其余全是真。'
    ],
    example:
      'console.log(5 === 5);        // true\n' +
      'console.log("5" === 5);      // false（类型不同）\n' +
      'console.log("5" == 5);       // true（不推荐）\n\n' +
      'console.log(Number("42"));   // 42\n' +
      'console.log(Number(""));     // 0\n' +
      'console.log(Number("12px"));// NaN\n' +
      'console.log(String(true));   // "true"\n' +
      'console.log(Boolean(""));    // false\n' +
      'console.log(Boolean([]));    // true（空数组是真值！）\n\n' +
      '// + 的双重身份\n' +
      'console.log(1 + "2");        // "12"（拼接）\n' +
      'console.log("6" - 1);        // 5（减法触发转数字）',
    example2Title: '实战：表单输入求和',
    example2:
      '// 假设从两个输入框拿到了字符串\n' +
      'const a = "10";\n' +
      'const b = "20";\n\n' +
      'console.log(a + b);              // "1020"！字符串拼接\n' +
      'console.log(Number(a) + Number(b)); // 30：先转换再计算\n\n' +
      '// 封装一个安全的求平均分\n' +
      'function avg(x, y) {\n' +
      '  return (Number(x) + Number(y)) / 2;\n' +
      '}\n' +
      'console.log(avg("80", "90"));     // 85'
  },
  {
    id: 'js-operators',
    title: '8. 运算符',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: '算术、赋值、比较、逻辑、三元与空值合并一览。',
    detail: [
      '算术运算符：+ - * / % **。其中 ** 是幂运算（2 ** 10 即 2 的 10 次方）。自增 ++ 与自减 -- 让变量加一减一：i++ 先用后加，++i 先加后用，单独成行时两者无区别。',
      '赋值运算符家族：= 以及复合形式 += -= *= /= %= **=。n += 3 就是 n = n + 3 的简写，读作"在 n 自己身上加 3"。',
      '比较运算符：> < >= <= 以及 === !== == !=。比较的结果是布尔值 true/false，可以直接存进变量或作为 if 条件。',
      '逻辑运算符操作布尔值：&& 与（两边都真才真）、|| 或（有一边真就真）、! 非（真假互换）。它们支持短路求值：&& 左边为假时右边根本不算；|| 左边为真时右边不算。',
      '短路的妙用——默认值：const name = inputValue || "匿名"。当 inputValue 为假值时自动取后面的默认值。注意局限：0 和 "" 也是假值会被误伤，所以 ES2020 引入了空值合并 ??。',
      '?? 空值合并运算符：只在左边是 null 或 undefined 时才取右边的值。const count = input ?? 0 能正确保留合法的 0。与可选链 ?. （obj?.prop 安全访问可能不存在的属性）搭配是现代 JS 处理"可能为空"的标准姿势。',
      '三元运算符 条件 ? 值A : 值B：条件成立取 A 否则取 B，是一个"有值的 if/else"，可以直接用在表达式和模板字符串里。适合简单二选一，逻辑复杂时老实用 if。',
      '运算符优先级：算术 > 比较 > 逻辑 > 赋值。拿不准时直接加括号，括号不要钱，可读性最值钱。'
    ],
    notes: [
      '记住组合拳：?. 防 undefined，?? 给默认值，两者配合处理不完整的数据结构。'
    ],
    example:
      'let n = 5;\n' +
      'n += 3;                 // n = 8\n' +
      'n++;                    // n = 9\n' +
      'console.log(n % 2 === 0);  // false\n' +
      'const isAdult = n >= 18 ? "成年" : "未成年";\n' +
      'console.log(isAdult);      // 未成年\n\n' +
      'const name = "" || "匿名";   // 短路取默认值\n' +
      'console.log(name);           // 匿名\n' +
      'console.log(true && "yes");  // "yes"\n\n' +
      '// ?? 与 ?. 组合\n' +
      'const user = { profile: { nick: "Tom" } };\n' +
      'console.log(user.profile?.nick);   // Tom\n' +
      'console.log(user.address?.city);   // undefined（不报错）\n' +
      'console.log(user.address?.city ?? "未知城市"); // 未知城市',
    example2Title: '短路求值的执行顺序',
    example2:
      'function check() {\n' +
      '  console.log("check 执行了");\n' +
      '  return true;\n' +
      '}\n\n' +
      'false && check();   // 什么都不输出：左边已假，右边跳过\n' +
      'true || check();    // 什么都不输出：左边已真，右边跳过\n' +
      'true && check();    // 输出：check 执行了\n\n' +
      '// 利用短路代替简单 if\n' +
      'let loggedIn = false;\n' +
      'loggedIn && console.log("欢迎回来");  // 相当于 if (loggedIn) {...}'
  },
  {
    id: 'js-if',
    title: '9. 条件语句 if / else',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: '根据条件执行不同分支；掌握真值判定与分支设计。',
    detail: [
      'if 语句让程序"看情况办事"：if (条件) { 条件为真执行的代码 }。条件放在圆括号里，结果会被当作布尔值处理。',
      '完整形态：if ... else if ... else。从上往下依次检查，命中第一个为真的分支后就不再看后面的分支，最后的 else 兜底处理所有剩余情况。else if 可以有任意多个，else 可以省略。',
      '条件里的值会自动转布尔：因此 6 个假值（false、0、""、null、undefined、NaN）都会走 else 分支，其余一切为真。利用这点可以写简洁判断：if (list.length) 表示数组非空，if (str) 表示字符串非空。',
      '即使分支只有一条语句，也强烈建议写上花括号 {}。省略花括号的代码在后续往里加语句时极易出事故，各大规范都强制要求花括号。',
      '条件判断的边界是 bug 高发区：>= 和 > 差一个等号结果天差地别；区间判断要写成 score >= 60 && score < 70，绝不能写 60 <= score < 70（这会被解析成 (60 <= score) < 70，恒为 true 或错误的值）。',
      '嵌套 if（if 里再套 if）超过两层就应该警惕：考虑用 else if 拉平、提前返回（guard clause 卫语句：不满足条件直接 return）、或拆分成小函数。层层缩进的"箭头型代码"是维护噩梦。',
      '三元运算符是"二选一并产出值"的紧凑版 if，适合赋值场景；一旦需要执行多行动作或在分支间切换，就用标准 if/else。',
      '调试技巧：不确定走了哪个分支时，在每个分支里加一条不同的 console.log，跑一遍立刻清楚。'
    ],
    notes: [
      '卫语句示例：function fee(age) { if (age < 0) return null; ... } 先排除非法情况，主逻辑就不必层层嵌套。'
    ],
    example:
      'const score = 85;\n' +
      'if (score >= 90) {\n' +
      '  console.log("优秀");\n' +
      '} else if (score >= 60) {\n' +
      '  console.log("及格");\n' +
      '} else {\n' +
      '  console.log("不及格");\n' +
      '}\n' +
      '// 输出：及格\n\n' +
      '// 简洁的真值判断\n' +
      'const cart = ["书", "笔"];\n' +
      'if (cart.length) {\n' +
      '  console.log(`购物车有 ${cart.length} 件商品`);\n' +
      '}',
    example2Title: '实战：闰年判断',
    example2:
      '// 闰年规则：能被4整除但不能被100整除，或能被400整除\n' +
      'function isLeapYear(year) {\n' +
      '  if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {\n' +
      '    return true;\n' +
      '  }\n' +
      '  return false;\n' +
      '}\n\n' +
      'console.log(isLeapYear(2024));  // true\n' +
      'console.log(isLeapYear(1900));  // false\n' +
      'console.log(isLeapYear(2000));  // true'
  },
  {
    id: 'js-switch',
    title: '10. switch 多分支',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: '当多个固定值分支时，用 switch 代替长长的 if/else。',
    detail: [
      'switch 语句把一个值与一系列 case 逐一比对，命中哪个就从哪个 case 的代码开始执行。适合"一个变量对应多种固定取值"的场景，比分层的 if/else 更一目了然。',
      '匹配用的是严格相等（===），不做类型转换：case 1 只匹配数字 1，不匹配字符串 "1"。',
      'break 的作用是"办完就走"：命中 case 后代码会一直往下执行直到遇到 break 或 switch 结尾——这叫 fall-through（贯穿）。忘记写 break，后面的 case 会被连带执行，是最经典的 switch bug。',
      '贯穿也有正当用途：多个 case 共享同一段逻辑时，故意省略中间的 break 让它们"落"到公共代码，典型例子是按月份判断季节。',
      'default 分支处理所有未命中的情况，相当于 if/else 里最后的 else。惯例写在最后，同样记得 break 或让它自然结束。',
      'switch 只适合做"等值匹配"；涉及范围判断（大于小于）、复杂条件组合时，还是 if/else if 更合适。',
      '另一种现代替代方案：用对象映射。const actions = { a: () => ..., b: () => ... }，然后 actions[key]?.()，分支多时可读性更好（学到对象章节后再回顾）。'
    ],
    notes: [
      '自查清单：每个 case 都有 break 吗？default 写了吗？case 的值和被测值类型一致吗？'
    ],
    example:
      'const day = "周一";\n' +
      'switch (day) {\n' +
      '  case "周一":\n' +
      '    console.log("开工");\n' +
      '    break;\n' +
      '  case "周六":\n' +
      '  case "周日":          // 两 case 共享一段逻辑（贯穿）\n' +
      '    console.log("休息");\n' +
      '    break;\n' +
      '  default:\n' +
      '    console.log("普通一天");\n' +
      '}\n' +
      '// 输出：开工',
    example2Title: '实战：简单计算器',
    example2:
      'function calc(a, op, b) {\n' +
      '  switch (op) {\n' +
      '    case "+": return a + b;\n' +
      '    case "-": return a - b;\n' +
      '    case "*": return a * b;\n' +
      '    case "/":\n' +
      '      if (b === 0) return "除数不能为0";\n' +
      '      return a / b;\n' +
      '    default:\n' +
      '      return "不支持的运算符";\n' +
      '  }\n' +
      '}\n\n' +
      'console.log(calc(6, "*", 7));   // 42\n' +
      'console.log(calc(1, "/", 0));   // 除数不能为0\n' +
      'console.log(calc(1, "%", 2));   // 不支持的运算符'
  },
  {
    id: 'js-loops',
    title: '11. 循环：for / while / do-while',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: '重复执行代码块的三种基本循环，以及累加等经典模式。',
    detail: [
      '循环让计算机做重复劳动。三种基本形态：for 适合"知道要循环几次"；while 适合"满足条件就一直做"；do-while 保证至少做一次。',
      'for 循环语法：for (初始化; 继续条件; 步进) { 循环体 }。执行顺序是：初始化只跑一次 → 检查条件 → 为真则执行循环体 → 步进 → 再检查条件……直到条件为假。let i = 0 把循环变量限制在循环内是好习惯。',
      '经典模式一：累加。准备一个 sum 变量在循环外初始化为 0，每次循环 sum += 当前项，循环结束后 sum 就是总和。求 1~100 的和、购物车总价都是这个套路。',
      '经典模式二：遍历下标。for (let i = 0; i < arr.length; i++) 用 i 当数组下标访问每个元素；需要隔个处理（如只看偶数位）或反向遍历（i-- 从末尾往前）时，这种带下标的循环最灵活。',
      '经典模式三：嵌套循环。外层走一轮，内层走完一整轮。打印九九乘法表、二维表格都要用它。注意内层循环变量必须和外层不同名（i 和 j）。',
      'while (条件) { 循环体 }：先判断后执行。循环体里必须有能让条件最终变假的语句（通常是更新变量），否则死循环——浏览器页面卡死、终端刷屏多半就是这么来的。万一卡死：浏览器标签页可强制关闭，终端 Ctrl+C 中断。',
      'do { 循环体 } while (条件)：先斩后奏，无论条件真假至少执行一次。适合"先展示菜单再问要不要继续"这类必然要做一次的场景。',
      '选择口诀：次数已知用 for；条件驱动用 while；至少一次用 do-while；遍历数组/字符串优先用后面讲的 for...of。'
    ],
    notes: [
      '写 while 前先回答三个问题：初始状态是什么？什么时候停？每一轮怎样向停止靠近？想清楚这三点就不会死循环。'
    ],
    example:
      'for (let i = 1; i <= 3; i++) {\n' +
      '  console.log(i);          // 1 2 3\n' +
      '}\n\n' +
      '// 累加：1~100 的和\n' +
      'let sum = 0;\n' +
      'for (let i = 1; i <= 100; i++) {\n' +
      '  sum += i;\n' +
      '}\n' +
      'console.log(sum);          // 5050\n\n' +
      'let n = 0;\n' +
      'while (n < 3) {\n' +
      '  console.log(n);          // 0 1 2\n' +
      '  n++;\n' +
      '}\n\n' +
      'let m = 0;\n' +
      'do {\n' +
      '  console.log("至少一次");\n' +
      '} while (m > 0);',
    example2Title: '实战：九九乘法表',
    example2:
      'for (let i = 1; i <= 9; i++) {\n' +
      '  let row = "";\n' +
      '  for (let j = 1; j <= i; j++) {\n' +
      '    row += `${j}×${i}=${String(i * j).padStart(2)}  `;\n' +
      '  }\n' +
      '  console.log(row);\n' +
      '}\n' +
      '// 1×1= 1\n' +
      '// 1×2= 2  2×2= 4\n' +
      '// ...(一直到 9)'
  },
  {
    id: 'js-forof',
    title: '12. 遍历：for...of / for...in / forEach',
    category: '从零开始',
    version: 'ES6',
    level: '入门',
    summary: '三种遍历方式的区别与选用：for...of 遍历值，for...in 遍历键。',
    detail: [
      'for...of 是 ES6 引入的现代遍历方式，直接取出可迭代对象的每一个"值"：数组挨个拿元素、字符串挨个拿字符。不需要管下标、不需要写长度判断，干净利落，是遍历数组和字符串的首选。',
      'for...in 遍历对象的"可枚举属性名（键）"：for (const key in obj)，用 obj[key] 取对应的值。它主要用于普通对象；不建议用来遍历数组——它会沿原型链把继承来的属性也翻出来，且遍历顺序在某些情况下不保证。',
      'forEach 是数组自带的方法：arr.forEach((元素, 下标) => { ... })，对每个元素执行一次回调。它不能被 break/continue 中断（想中途退出请改用 for...of 或 some/every）。',
      '选用总结：遍历数组要值 → for...of；还要下标 → for...of 配 arr.entries()，或 forEach；要边遍历边筛选转换 → 学到 map/filter 后优先用它们；遍历普通对象的键 → for...in 或 Object.keys(obj)。',
      'for...of 也可以配合 break/continue 正常使用，这是它优于 forEach 的地方。',
      '遍历时增删数组元素是危险操作：边遍历边 splice 会导致跳元素。正确做法是先收集要删的，遍历结束后统一处理，或直接用 filter 生成新数组。',
      'Object.keys / Object.values / Object.entries 是遍历对象的三兄弟：分别拿到键数组、值数组、[键,值] 对数组，配合 for...of 使用非常顺手。'
    ],
    notes: [
      '一句话记忆：of 拿值，in 拿键；数组用 of，对象用 in / Object.keys。'
    ],
    example:
      'const fruits = ["苹果", "香蕉", "橙子"];\n' +
      'for (const f of fruits) {\n' +
      '  console.log(f);\n' +
      '}\n\n' +
      'for (const ch of "Hi") {\n' +
      '  console.log(ch);          // H i\n' +
      '}\n\n' +
      'const obj = { a: 1, b: 2 };\n' +
      'for (const key in obj) {\n' +
      '  console.log(key, obj[key]);   // a 1  b 2\n' +
      '}\n\n' +
      'fruits.forEach((f, i) => console.log(i, f));',
    example2Title: '对象遍历三兄弟',
    example2:
      'const scores = { 语文: 92, 数学: 98, 英语: 88 };\n\n' +
      'for (const subject of Object.keys(scores)) {\n' +
      '  console.log(subject);                 // 科目名\n' +
      '}\n\n' +
      'let total = 0;\n' +
      'for (const s of Object.values(scores)) {\n' +
      '  total += s;\n' +
      '}\n' +
      'console.log(total / Object.keys(scores).length); // 平均分\n\n' +
      'for (const [subject, s] of Object.entries(scores)) {\n' +
      '  console.log(`${subject}: ${s}`);      // 键值一起拿\n' +
      '}'
  },
  {
    id: 'js-break',
    title: '13. break / continue / 标签',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: '控制循环流程：跳出与跳过，以及多层循环的标签跳转。',
    detail: [
      'break：立即终止整个循环，跳到循环之后的第一条语句。典型场景是"找到就撤"——在一堆数据里找目标，找到了没必要再看剩下的。',
      'continue：只跳过本轮迭代剩下的语句，直接进入下一轮（for 循环会先执行步进 i++）。典型场景是"过滤"——不符合条件的直接略过，符合条件的继续处理。',
      '两者只作用于"最近的一层循环"。在双层循环的内层写 break，只能跳出内层，外层照常进行。',
      '标签（label）解决多层循环的跳出问题：在外层循环前写一个名字加冒号（如 outer:），然后用 break outer 直接终止外层循环，continue outer 则直接进入外层的下一轮。日常代码用得少，但要能看懂。',
      '性能与正确性兼顾的写法：能提前 break 就别傻跑全程。例如在十万条数据里找第一条匹配，找到立刻 break，剩下的九万多条就不用扫了。',
      '替代思路：很多"找东西"的场景用 Array.find / Array.findIndex 更简洁；"是否存在"用 some；这些方法内部自带短路，学到数组方法章节后可回头对比。',
      '注意 continue 在 while 中的陷阱：如果把变量更新写在循环体末尾，continue 会绕过更新导致死循环；for 循环没有这个问题（步进总会执行），这也是推荐 for 的原因之一。'
    ],
    notes: [
      '记忆：break 是"下班"，continue 是"跳过这道题做下一道"。'
    ],
    example:
      'for (let i = 0; i < 10; i++) {\n' +
      '  if (i === 3) continue;     // 跳过 3\n' +
      '  if (i === 7) break;        // 到 7 停止\n' +
      '  console.log(i);            // 0 1 2 4 5 6\n' +
      '}\n\n' +
      '// 找到就撤\n' +
      'const nums = [4, 8, 15, 16, 23, 42];\n' +
      'let found = -1;\n' +
      'for (let i = 0; i < nums.length; i++) {\n' +
      '  if (nums[i] === 15) { found = i; break; }\n' +
      '}\n' +
      'console.log(found);          // 2',
    example2Title: '标签：跳出多层循环',
    example2:
      '// 在二维坐标里找第一个 (x*y > 6) 的点\n' +
      'outer:\n' +
      'for (let x = 1; x <= 5; x++) {\n' +
      '  for (let y = 1; y <= 5; y++) {\n' +
      '    if (x * y > 6) {\n' +
      '      console.log(`找到: (${x}, ${y})`);\n' +
      '      break outer;           // 直接终止两层循环\n' +
      '    }\n' +
      '  }\n' +
      '}\n' +
      '// 输出：找到: (2, 4)\n\n' +
      '// continue outer：跳过本轮外层剩余部分\n' +
      'outer2:\n' +
      'for (let i = 1; i <= 3; i++) {\n' +
      '  for (let j = 1; j <= 3; j++) {\n' +
      '    if (j === 2) continue outer2;\n' +
      '    console.log(i, j);       // 只打印 j=1 的情况\n' +
      '  }\n' +
      '}'
  },
  {
    id: 'js-strict',
    title: '14. 严格模式 "use strict"',
    category: '从零开始',
    version: 'ES5',
    level: '入门',
    summary: '开启严格模式，让 JS 更早暴露错误、禁止危险写法。',
    detail: [
      'JS 早期为了兼容各种乱写的代码，很多明显是错误的写法引擎会选择"默默容忍"，bug 被藏起来。严格模式（strict mode）就是开关：打开后引擎从严执法，同样的错误会当场报错暴露。',
      '开启方式：在脚本或函数的第一行写字符串 "use strict";。写在文件顶部对整个文件生效；写在函数体内只对该函数生效。',
      '严格模式的典型变化：① 未声明就赋值（x = 10 而没写过 let x）从"悄悄创建全局变量"变成直接抛 ReferenceError；② 删除变量、重复的函数参数名、八进制字面量等都会报错；③ 普通函数内部的 this 不再默认指向全局对象而是 undefined，避免误操作全局。',
      '为什么现在很少手写它：ES6 的模块（import/export）和 class 内部默认就是严格模式；打包工具生成的代码也普遍自动加上。但在普通 <script> 或早期代码里仍会遇到，需要认识它。',
      '实践意义：把 "use strict" 理解为"帮我把隐患变成显式报错"的开发助手。报错不是坏事——问题越早暴露，修复成本越低。',
      '常见的严格模式报错举例：给不可写属性赋值、用 eval 声明变量、arguments.callee 等历史 API 被禁用。遇到报错先读懂信息，多数是代码本身不规范。'
    ],
    notes: [
      '模块化时代结论：不必刻意书写，但要认识它；看到 "use strict" 相关报错，说明你的代码有不规范之处。'
    ],
    example:
      '"use strict";\n' +
      '// x = 10;        // 严格模式下报错：x 未声明\n' +
      '//                （非严格模式会悄悄创建全局变量 x）\n' +
      'let x = 10;      // 正确：先声明再赋值\n' +
      '\n' +
      'function f() {\n' +
      '  "use strict";  // 只对本函数生效\n' +
      '  console.log("strict on");\n' +
      '}\n' +
      'f();',
    example2Title: '严格模式抓出的真实 bug',
    example2:
      '"use strict";\n' +
      'function addTax(price) {\n' +
      '  // 本意是修改参数 price，却打错了字写成 prcie\n' +
      '  try {\n' +
      '    prcie = price * 1.13;   // 非严格模式：悄悄创建全局变量 prcie，函数返回值错得离谱还不报错\n' +
      '    return prcie;\n' +
      '  } catch (e) {\n' +
      '    return "抓到拼写错误: " + e.message;\n' +
      '  }\n' +
      '}\n' +
      'console.log(addTax(100));  // 严格模式下立刻暴露拼写错误'
  },
  {
    id: 'js-practice1',
    title: '15. 阶段练习：猜数字小游戏',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: '综合运用变量、循环、条件与随机数完成两个小练习。',
    detail: [
      '练习是检验第一阶段成果的最好方式。猜数字游戏的完整需求：程序随机生成 1~10 的答案，玩家反复输入猜测，程序提示"大了/小了"，猜中后显示一共用了几次。',
      '拆解步骤（编程核心思维——把大问题切成小步骤）：① 生成随机答案（Math.random 套公式）；② 准备计次变量和当前猜测变量；③ 写循环，条件是"还没猜中"；④ 循环体内获取输入并转换成数字；⑤ if/else 比较给出提示；⑥ 猜中后跳出并输出次数。',
      '要点提醒：prompt 拿到的是字符串，必须 Number() 转换后再比较；统计次数的变量要在循环外初始化；用 !== 判断不相等而不是 ==。',
      '第二个练习 FizzBuzz（经典面试题）：打印 1~30，遇 3 的倍数打印 Fizz，5 的倍数打印 Buzz，既是 3 又是 5 的倍数打印 FizzBuzz。考察取余运算和条件顺序——注意必须先判断"同时是 3 和 5 的倍数"，否则会被 3 的倍数分支提前截胡。',
      '做完后尝试改造：给猜数字限制最多 5 次机会（超限输出"游戏结束"）；把 FizzBuzz 的 3 和 5 改成变量；这些都是举一反三的训练。',
      '自查清单：能否不看示例独立写出？能否说清每一行的作用？报错时能否自己定位到哪一行出的问题？三条都做到，就可以进入第二阶段（函数与对象）了。'
    ],
    notes: [
      '浏览器中 prompt() 弹窗输入；纯 Node 环境可先把猜测值硬编码测试逻辑，再接 readline。'
    ],
    example:
      '// 猜数字：1~10\n' +
      'const answer = Math.floor(Math.random() * 10) + 1;\n' +
      'let count = 0;\n' +
      'let guess = 0;\n' +
      'while (guess !== answer) {\n' +
      '  guess = Number(prompt("猜一个 1-10 的数字"));\n' +
      '  count++;\n' +
      '  if (guess > answer) console.log("大了");\n' +
      '  else if (guess < answer) console.log("小了");\n' +
      '}\n' +
      'console.log(`猜对了！共用了 ${count} 次`);',
    example2Title: '练习二：FizzBuzz',
    example2:
      'for (let i = 1; i <= 30; i++) {\n' +
      '  if (i % 15 === 0) {          // 先判 3 和 5 的公倍数\n' +
      '    console.log("FizzBuzz");\n' +
      '  } else if (i % 3 === 0) {\n' +
      '    console.log("Fizz");\n' +
      '  } else if (i % 5 === 0) {\n' +
      '    console.log("Buzz");\n' +
      '  } else {\n' +
      '    console.log(i);\n' +
      '  }\n' +
      '}\n\n' +
      '// 进阶：限制 5 次机会的猜数字（核心片段）\n' +
      'const maxTries = 5;\n' +
      'for (let t = 1; t <= maxTries; t++) {\n' +
      '  const g = Number(prompt(`第 ${t}/${maxTries} 次猜测:`));\n' +
      '  if (g === answer) { console.log("赢了!"); break; }\n' +
      '  if (t === maxTries) console.log("机会用完，游戏结束");\n' +
      '}\n' +
      '// 说明：break 只跳出 for；若 g 永远不等于 answer，\n' +
      '// 循环自然结束后由 t === maxTries 的判断给出失败提示。'
  }
];
