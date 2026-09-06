// AI Agent 开发教程 —— 第一阶段：从零开始（模型、提示词、工具循环）
module.exports = [
  {
    id: 'agent-what',
    title: '1. AI Agent 是什么',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: 'Agent 不是会聊天就够了：它在循环里观察、决策、调用工具、再观察，直到任务完成或放弃。',
    detail: [
      '聊天机器人（Chatbot）通常是：用户说一句，模型回一句，结束。AI Agent 多了"行动能力"：它可以调用搜索、读写文件、跑代码、调内部 API，并根据工具返回的结果继续想下一步。',
      '一个最小心智模型是循环：① 观察当前状态（用户目标 + 历史 + 工具结果）；② 思考下一步（由大模型完成）；③ 行动（调用工具或给出最终答案）；④ 把行动结果写回状态，回到 ①。停下来的条件是"任务完成"或"达到步数上限"。',
      'Agent 这个词被用得很滥。本教程特指"由大模型驱动、可调用工具、多步自主推进"的程序。它不是科幻里的通用人工智能，也不是把 if-else 工作流硬叫成智能。模型会犯错、会幻觉、会循环，工程上必须设边界。',
      '和传统自动化的差别：工作流把步骤写死（先 A 后 B）；Agent 让模型在运行时选择步骤。灵活的代价是不可完全预知，所以要日志、权限、超时和人工确认。',
      '典型应用：客服里查订单并退款（需权限）、代码助手改仓库、研究助手检索并写纪要、运维助手查日志。不适合的场景：必须 100% 正确的资金划转、无监督的生产删除、需要形式化证明的决策。',
      '后面每一章都在给这个循环加零件：怎么调模型、怎么写系统提示、怎么声明工具、怎么管记忆、怎么评估、怎么防提示注入。先记住循环，语法才有落点。'
    ],
    notes: [
      '本教程示例以 Python + OpenAI 兼容 API 为主（官方 SDK、DeepSeek、本地 vLLM 等都能套同一套 messages 格式）。',
      '先自己手写循环，再上框架。否则框架里的"Agent"会变成黑盒。'
    ],
    example:
      '# Agent 的伪代码：不是一次 chat.completions，而是一个循环\n' +
      'state = {"goal": user_input, "messages": [], "step": 0}\n' +
      'while state["step"] < MAX_STEPS:\n' +
      '    thought = llm_decide(state)          # 观察 -> 决策\n' +
      '    if thought.kind == "final":\n' +
      '        return thought.answer            # 完成\n' +
      '    result = run_tool(thought.tool, thought.args)  # 行动\n' +
      '    state["messages"].append(result)     # 再观察\n' +
      '    state["step"] += 1\n' +
      'return "达到步数上限，未完成"'
  },
  {
    id: 'agent-llm-basics',
    title: '2. 大模型基础：token、上下文、温度',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: '模型吃的是 token 不是"字符数"；上下文有上限；温度影响随机性。这些直接决定 Agent 的成本和稳定性。',
    detail: [
      '大语言模型（LLM）把文本切成 token（子词片段）再计算。中文一个字常常是 1～2 个 token，英文一个常见词常是 1 个。账单、上下文窗口、速度都按 token 算，不要用"字数"估成本。',
      '上下文窗口是一次请求里"模型能看到的全部 token"：系统提示 + 历史对话 + 工具定义 + 工具返回。窗口用满后，旧消息必须截断或摘要，否则请求失败或被静默丢掉。Agent 跑得越久，越容易把窗口撑爆。',
      '温度 temperature 接近 0 时输出更确定，适合选工具、填 JSON、写代码；升高后更发散，适合头脑风暴。Agent 的"决策步"建议低温，"写文案步"可以略高。top_p、presence_penalty 同理，先只调温度就够。',
      '能力边界：模型擅长模式补全，不保证事实、不保证算术、看不到你没放进上下文的私有数据。要事实就检索，要精确计算就用计算器工具，要最新信息就联网。把这些当默认设计，而不是等它自己"变聪明"。',
      '延迟：首 token 时间 + 生成速度。Agent 往往多次调用模型，用户感知的是各轮之和。流式输出（后面章节）能先把思考过程推到界面上，降低"卡住了"的感觉。',
      '选型直觉：强推理模型适合规划和难任务，但更慢更贵；小模型适合分类、路由、简单抽槽。很多系统用小模型做门卫、大模型做核心推理。'
    ],
    notes: [
      '同一段中文，不同模型的 tokenizer 不同，token 数不可跨厂商硬比。',
      'max_tokens 限制的是"本次生成"，不是上下文窗口。窗口是输入+输出一起算的（具体以厂商文档为准）。'
    ],
    example:
      '# 粗略感知 token（真实计数请用各模型的 tokenizer）\n' +
      'text = "你好，世界"\n' +
      'print(len(text), "个字符")\n' +
      '# 中文往往比字符数更多 token\n\n' +
      '# 调用时和 Agent 强相关的参数\n' +
      'params = {\n' +
      '    "model": "gpt-4.1-mini",   # 换成你的兼容模型名\n' +
      '    "temperature": 0,          # 决策步用 0~0.3\n' +
      '    "max_tokens": 800,         # 限制单次生成长度\n' +
      '}\n' +
      'print(params)'
  },
  {
    id: 'agent-messages',
    title: '3. 调用 LLM：messages 与角色',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: '对话被建模成消息列表：system / user / assistant / tool。Agent 的状态几乎就是这份列表。',
    detail: [
      '主流 Chat Completions 接口把一次请求写成 messages 数组。每条有 role 和 content。模型根据整份列表生成下一条 assistant 消息。Agent 每走一步，就是往列表里追加内容再请求一次。',
      'system：开发者写的总规则（人设、可用工具说明、输出格式、禁止事项）。user：用户原话或你转述的目标。assistant：模型上次说的话或工具调用。tool / function：工具执行结果，必须对应某次调用的 id。',
      '不要把"当前任务"只放在心里。用户说"把刚才那个再改短"，模型只能靠列表里的"刚才那个"。列表就是短期记忆。',
      '最小可运行调用：构造 client，传 model 和 messages，读返回的 choices[0].message。先跑通一次普通问答，再叠加工具。环境变量里放 API Key，不要写进仓库。',
      '兼容生态：OpenAI 官方、Azure、DeepSeek、Moonshot、很多本地网关都提供同一套 messages。换 base_url 和 model 名即可，Agent 循环不用重写。',
      '失败时看三件事：HTTP 状态（401 密钥、429 限流、400 消息格式）、finish_reason（stop 正常结束、length 被截断、tool_calls 要去跑工具）、空 content（可能只点了工具没有正文）。'
    ],
    notes: [
      '安装：pip install openai。密钥：export OPENAI_API_KEY=...（Windows 用 set 或系统环境变量）。',
      '教学阶段把每次 messages 打印出来，比任何框架仪表盘都有用。'
    ],
    example:
      'import os\n' +
      'from openai import OpenAI\n\n' +
      'client = OpenAI(\n' +
      '    api_key=os.environ.get("OPENAI_API_KEY"),\n' +
      '    # base_url="https://api.deepseek.com",  # 兼容接口示例\n' +
      ')\n\n' +
      'messages = [\n' +
      '    {"role": "system", "content": "你是简洁的助手，用中文回答。"},\n' +
      '    {"role": "user", "content": "用一句话解释什么是 AI Agent。"},\n' +
      ']\n' +
      'resp = client.chat.completions.create(\n' +
      '    model="gpt-4.1-mini",\n' +
      '    temperature=0,\n' +
      '    messages=messages,\n' +
      ')\n' +
      'print(resp.choices[0].message.content)'
  },
  {
    id: 'agent-system-prompt',
    title: '4. 系统提示词：给 Agent 立规矩',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: '系统提示写清身份、目标、工具用法、输出格式和停机条件，比堆形容词有用得多。',
    detail: [
      '系统提示是 Agent 的宪法。模型没有长期记忆你的口头叮嘱，每次请求都要重新看到这些规则。写短、写硬、写可检查，不要写"请尽可能完美且无比聪明"。',
      '建议固定几块：① 身份与目标（你在帮谁完成什么）；② 能力边界（你会什么、不会什么）；③ 工具策略（何时调用、缺参时先问人还是猜测）；④ 输出格式（最终答案的结构）；⑤ 安全（不能做的操作、涉及资金要确认）；⑥ 停机（何时直接回答、何时承认失败）。',
      '把工具的细节同时写在 tools 字段和系统提示里容易重复。系统提示侧重策略（"不确定就问""先搜再答"），JSON schema 侧重参数形状。两边矛盾时，模型行为会摇摆。',
      '少用否定堆砌（"不要胡说不要废话不要……"），改成正向流程："先列出已知条件；缺失则提问；需要外部事实则调用 search。"',
      '针对 Agent，明确"思考对用户不可见、最终答案单独一段"或相反"展示简短计划"。你不规定，模型有时会把内心独白和给用户的话混在一起。',
      '提示词要版本管理：像代码一样放进仓库、改动写 changelog。线上出问题先对比提示词 diff，经常比换模型更有效。'
    ],
    notes: [
      '同一套提示在不同模型上表现差一截是正常的，迁模型时要回归测试，不要假设提示可移植。',
      '用户消息里也可以带一次性约束，但全局规则放 system，避免每轮复制。'
    ],
    example:
      'SYSTEM = """\n' +
      '你是订单助手。目标：根据用户问题查询订单并给出下一步建议。\n' +
      '规则：\n' +
      '1. 需要订单数据时调用 get_order，禁止编造物流状态。\n' +
      '2. 缺少 order_id 时先向用户要，不要猜测。\n' +
      '3. 退款、取消必须得到用户明确确认后再调用对应工具。\n' +
      '4. 最终用中文简短回答；过程思考不要输出给用户。\n' +
      '5. 工具连续失败 2 次则道歉并建议转人工。\n' +
      '"""\n\n' +
      'messages = [\n' +
      '    {"role": "system", "content": SYSTEM},\n' +
      '    {"role": "user", "content": "我的货到哪了？单号 A1024"},\n' +
      ']'
  },
  {
    id: 'agent-vs-chatbot',
    title: '5. 聊天机器人 vs Agent',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: '差在有没有工具、有没有循环、有没有状态机和权限。先判断你的产品到底需要哪一种。',
    detail: [
      '只做问答、写作、翻译：一次或少数几次 messages 往返就够，别上 Agent。多一层循环会更慢、更贵、更难测。',
      '需要"查真实数据再回答"或"连续执行多个副作用"：才值得做成 Agent。标志是你能列出至少两个工具，且步骤顺序事先不完全确定。',
      '还有第三条路：固定工作流。步骤已知（先 OCR 再分类再写入库），用普通代码编排，只在某节点调用 LLM。这往往比全能 Agent 更稳。能用工作流就别上开放循环。',
      '产品形态对照：客服 FAQ → Chatbot；客服查库改订单 → Agent 或工作流；IDE 里改多文件 → Agent；每晚定时汇总报表 → 工作流。',
      '评测方式也不同。Chatbot 看单轮质量；Agent 看任务成功率、平均步数、错误工具调用率、是否越权。后面评估一章会展开。',
      '架构上 Chatbot 是函数，Agent 是带状态的循环服务。状态要可序列化（方便恢复）、要有超时、要能被用户取消。'
    ],
    notes: [
      '演示 Demo 里 Agent 很炫，生产里失败一次就伤信任。默认选择"工作流 + 局部 LLM"，开放 Agent 当增强。',
      '如果唯一工具是 search，也可以做成"先检索再生成"的 RAG 流水线，不一定需要模型自己决定是否搜索。'
    ],
    example:
      '# Chatbot：单轮\n' +
      'def chatbot(user: str) -> str:\n' +
      '    resp = client.chat.completions.create(\n' +
      '        model="gpt-4.1-mini",\n' +
      '        messages=[{"role": "user", "content": user}],\n' +
      '    )\n' +
      '    return resp.choices[0].message.content\n\n' +
      '# 工作流：步骤写死，节点里用 LLM\n' +
      'def invoice_pipeline(pdf_bytes: bytes) -> dict:\n' +
      '    text = ocr(pdf_bytes)\n' +
      '    fields = extract_fields_with_llm(text)  # 只负责抽槽\n' +
      '    db.save(fields)\n' +
      '    return fields\n\n' +
      '# Agent：模型自己选下一步（见后续工具循环）'
  },
  {
    id: 'agent-tools',
    title: '6. 工具：Function Calling',
    category: '核心能力',
    version: '入门',
    level: '入门',
    summary: '把可执行函数登记成 JSON Schema，模型只能"点名+填参"，真正执行权在你的代码。',
    detail: [
      '工具是 Agent 的手。模型不能真的访问你的数据库，它只能在回复里声明：我要调用 get_order，参数是 {"id":"A1024"}。你的运行时解析这段声明，执行函数，把结果当 tool 消息送回去。',
      '声明包含：name、description（模型靠这段决定用不用）、parameters（JSON Schema：类型、必填、枚举）。description 写清"何时用、返回什么、不要何时用"，比把同名函数丢进去重要得多。',
      '参数要窄：能枚举就枚举，能 number 就不要 string。越宽模型越会填出奇怪的值。日期用 ISO 字符串并在执行前校验。',
      '工具越少越好。十个职责清晰的工具，好过一个万能 do_anything(cmd: str)。万能工具等于把代码注入权交给模型。',
      '副作用工具（发邮件、付款、删数据）必须在描述里标明，并在运行时做权限和确认。只读工具和写入工具分开，默认只开放只读。',
      '厂商字段名略有差异（tools + type: function，或旧的 functions）。思想相同：schema 给模型看，dispatch 表给你自己的 Python 函数。'
    ],
    notes: [
      '模型填的参数不可信：一律校验类型、范围、ID 归属（这个订单是不是当前用户的）。',
      '工具返回给模型的内容也要控制体积，超长日志先截断或摘要，否则下一轮上下文爆掉。'
    ],
    example:
      'TOOLS = [\n' +
      '    {\n' +
      '        "type": "function",\n' +
      '        "function": {\n' +
      '            "name": "get_weather",\n' +
      '            "description": "查询某城市当前天气。城市用中文名。不要用它查历史。",\n' +
      '            "parameters": {\n' +
      '                "type": "object",\n' +
      '                "properties": {\n' +
      '                    "city": {"type": "string", "description": "城市，如 北京"}\n' +
      '                },\n' +
      '                "required": ["city"],\n' +
      '            },\n' +
      '        },\n' +
      '    }\n' +
      ']\n\n' +
      'def get_weather(city: str) -> str:\n' +
      '    # 这里接真实天气 API；示例返回假数据\n' +
      '    return f"{city} 晴，25°C"'
  },
  {
    id: 'agent-tool-loop',
    title: '7. 工具循环：选工具、执行、回填',
    category: '核心能力',
    version: '入门',
    level: '入门',
    summary: 'finish_reason 为 tool_calls 时不要结束；执行后把结果以 tool 角色追加，再请求模型。',
    detail: [
      '这是 Agent 运行时的心脏。请求时带上 tools。若返回 message.tool_calls，说明模型还没给最终答案。对每个 tool_call：取出 name、arguments（JSON 字符串）、id；在本地 dispatch；追加一条 role=tool、tool_call_id=id、content=结果字符串；再次 create。',
      'arguments 可能不是合法 JSON（漏引号、尾逗号）。要 try/except，失败则把错误字符串当工具结果返回，让模型改参重试，而不是让整个进程崩溃。',
      '一次回复可能包含多个 tool_calls（并行）。能并行就并行（两个只读查询），有依赖就按数据流顺序执行。并行写操作要格外小心。',
      '必须把"带 tool_calls 的那条 assistant 消息"原样放进历史，再跟 tool 结果。缺了这一条，接口会报 tool 消息找不到对应调用。',
      '循环要有硬上限（例如 8 步）。模型卡在来回调同一个工具时，靠上限 + 重复检测跳出，返回"未能完成"比烧钱空转好。',
      '日志打：step、tool name、参数（脱敏）、耗时、结果摘要。没有轨迹，你无法调试"它为什么要查三次天气"。'
    ],
    notes: [
      'content 与 tool_calls 可能同时存在或只有后者，以 SDK 对象为准，不要假设一定有一段中文思考。',
      '把用户密钥、cookie 从工具结果里剥掉再送回模型。'
    ],
    example:
      'import json\n\n' +
      'DISPATCH = {"get_weather": get_weather}\n' +
      'def run_agent(user: str, max_steps: int = 8) -> str:\n' +
      '    messages = [\n' +
      '        {"role": "system", "content": SYSTEM},\n' +
      '        {"role": "user", "content": user},\n' +
      '    ]\n' +
      '    for _ in range(max_steps):\n' +
      '        msg = client.chat.completions.create(\n' +
      '            model="gpt-4.1-mini", temperature=0,\n' +
      '            messages=messages, tools=TOOLS,\n' +
      '        ).choices[0].message\n' +
      '        messages.append(msg)\n' +
      '        if not msg.tool_calls:\n' +
      '            return msg.content or ""\n' +
      '        for call in msg.tool_calls:\n' +
      '            fn = DISPATCH[call.function.name]\n' +
      '            args = json.loads(call.function.arguments or "{}")\n' +
      '            result = fn(**args)\n' +
      '            messages.append({\n' +
      '                "role": "tool",\n' +
      '                "tool_call_id": call.id,\n' +
      '                "content": str(result),\n' +
      '            })\n' +
      '    return "超过最大步数"'
  },
  {
    id: 'agent-react',
    title: '8. ReAct：推理与行动交替',
    category: '核心能力',
    version: '入门',
    level: '入门',
    summary: 'ReAct 让模型先写 Thought，再选 Action，观察 Observation，减少盲目调工具。',
    detail: [
      'ReAct（Reason + Act）是论文里的一种提示模式：模型输出 Thought（我缺什么信息）→ Action（调哪个工具）→ 你执行后给 Observation → 再 Thought。原生 Function Calling 已经把 Action 结构化了，Thought 有时在 content 里，有时被模型省略。',
      '为什么还要懂它：当模型乱调工具时，强制"先一句话计划再调用"能提高成功率。你可以在系统提示里要求：每次工具前用一句话说明目的。',
      '纯文本 ReAct（自己解析 Action: search[query]）是早期做法，脆弱。现在优先用官方 tool_calls，ReAct 只保留"思考格式"的思想。',
      'Thought 不要对用户原样展示过长内容，可能泄漏内部策略。产品上可显示"正在查询订单…"这种安全摘要。',
      '失败模式：Thought 正确但 Action 填错参；Observation 太长模型抓不住重点；Thought 与最终答案矛盾。对策分别是：收紧 schema、截断/结构化返回、最终答案单独一轮总结。',
      '和"先规划再执行"的差别：ReAct 是一步一回头；Planning 是先列完整计划再走。简单任务 ReAct 够用，长任务两者常组合：先计划，每步仍 ReAct。'
    ],
    notes: [
      '不要为了像论文一样强行解析自由文本动作，调试成本会把你拖垮。',
      '若供应商支持"推理内容"字段（reasoning），把它当 Thought 存日志，不必再提示模型用特殊标记。'
    ],
    example:
      'REACT_HINT = """\n' +
      '每次决定前先在内部想清：已知什么、缺什么、下一步工具是什么。\n' +
      '然后使用 function calling，不要用自由文本假装调用工具。\n' +
      '观察工具结果后再决定是继续调用还是给出最终答案。\n' +
      '"""\n\n' +
      '# 轨迹在日志里长这样（示意）\n' +
      'trace = [\n' +
      '    {"thought": "用户问北京天气，我没有实时数据", "action": "get_weather", "args": {"city": "北京"}},\n' +
      '    {"observation": "北京 晴，25°C"},\n' +
      '    {"thought": "信息足够", "final": "北京今天晴，约 25°C。"},\n' +
      ']'
  },
  {
    id: 'agent-planning',
    title: '9. 规划：先拆步骤再执行',
    category: '核心能力',
    version: '进阶',
    level: '进阶',
    summary: '长任务先让模型产出计划（可编辑），再逐步执行；计划和执行可用不同模型。',
    detail: [
      '用户说"帮我做竞品调研并写成表格"包含检索、归纳、制表多个阶段。不规划就进工具循环，模型容易东一榔头西一棒，重复搜索或提前写结论。',
      '做法：第一轮只允许输出计划（JSON 步骤列表：id、目的、可能用的工具、依赖）。展示给用户可改。确认后再进入执行 Agent，每步带上"当前步骤 + 已完成结果"。',
      '计划要可检验：步骤可数、有依赖、有完成标准（"得到至少 3 个竞品的价格"）。模糊步骤（"深入研究"）等于没规划。',
      '执行中允许修订计划（replan）：工具发现前提错了（竞品不存在），就更新后续步骤，而不是一条路走到黑。修订次数也要设上限。',
      '模型分工：规划用强推理模型，执行用更快的模型去调工具。成本和延迟往往比全程旗舰模型更好。',
      '计划不等于保证。仍要步数上限、工具白名单。规划只是降低盲目性，不是形式化验证。'
    ],
    notes: [
      '用户可见的计划里不要出现内部工具真名和密钥参数，用业务语言："查询公开价格"。',
      '步骤结果写进一个 scratchpad（便笺），比全部塞进 messages 更好管理。'
    ],
    example:
      'PLAN_SCHEMA = {\n' +
      '    "type": "object",\n' +
      '    "properties": {\n' +
      '        "steps": {\n' +
      '            "type": "array",\n' +
      '            "items": {\n' +
      '                "type": "object",\n' +
      '                "properties": {\n' +
      '                    "id": {"type": "integer"},\n' +
      '                    "goal": {"type": "string"},\n' +
      '                    "done_when": {"type": "string"},\n' +
      '                },\n' +
      '                "required": ["id", "goal", "done_when"],\n' +
      '            },\n' +
      '        }\n' +
      '    },\n' +
      '    "required": ["steps"],\n' +
      '}\n\n' +
      '# 第一轮：response_format 约束成 JSON 计划，不开放工具'
  },
  {
    id: 'agent-short-memory',
    title: '10. 短期记忆：历史、截断与摘要',
    category: '核心能力',
    version: '进阶',
    level: '进阶',
    summary: '对话历史就是工作记忆。窗口满了要截断、滑动或摘要，不能假设模型会自己记住上周的事。',
    detail: [
      '短期记忆 = 当前请求的 messages。超过窗口必须处理。三种基本策略：① 丢弃最早的非 system 消息（滑动窗口）；② 把旧对话摘要成一条 system 或 user 笔记再丢掉细节；③ 按优先级保留（最近 N 轮 + 含工具结果的关键轮）。',
      '永远保留：系统提示、当前用户任务、尚未闭合的 tool_calls 对。乱删 tool 对应关系会让接口报错。',
      '工具结果往往是膨胀大户。原始 HTML、整份日志不要回灌。返回结构化短 JSON：{status, top3, truncated:true}。',
      '摘要要用低温、明确"保留事实、ID、用户偏好、未完成待办，删除寒暄"。摘要本身会丢信息，关键 ID 应用外部存储（订单号写进业务库）而不是只靠摘要。',
      '多轮产品要把会话存数据库（session_id → messages）。无状态的云函数每次只靠前端传来的全量历史，既不安全也会超体积。',
      '调试时在日志里打 token 估算，观察哪一类消息在涨。优化记忆比换更大窗口的模型更便宜。'
    ],
    notes: [
      '截断时从前往后删 user/assistant 对，尽量成对删除，避免助手回答悬空。',
      '不要用"模型说它记住了"当记忆实现，那只是生成风格。'
    ],
    example:
      'def trim_messages(messages, keep_last=12):\n' +
      '    sys = [m for m in messages if m.get("role") == "system"]\n' +
      '    rest = [m for m in messages if m.get("role") != "system"]\n' +
      '    if len(rest) <= keep_last:\n' +
      '        return sys + rest\n' +
      '    # 简单滑动：只留最后 N 条（生产中要避开拆开的 tool 对）\n' +
      '    return sys + rest[-keep_last:]\n\n' +
      'def summarize_old(client, old_msgs) -> dict:\n' +
      '    text = "\\n".join(f\'{m["role"]}: {m.get("content")}\' for m in old_msgs)\n' +
      '    # 调一次 LLM 得到摘要，再作为一条系统笔记插入\n' +
      '    return {"role": "system", "content": "对话摘要：" + text[:500]}'
  },
  {
    id: 'agent-json',
    title: '11. 结构化输出',
    category: '核心能力',
    version: '进阶',
    level: '进阶',
    summary: '让模型按 JSON Schema 吐结果，程序才能稳定解析；Agent 的计划、工具参数、最终答案都适用。',
    detail: [
      '自由文本对人类友好，对程序不友好。抽取字段、分流、写库，都应尽量用 JSON。OpenAI 兼容接口常见 response_format: json_object 或 json_schema（严格模式）。',
      '严格 schema 能禁止多余字段、要求必填。工具参数本身就是 schema。最终答案也可以是 {title, bullets, sources[]}，由前端渲染，而不是让模型直接吐 Markdown 再正则抠。',
      '仍要校验：即便声明了 schema，边界情况下仍可能出现缺字段。用 Pydantic / jsonschema 再验一遍，失败则把校验错误作为下一轮 user 消息让模型改，次数设限。',
      '枚举字段减少幻觉（status: open|closed）。数字用 number。嵌套不要过深，模型更容易填平铺结构。',
      '中文内容和 JSON 混排时，系统提示写清"只输出 JSON，不要 Markdown 代码块"。若仍包 ```json，先剥再 parse。',
      '结构化输出解决的是解析，不解决真实性。字段填得再整齐，事实仍可能是编的——该检索还得检索。'
    ],
    notes: [
      'json_object 只保证是 JSON，不保证符合你的业务形状，能上 json_schema 就上。',
      'Pydantic 模型既可生成 schema 给 API，又可校验返回值，建议一条链路用到底。'
    ],
    example:
      'from pydantic import BaseModel, ValidationError\n\n' +
      'class WeatherAnswer(BaseModel):\n' +
      '    city: str\n' +
      '    temp_c: float\n' +
      '    summary: str\n\n' +
      'def parse_answer(text: str) -> WeatherAnswer:\n' +
      '    data = json.loads(text)\n' +
      '    return WeatherAnswer.model_validate(data)\n\n' +
      'try:\n' +
      '    ans = parse_answer(\'{"city":"北京","temp_c":25,"summary":"晴"}\')\n' +
      '    print(ans.summary)\n' +
      'except (json.JSONDecodeError, ValidationError) as e:\n' +
      '    print("让模型按错误信息重试", e)'
  },
  {
    id: 'agent-practice1',
    title: '12. 阶段练习：计算器 Agent',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: '用一个 calc 工具做一个会算数的 Agent：模型负责理解题意，Python 负责计算。',
    detail: [
      '需求：用户用自然语言问算术（"3 的 5 次方加 2 是多少"），禁止模型心算作为最终答案，必须调用 calc。这样你能亲眼看到工具循环。',
      '工具设计：calc(expression: str) 只接受数字和 + - * / ** () 。用正则白名单校验，拒绝 import、属性访问。这是安全习惯，不是小题大做。',
      '系统提示写明：任何算术都走 calc；用户闲聊则直接答；表达式看不懂就反问。步数上限 5。',
      '自测用例：① "12*8"；② "先算 2+3 再乘 4"（可能两次 calc 或一次表达式）；③ "北京天气怎样"（不应调 calc，或诚实说来不了）。',
      '加分：把每次 tool_calls 打印到控制台；给 calc 返回错误时看模型会不会改表达式；把 temperature 调到 1 对比是否更爱跳过工具。',
      '做完后你应能不看框架画出：messages 如何增长、assistant+tool 如何配对、循环何时结束。这是后面所有复杂 Agent 的底图。'
    ],
    notes: [
      '不要用 eval 裸跑用户字符串。示例用 ast 解析字面量表达式，或正则限制字符集。',
      '没有 API Key 时，可先写死一轮假的 tool_calls 把循环跑通，再接真模型。'
    ],
    example:
      'import ast, operator, re\n\n' +
      'OPS = {ast.Add: operator.add, ast.Sub: operator.sub,\n' +
      '       ast.Mult: operator.mul, ast.Div: operator.truediv,\n' +
      '       ast.Pow: operator.pow, ast.USub: operator.neg}\n\n' +
      'def calc(expression: str) -> str:\n' +
      '    if not re.fullmatch(r"[0-9+\\-*/(). **]+", expression.replace(" ", "")):\n' +
      '        return "错误：非法字符"\n' +
      '    def _eval(node):\n' +
      '        if isinstance(node, ast.Expression):\n' +
      '            return _eval(node.body)\n' +
      '        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):\n' +
      '            return node.value\n' +
      '        if isinstance(node, ast.BinOp) and type(node.op) in OPS:\n' +
      '            return OPS[type(node.op)](_eval(node.left), _eval(node.right))\n' +
      '        if isinstance(node, ast.UnaryOp) and type(node.op) in OPS:\n' +
      '            return OPS[type(node.op)](_eval(node.operand))\n' +
      '        raise ValueError("不支持的表达式")\n' +
      '    try:\n' +
      '        return str(_eval(ast.parse(expression, mode="eval")))\n' +
      '    except Exception as e:\n' +
      '        return f"错误：{e}"',
    example2Title: '工具声明（接入第 7 课循环）',
    example2:
      'TOOLS = [{\n' +
      '    "type": "function",\n' +
      '    "function": {\n' +
      '        "name": "calc",\n' +
      '        "description": "计算四则运算表达式。当问题涉及算术时必须调用。",\n' +
      '        "parameters": {\n' +
      '            "type": "object",\n' +
      '            "properties": {\n' +
      '                "expression": {"type": "string", "description": "如 2+3*4"}\n' +
      '            },\n' +
      '            "required": ["expression"],\n' +
      '        },\n' +
      '    },\n' +
      '}]\n' +
      'DISPATCH = {"calc": calc}'
  }
];
