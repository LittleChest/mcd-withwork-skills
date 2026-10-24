# 介绍

**什么是麦当劳 MCP 服务?**
- 麦当劳 MCP 服务是一个遵循 Model Context Protocol（MCP）标准的数据交互接口服务，由麦当劳中国提供，面向中国大陆地区（不含港澳台）使用。
- 麦当劳MCP服务现已覆盖麦乐送点餐、到店取餐、团餐、积分兑换券、活动日历查询等业务场景。更多实用工具正在持续开发上线。

## 1. 注意事项：
> - 每个 Token 每分钟最多允许 600 次请求，超过限制会返回 429 错误码，请合理控制请求频率。
> - 请确保 MCP Client 支持 Streamable HTTP 协议。
> - 请妥善保管 MCP Token，避免泄露给他人。

## 2. 错误码说明

| code | 原因 | 处理建议 |
|:----:|:----:|:---------|
| 401 | MCP Token 无效、已过期或未提供 | 检查 Authorization 请求头和 MCP Token 配置 |
| 429 | 触发限流（超过 600 次/分钟） | 降低请求频率，合理控制调用间隔 |

# 3. 工具列表
> MCP Server 目前所支持的 Tools

<table>
  <thead>
    <tr>
      <th style="white-space: nowrap; text-align: center;"><strong>Tool</strong></th>
      <th style="min-width: 100px;"><strong>Name</strong></th>
      <th><strong>Description</strong></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="white-space: nowrap; text-align: center;">list-nutrition-foods</td>
      <td>餐品营养信息列表</td>
      <td>获取麦当劳常见餐品的营养成分数据，包括能量、蛋白质、脂肪、碳水化合物、钠、钙等信息。当用户咨询麦当劳餐品的热量、营养，或需要帮助用户搭配指定热量套餐时使用此工具</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">delivery-query-addresses</td>
      <td>获取用户可配送地址列表</td>
      <td>查询用户已创建的配送地址列表，用于外送点餐时选择配送地址</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">delivery-create-address</td>
      <td>新增配送地址</td>
      <td>当用户无可配送地址或需新增收货地址时使用，用于创建新的可配送地址</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">delivery-query-stores</td>
      <td>查询可配送的门店列表</td>
      <td>外送场景下查询用户收货地址附近可配送门店</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">query-meal-assistance</td>
      <td>查询助餐服务</td>
      <td>仅企业团餐场景下，查询该门店支持的助餐服务</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">query-nearby-stores</td>
      <td>查询附近可用门店</td>
      <td>查询用户提供地址附近的麦当劳餐厅</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">query-store-coupons</td>
      <td>查询用户当前门店下可用的优惠券列表</td>
      <td>查询用户在当前门店下可使用的优惠券列表，用于点餐时选择可用优惠</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">query-meals</td>
      <td>查询当前可售卖的餐品列表</td>
      <td>查询当前门店可售卖的餐品菜单（分类、餐品编码、标签等），用于点餐选品</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">query-meal-detail</td>
      <td>查询餐品详情</td>
      <td>根据餐品编码查询餐品详情套餐组成，用于查看套餐包含内容以及可以替换选项</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">calculate-price</td>
      <td>商品价格计算</td>
      <td>根据用户选购商品列表（可含优惠券）计算商品金额、配送费、优惠金额及应付总价</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">create-order</td>
      <td>创建订单</td>
      <td>根据门店信息、就餐方式、商品列表等信息创建订单，返回订单详情与支付链接</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">cancel-order</td>
      <td>取消订单</td>
      <td>取消点餐订单。当用户说&quot;取消订单&quot;、&quot;我要取消&quot;、&quot;帮我取消一下订单&quot;时，可使用该工具进行取消</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">query-order</td>
      <td>查询订单详情</td>
      <td>查询订单状态、订单内容、配送信息等，用于用户查看订单进度或确认订单信息</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">order-list</td>
      <td>查询历史订单</td>
      <td>查询近期的到店/外送历史订单（非商城订单，商城订单请使用 mall-order-list）</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">campaign-calendar</td>
      <td>活动日历查询工具</td>
      <td>查询麦当劳中国当月的营销活动日历，返回进行中、往期和未来日期的活动</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">available-coupons</td>
      <td>麦麦省券列表查询</td>
      <td>查询用户当前可领取的麦麦省的优惠券列表</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">auto-bind-coupons</td>
      <td>麦麦省一键领券</td>
      <td>自动领取麦麦省所有当前可用的麦当劳优惠券。无需指定具体的优惠券和couponId，系统会自动领取用户可领的所有券</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">query-my-coupons</td>
      <td>我的优惠券查询</td>
      <td>查询用户有哪些可用的优惠券。支持用户查看账户下所有优惠券列表</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">query-my-account</td>
      <td>我的积分查询</td>
      <td>查询用户积分账户信息，包括可用积分、累计积分、冻结积分、即将过期积分等</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">mall-points-products</td>
      <td>查询麦麦商城商品列表</td>
      <td>查询麦麦商城内可使用积分兑换或现金购买的商品（不包括使用积分兑换的第三方兑换码）</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">mall-product-detail</td>
      <td>查询麦麦商城商品详情</td>
      <td>查询商城商品详细信息（图片、积分、有效期、说明、详情等）</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">mall-create-order</td>
      <td>积分兑换商品下单</td>
      <td>使用积分兑换虚拟或实物商品，完成积分校验、积分扣减及发券或实物库存扣减，返回兑换订单号和券码信息</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">now-time-info</td>
      <td>获取当前时间信息</td>
      <td>返回当前的完整时间信息，以便于 LLM 知道当前的时间和日期</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">query-lottery-info</td>
      <td>查看积分抽奖活动信息</td>
      <td>查询当前积分抽奖活动的基本信息，包括活动状态、奖品列表、抽奖消耗规则和用户可用资源</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">draw-lottery</td>
      <td>积分抽奖</td>
      <td>执行一次积分抽奖，消耗积分或次数，返回是否中奖及奖品信息</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">query-my-prizes</td>
      <td>查看我的奖品</td>
      <td>查询用户在积分抽奖活动中获得的全部奖品记录，支持分页，按中奖时间倒序排列</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">mall-order-list</td>
      <td>麦麦商城订单查询</td>
      <td>查询麦麦商城内近一年购买或兑换的商品订单列表</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">mall-order-detail</td>
      <td>麦麦商城订单详情查询</td>
      <td>查询麦麦商城订单的详细信息，包括支付积分、支付金额和订单状态等</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">query-party-city</td>
      <td>主题活动城市列表查询</td>
      <td>查询主题活动商品对应的可参与城市列表</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">query-party-store</td>
      <td>主题活动门店列表查询</td>
      <td>查询指定城市下主题活动可参与的门店列表</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">query-partystore-date</td>
      <td>主题活动可预约日期查询</td>
      <td>查询指定门店下主题活动的可预约日期列表</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">query-partystore-session</td>
      <td>主题活动可预约日期场次查询</td>
      <td>查询指定门店、指定日期下主题活动的可预约场次列表</td>
    </tr>
    <tr>
      <td style="white-space: nowrap; text-align: center;">party-order-create</td>
      <td>主题活动订单创建</td>
      <td>创建主题活动订单，当用户选择好城市、门店、日期、场次后使用此工具下单</td>
    </tr>
  </tbody>
</table>

# 5. 注意事项：

- 允许个人以非商业用途复制并使用本仓库中的示例配置、参数、JSON 或示例代码，并仅限用于实现与麦当劳MCP服务的连接与使用。

- 使用 麦当劳MCP 服务须遵守麦当劳中国的《使用条款》及《麦当劳MCP 服务规则》，并在申请MCP Token时同意前述条款。

- 未经书面授权，不得将本仓库内容用于商业售卖、付费分发、引流变现或任何暗示官方背书、误导公众的用途；亦不得用于任何违法、违规或黑灰产相关行为。

- 本仓库内容按“现状”提供，不构成任何形式的保证或承诺。

- 本仓库不构成对麦当劳及其关联方商标的任何授权。

- 请妥善保管您的MCP Token，避免泄露或被他人使用。

<p align="center">© 2026 McDonald’s. All Rights Reserved.</p>
