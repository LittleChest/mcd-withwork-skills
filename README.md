# MCD w/Work｜麦麦在呢

> 一个会记得，也懂得不打扰的麦当劳点餐伙伴。

“麦麦在呢”是基于麦当劳中国官方 MCP 的 WorkBuddy Skill。它不只回答“吃什么”，还会在连续工作时留意合适的用餐与休息节奏；点餐时先尊重用户当下想要的感受，再提供真实价格、优惠和营养信息；订单完成后，把这一餐整理成一张不评判选择、不乱下结论的关怀小结。

本项目是 2026 年麦当劳程序员创意开发大赛参赛作品，由参赛者独立开发，非麦当劳官方产品。

## 为什么做这个项目

很多点餐工具把目标默认写成“更低价格、更低热量、更高蛋白”，但真实的一餐不总是优化题。用户可能只是想在忙碌里吃一点熟悉的、热的东西，也可能明确说“现在不想做选择”。

“麦麦在呢”把关怀拆成三个具体原则：

1. 提供资料，不替用户评判食物或生活方式。
2. 允许用户不做“最优选择”，尊重拒绝和沉默。
3. 每条观察都必须有真实数据依据；不知道时就说不确定。

## 主要能力

- 按工作节奏提供克制的用餐询问和休息提醒，不连续追问。
- 查询附近门店、菜单、套餐详情与营养信息。
- 查询活动、可领券、卡包券和当前门店可用优惠。
- 使用真实商品与优惠参数试算价格，展示优惠和应付金额。
- 在用户明确确认后创建订单，不自动支付或重复下单。
- 订单完成后查询状态，并可生成独立、可分享的“关怀小结”页面。
- 关怀小结按点餐时间区分早餐、午餐、晚餐和深夜，展示次数和占比，不使用健康分、自律分或连续打卡。

## 目标用户

- 长时间写代码或处理办公任务、容易忘记吃饭的用户。
- 不喜欢被热量、价格或“自律”话术评判的用户。
- 想看清一餐真实价格、优惠和营养信息，但希望保留最终选择权的用户。
- 需要到店、麦乐送、得来速或企业团餐等不同点餐方式的用户。

## 快速开始

### 1. 申请麦当劳 MCP Token

访问 [麦当劳 MCP 开放平台](https://open.mcd.cn/mcp)，使用手机号登录，在控制台激活并复制 Token。

Token 只应保存在自己的本地客户端中，不要提交到仓库、聊天记录或公开页面。

### 2. 在 WorkBuddy 配置 MCP

打开 WorkBuddy，在左侧【专家·技能·连接器】中选择【连接器】，进入【自定义连接器】→【配置 MCP】。

以 [mcp-config.example.json](./mcp-config.example.json) 为模板：

```json
{
  "mcpServers": {
    "mcd-mcp": {
      "type": "streamablehttp",
      "url": "https://mcp.mcd.cn",
      "headers": {
        "Authorization": "Bearer ${MCD_MCP_TOKEN}"
      }
    }
  }
}
```

将 `${MCD_MCP_TOKEN}` 在本地替换为自己的 Token 后保存，并启用 `mcd-mcp`。仓库中的示例文件只保留环境变量占位符。

### 3. 安装 Skill

方式一：在 WorkBuddy 的【技能】中选择【添加技能】→【上传技能】，上传本仓库目录。

方式二：将仓库放入用户级技能目录：

```bash
git clone https://github.com/LittleChest/mcd-withwork-skills.git
mkdir -p ~/.workbuddy/skills
cp -R mcd-withwork-skills ~/.workbuddy/skills/
```

安装后确认技能入口为：

```text
~/.workbuddy/skills/mcd-withwork-skills/SKILL.md
```

### 4. 直接体验关怀小结

`index.html` 内嵌完全虚构的示例数据，不配置 Token 也能打开：

```bash
# 直接双击 index.html，或启动本地静态服务
python3 -m http.server 8000
# 浏览器打开 http://localhost:8000/
```

页面支持：

- 查看“这一餐”和“最近小结”。
- 查看早餐、午餐、晚餐、深夜的点餐时段分布。
- 载入本地关怀小结 JSON。
- 将当前卡片保存为 PNG。

所有演示餐品、价格和营养数据均为虚构示例，仅用于展示页面交互，不代表任何真实门店或订单。

## 使用示例

到店自取：

```text
我在深圳科技园，想走到店自取。预算 35 元，不想吃太撑，帮我看看现在有什么合适的。
```

优惠与价格：

```text
先别下单。帮我把这两份方案按当前门店可用券算一遍，告诉我实付价和优惠来源。
```

订单跟踪：

```text
订单已创建，帮我关注状态，有变化再提醒我。
```

关怀小结：

```text
把最近几笔已完成订单整理成关怀小结，按点餐时间看看我常在什么时候吃饭。
```

## 真实 MCP 数据如何进入页面

Skill 通过麦当劳 MCP 的 `order-list`、`query-order` 等工具读取用户授权的数据，再整理为页面使用的脱敏 JSON。将数据嵌入页面前必须移除 Token、手机号、完整地址、支付凭证和完整订单号等敏感信息。

```bash
node scripts/embed-mcp-data.mjs <脱敏数据.json> --out <输出.html>
node scripts/embed-mcp-data.mjs <脱敏数据.json> --out <输出.html> --check
```

生成的真实订单页面默认不覆盖已有文件，适合本地查看或按需分享。不要把含个人订单数据的生成页提交到公开仓库。

`index.html` 始终保留虚构示例，作为无 Token 演示和 UI 测试入口。

## 当前验证状态

- 2026-10-25 00:06:54（北京时间），已通过 WorkBuddy 调用 `now-time-info`，返回成功。
- 同日 00:06:54，已调用 `query-nearby-stores`，以“深圳市 / 科技园 / 到店自取”查询并成功返回门店列表。
- 同日 00:07:03，已调用 `query-meals` 查询深圳一家营业中门店的到店菜单，返回分类与餐品信息。
- 上述验证只读，不涉及下单、支付、领券或用户历史订单。
- 仓库不包含真实 MCP 返回、真实订单或真实 Token；订单创建、支付与真实订单小结需使用各自账号在实际环境中验证。

更完整的工具、调用链和字段说明见 [MCP_INTEGRATION.md](./MCP_INTEGRATION.md)。

## 项目结构

```text
.
├── README.md
├── CONTEST_DECLARATION.md       # 官方参赛声明，请勿修改
├── MCP_INTEGRATION.md           # MCP Server、Tool、调用链与业务价值
├── mcp-config.example.json      # 脱敏 MCP 配置，仅环境变量占位符
├── workbuddy.md                 # WorkBuddy 开发对话记录（脱敏整理）
├── SKILL.md                     # WorkBuddy Skill 入口
├── index.html                   # 零依赖关怀小结页面
├── docs/MCP.md                  # 项目使用的官方 MCP 参考资料
├── examples/
│   ├── care-summary.demo.json       # 虚构演示数据
│   └── care-summary.mcp.sample.json # 页面数据结构示例，不是真实订单
└── scripts/
    ├── embed-demo.mjs           # 同步演示数据到 index.html
    └── embed-mcp-data.mjs       # 脱敏校验、嵌入真实数据并生成独立页面
```

## 开发检查

要求 Node.js 18 或以上。页面本身不依赖 Node.js。

```bash
# 示例 JSON 与 index.html 内嵌数据一致
node scripts/embed-demo.mjs --check

# 校验 JSON 与页面脚本语法
node --check scripts/embed-demo.mjs
node --check scripts/embed-mcp-data.mjs
```

## 数据与隐私

- 本项目不收集、不存储、不上传用户 Token、订单、地址或手机号。
- 页面所有统计在浏览器本地完成。
- 用户必须使用自己的麦当劳 MCP Token，并自行决定是否授权读取订单。
- 真实订单页面的生成、保存和分享由用户主动完成。
- 页面只展示接口实际返回的数据，不编造价格、营养、配送位置或订单状态。

## 边界

- 餐品、价格、优惠和供应状态以麦当劳官方渠道及 MCP 实时结果为准。
- 营养信息仅用于帮助理解餐品，不构成医疗、营养或治疗建议。
- 不根据点餐时间推断加班、职业、健康、情绪、收入或生活习惯。
- 关怀小结反映所选订单样本，不代表月度或年度总消费。
- 本项目不是麦当劳官方产品，也不代表麦当劳官方立场。

## WorkBuddy 开发记录

本项目的 Skill 规则、页面、文档与验证过程使用 WorkBuddy 协作完成。脱敏后的开发上下文见 [workbuddy.md](./workbuddy.md)，其中不包含 Token、个人订单或账号信息。

## License

代码以 [AGPL-3.0](./LICENSE) 发布。麦当劳及相关商标、餐品图片与接口内容归其各自权利人所有，本项目不授予任何商标使用权。
