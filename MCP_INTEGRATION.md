# MCP 接入说明

本文说明“MCD w/Work｜麦麦在呢”实际使用的麦当劳 MCP Server、Tool、调用流程和业务价值。

## 1. MCP Server

| 项目 | 内容 |
|---|---|
| Server 名称 | 麦当劳中国 MCP Server |
| 地址 | `https://mcp.mcd.cn` |
| 协议 | Streamable HTTP |
| 鉴权 | `Authorization: Bearer <MCD_MCP_TOKEN>` |
| 使用地区 | 中国大陆 |
| 数据与价格 | 以麦当劳 MCP 实时返回及麦当劳官方渠道为准 |

Token 由用户自行在 [麦当劳 MCP 开放平台](https://open.mcd.cn/mcp) 申请。

仓库只提供脱敏配置示例 [mcp-config.example.json](./mcp-config.example.json)，不包含真实 Token：

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

## 2. 项目中的两个使用入口

### 2.1 WorkBuddy Skill

[SKILL.md](./SKILL.md) 是主要交互入口。用户直接使用自然语言提出点餐、营养、优惠、订单或工作节奏需求，Skill 根据实时工具 schema 选择最小调用链，并在写操作前取得明确确认。

### 2.2 本地关怀小结页面

[index.html](./index.html) 不直接访问 MCP，也不接收 Token。它只读取已经由 Skill 查询并按页面 JSON 契约整理后的脱敏数据，随后在浏览器本地完成：

- 有效订单筛选；
- 金额、餐品和重复餐品统计；
- 早餐、午餐、晚餐、深夜四个时段的次数与占比；
- 关怀文案；
- PNG 分享卡导出。

这样可以避免把个人 Token 放进公开网页，同时保证页面离线可用。

## 3. 实际使用的 MCP Tools

### 3.1 门店与时间

| Tool | 用途 |
|---|---|
| `now-time-info` | 获取 MCP 服务器时间，判断用餐时段、订单状态描述与自动化是否过期 |
| `query-nearby-stores` | 查询到店自取或得来速门店 |
| `delivery-query-addresses` | 查询用户已有的可配送地址 |
| `delivery-query-stores` | 按地址查询可配送门店 |
| `delivery-create-address` | 仅在用户明确要求时新增配送地址 |

### 3.2 菜单与营养

| Tool | 用途 |
|---|---|
| `query-meals` | 查询指定门店、指定业务场景下的可售餐品、编码和价格信息 |
| `query-meal-detail` | 查询套餐组成、默认搭配和可替换项 |
| `list-nutrition-foods` | 查询餐品能量、蛋白质、脂肪、碳水、钠、钙等营养信息 |

营养表与菜单名称可能无法一一对应。项目要求：无法可靠匹配时标注为未知或估算，不编造精确值。

### 3.3 优惠、活动与计价

| Tool | 用途 |
|---|---|
| `campaign-calendar` | 查询当月活动日历 |
| `available-coupons` | 查询当前可领取的券 |
| `query-my-coupons` | 查询用户卡包中的券 |
| `query-store-coupons` | 查询当前门店和订单场景下可用的券 |
| `query-promotions` | 查询企业团餐场景的满减、满折等活动 |
| `query-meal-assistance` | 查询企业团餐助餐服务 |
| `auto-bind-coupons` | 仅在用户明确要求“领券”时执行 |
| `calculate-price` | 用真实餐品、数量和优惠参数计算商品金额、配送费、优惠和应付总额 |

`available-coupons` 或 `query-my-coupons` 的结果不能直接视为当前订单可用。项目要求使用 `query-store-coupons`，并以 `calculate-price` 的实时结果作为最终价格依据。

### 3.4 订单

| Tool | 用途 |
|---|---|
| `create-order` | 在用户确认商品、门店、方式、价格和必要信息后创建订单，返回订单号与支付链接 |
| `query-order` | 查询指定订单状态、支付结果和配送进度 |
| `order-list` | 查询近期历史订单 |
| `cancel-order` | 仅在用户明确要求取消并给出订单号时执行 |

项目不自动支付、不自动取消、不重复创建订单。`create-order` 成功不代表已支付，页面或回复会把支付链接和当前状态如实展示。

## 4. 核心调用流程

### 4.1 到店自取推荐

```text
用户提出到店预算、位置和偏好
        ↓
now-time-info（需要判断餐段时）
        ↓
query-nearby-stores(beType=1, searchType=2)
        ↓
用户选择门店
        ↓
query-meals(storeCode, orderType=1, beType=1)
        ↓
query-meal-detail（需要看套餐或特调时）
        ↓
list-nutrition-foods（用户需要营养时）
        ↓
query-store-coupons → calculate-price
        ↓
展示方案、优惠来源、实付价与取舍，等待用户选择
```

到店自取不传 `beCode`。

### 4.2 麦乐送或得来速

```text
麦乐送：
delivery-query-addresses → delivery-query-stores → query-meals
→ query-store-coupons → calculate-price

得来速：
query-nearby-stores(beType=5) → query-meals(beCode)
→ query-store-coupons → calculate-price
```

外送和得来速必须使用门店返回的正确 `beCode`，项目不得自行猜测。

### 4.3 下单与跟踪

```text
展示门店、商品、数量、特调、优惠、地址摘要、应付价和预约时间
        ↓
用户明确确认
        ↓
create-order
        ↓
展示订单号与支付链接，不宣称已支付
        ↓
now-time-info → query-order
        ↓
仅在状态变化、支付待处理、异常或终态时提醒
        ↓
完成、取消、失败或退款终态后删除对应跟踪任务
```

### 4.4 关怀小结

```text
订单完成
        ↓
order-list / query-order 获取用户授权的订单
        ↓
排除取消、失败、退款订单
        ↓
整理为页面 JSON：订单状态、点餐时间、完成时间、实付金额、餐品和数量
        ↓
去除 Token、手机号、完整地址、支付凭证和完整订单号
        ↓
node scripts/embed-mcp-data.mjs <数据.json> --out <输出.html>
        ↓
打开生成的独立 HTML，本地重算统计并导出关怀卡
```

页面不会把示例数据自动当作真实订单。未传入 MCP 数据时显示内嵌虚构示例，并持续标注“交互演示 · 示例数据非实时”。

## 5. 页面 JSON 契约

真实数据经 Skill 整理后，页面使用以下字段。无法取得的字段必须省略或设为 `null`，不得补默认数据。

```json
{
  "schemaVersion": 1,
  "source": "mcp",
  "generatedAt": "2026-10-25T00:00:00+08:00",
  "currency": "CNY",
  "orders": [
    {
      "id": "脱敏订单标识",
      "createdAt": "2026-10-24T12:32:00+08:00",
      "completedAt": "2026-10-24T13:02:00+08:00",
      "status": "completed",
      "fulfillment": "pickup",
      "totalPaidCents": 4150,
      "discountCents": 500,
      "discountLabel": "优惠来源",
      "items": [
        {
          "name": "餐品名称",
          "quantity": 1,
          "unitPriceCents": 2450,
          "nutrition": null
        }
      ]
    }
  ]
}
```

字段说明：

- `source: "mcp"` 表示数据由用户授权的 MCP 查询结果转换而来，不构成平台验签。
- `createdAt` 是点餐时间，用于时段归类。
- `completedAt` 只用于展示，不参与时段统计。
- `totalPaidCents` 是实付金额，单位为分。
- 营养字段缺失时使用 `null`，页面显示覆盖率或隐藏统计。
- `id` 应为脱敏标识，不得保留完整订单号。

仓库中的 [care-summary.mcp.sample.json](./examples/care-summary.mcp.sample.json) 只演示数据结构，人物、订单和数值均为虚构，不是实际 MCP 查询结果。其 `source: "mcp"` 只用于验证字段契约，不代表已完成真实性核验。

## 6. 时段统计口径

页面固定使用北京时间 `Asia/Shanghai`，按订单的 `createdAt` 点餐时间归类：

| 时段 | 时间范围 |
|---|---|
| 早餐 | 05:00:00–10:29:59 |
| 午餐 | 10:30:00–15:59:59 |
| 晚餐 | 16:00:00–20:59:59 |
| 深夜 | 21:00:00–04:59:59 |

四个区间覆盖完整 24 小时，不重叠。

统计规则：

1. 只统计状态为 `completed` 的有效订单。
2. 占比分母为所选订单中“点餐时间可识别”的订单数。
3. 点餐时间缺失的记录不参与时段占比，但仍可计入金额和餐品统计。
4. `completedAt` 不参与时段归类。
5. 不根据时段推断加班、职业、情绪、健康或生活习惯。
6. 订单样本默认最近 5 笔，所有金额与占比必须标注样本口径。

## 7. 写操作与授权边界

| 操作 | 约束 |
|---|---|
| 领券 | 只有用户明确要求时才调用 `auto-bind-coupons` |
| 新建地址 | 只有用户明确要求且主动提供地址信息时才调用 |
| 创建订单 | 展示完整订单摘要并取得明确确认后调用 |
| 取消订单 | 只有用户明确要求并给出订单号时调用 |
| 支付 | 不由 Agent 自动完成；用户通过返回的支付链接或麦当劳官方渠道支付 |
| 定时跟踪 | 订单建立后可创建独立查询任务；终态后删除对应任务 |
| 记忆偏好 | 只在用户明确允许时长期保存，并支持修改或遗忘 |

## 8. 错误处理

- `401`：Token 无效、过期或未提供。停止依赖授权的请求，提示检查本地配置，不要求用户在公开对话中粘贴 Token。
- `429`：超过限流。立即停止非必要查询和试算，保留上下文，等待窗口恢复，不并发补发。
- 其他错误：保留接口返回的关键错误信息，修复参数或前置条件；有限重试，不形成循环。
- 查询失败不得解释为“没有门店”“没有优惠”或“订单失败”。

## 9. 业务价值

### 对用户

- 降低“吃什么、怎么点、有没有更合适方案”的决策负担。
- 通过真实价格、优惠和营养信息减少误判，同时保留用户最终选择权。
- 订单完成后留下可回看的关怀记录，而不是只形成一笔消费。
- 用克制、不评判的交互减少被工具催促和规训的压力。

### 对麦当劳 MCP 能力的使用深度

本项目不只使用单一菜单查询，而是组合门店、菜单、营养、活动、优惠、计价、下单和订单状态等多类工具，覆盖从“工作中想起吃饭”到“订单完成后的记录”全过程。

页面进一步把订单数据转换成可保存的关怀小结，展示 MCP 数据在点餐之外的个性化价值，同时明确数据边界，不把订单推断成健康或人格结论。

## 10. 验证记录与边界

### 已完成的只读验证

验证时间均为北京时间：

| 时间 | Tool | 调用范围 | 结果 |
|---|---|---|---|
| 2026-10-25 00:06:54 | `now-time-info` | 无参数 | 成功返回服务器时间与时区 |
| 2026-10-25 00:06:54 | `query-nearby-stores` | 深圳市、科技园、到店自取 | 成功返回门店列表 |
| 2026-10-25 00:07:03 | `query-meals` | 营业中门店、到店自取 | 成功返回菜品分类与餐品信息 |

以上验证不包含用户账号数据，不包含下单、支付、领券或历史订单查询。

### 尚未在仓库内完成

- 使用真实个人账号执行完整 `create-order` 流程。
- 使用真实订单验证页面嵌入与 PNG 导出。
- 对全部优惠、团餐、预约和异常分支逐项联调。
- 仓库不保存任何真实 MCP 响应，因此不以演示数据代替真实验证结论。

使用前请按本文流程在自己的 WorkBuddy 和 MCP 账号中完成实际验证，并遵守麦当劳 MCP 服务规则与使用条款。
