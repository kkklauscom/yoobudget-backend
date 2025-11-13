# Expense API 文档

## 基础信息

- **Base URL**: `http://localhost:8000/api/expense`
- **认证方式**: JWT Bearer Token（所有 API 都需要认证）
- **Content-Type**: `application/json`

**请求头**:

```
Authorization: Bearer <token>
```

---

## API 列表

1. [创建支出](#1-创建支出)
2. [获取当前周期支出](#2-获取当前周期支出)
3. [获取所有支出](#3-获取所有支出)
4. [更新支出](#4-更新支出)
5. [删除支出](#5-删除支出)
6. [获取分类列表](#6-获取分类列表)

---

## 1. 创建支出

**POST** `/api/expense/add`

创建新的支出记录（支持一次性支出和循环支出）。

### 请求体

#### 一次性支出 (one-time)

```json
{
  "name": "Grocery Shopping",
  "amount": 150,
  "category": "Food",
  "note": "Weekly groceries",
  "spendFrom": "needs",
  "expenseType": "one-time",
  "createdAt": "2025-11-25"
}
```

#### 循环支出 (recurring)

```json
{
  "name": "Netflix Subscription",
  "amount": 15,
  "category": "Entertainment",
  "note": "Monthly subscription",
  "spendFrom": "wants",
  "expenseType": "recurring",
  "payCycle": "monthly",
  "nextPaymentDate": "2025-12-01"
}
```

### 字段说明

| 字段              | 类型   | 必填     | 说明                                                                 |
| ----------------- | ------ | -------- | -------------------------------------------------------------------- |
| `name`            | String | ✅       | 支出名称                                                             |
| `amount`          | Number | ✅       | 支出金额（必须 ≥ 0）                                                 |
| `category`        | String | ✅       | 支出分类                                                             |
| `note`            | String | ❌       | 备注（可选，默认空字符串）                                           |
| `spendFrom`       | String | ✅       | 支出来源：`"needs"`, `"wants"`, `"savings"`                          |
| `expenseType`     | String | ✅       | 支出类型：`"one-time"` 或 `"recurring"`                              |
| `payCycle`        | String | 条件必填 | 支付周期：`"weekly"`, `"biweekly"`, `"monthly"`（仅 recurring 需要） |
| `createdAt`       | Date   | 条件必填 | 创建日期（仅 one-time 需要，不提供则使用当前日期）                   |
| `nextPaymentDate` | Date   | 条件必填 | 下次支付日期（仅 recurring 需要）                                    |

### 成功响应 (201)

```json
{
  "success": true,
  "expense": {
    "_id": "67643685b45c2a23456789cd",
    "userId": "67643685b45c2a23412398b2",
    "name": "Grocery Shopping",
    "amount": 150,
    "category": "Food",
    "note": "Weekly groceries",
    "spendFrom": "needs",
    "expenseType": "one-time",
    "createdAt": "2025-11-25T00:00:00.000Z",
    "created": "2024-12-13T10:00:00.000Z",
    "updated": "2024-12-13T10:00:00.000Z"
  }
}
```

### 错误响应

- `400`: 必填字段缺失或验证失败
- `401`: 未授权（token 无效或过期）
- `500`: 服务器错误

---

## 2. 获取当前周期支出

**GET** `/api/expense/current-cycle`

获取当前预算周期内的所有支出。周期基于用户的主收入计算。

### 成功响应 (200)

```json
{
  "cycleStart": "2025-11-25T00:00:00.000Z",
  "cycleEnd": "2025-12-09T23:59:59.999Z",
  "expenses": [
    {
      "_id": "67643685b45c2a23456789cd",
      "userId": "67643685b45c2a23412398b2",
      "name": "Grocery Shopping",
      "amount": 150,
      "category": "Food",
      "note": "Weekly groceries",
      "spendFrom": "needs",
      "expenseType": "one-time",
      "createdAt": "2025-11-25T00:00:00.000Z",
      "created": "2024-12-13T10:00:00.000Z",
      "updated": "2024-12-13T10:00:00.000Z"
    },
    {
      "_id": "67643685b45c2a23456789ce",
      "userId": "67643685b45c2a23412398b2",
      "name": "Netflix Subscription",
      "amount": 15,
      "category": "Entertainment",
      "note": "Monthly subscription",
      "spendFrom": "wants",
      "expenseType": "recurring",
      "payCycle": "monthly",
      "nextPaymentDate": "2025-12-01T00:00:00.000Z",
      "created": "2024-12-13T09:00:00.000Z",
      "updated": "2024-12-13T09:00:00.000Z"
    }
  ]
}
```

### 字段说明

- `cycleStart`: 当前周期开始日期（主收入的 nextPayDate）
- `cycleEnd`: 当前周期结束日期
- `expenses`: 周期内的支出列表（按日期排序）

### 查询逻辑

- **一次性支出**: `createdAt >= cycleStart && createdAt < cycleEnd`
- **循环支出**: `nextPaymentDate >= cycleStart && nextPaymentDate < cycleEnd`

### 错误响应

- `400`: 没有主收入 (`{ error: "NO_MAIN_INCOME" }`)
- `401`: 未授权
- `500`: 服务器错误

---

## 3. 获取所有支出

**GET** `/api/expense/all`

获取当前用户的所有支出记录（包括一次性支出和循环支出），按创建时间倒序排列。

### 成功响应 (200)

```json
[
  {
    "_id": "67643685b45c2a23456789cd",
    "userId": "67643685b45c2a23412398b2",
    "name": "Grocery Shopping",
    "amount": 150,
    "category": "Food",
    "note": "Weekly groceries",
    "spendFrom": "needs",
    "expenseType": "one-time",
    "createdAt": "2025-11-25T00:00:00.000Z",
    "created": "2024-12-13T10:00:00.000Z",
    "updated": "2024-12-13T10:00:00.000Z"
  },
  {
    "_id": "67643685b45c2a23456789ce",
    "userId": "67643685b45c2a23412398b2",
    "name": "Netflix Subscription",
    "amount": 15,
    "category": "Entertainment",
    "note": "Monthly subscription",
    "spendFrom": "wants",
    "expenseType": "recurring",
    "payCycle": "monthly",
    "nextPaymentDate": "2025-12-01T00:00:00.000Z",
    "created": "2024-12-13T09:00:00.000Z",
    "updated": "2024-12-13T09:00:00.000Z"
  }
]
```

### 错误响应

- `401`: 未授权
- `500`: 服务器错误

---

## 4. 更新支出

**PUT** `/api/expense/:id/update`

更新指定的支出记录。

### 路径参数

- `id`: 支出记录 ID

### 请求体（所有字段可选）

```json
{
  "name": "Updated Expense Name",
  "amount": 200,
  "category": "Transport",
  "note": "Updated note",
  "spendFrom": "wants",
  "expenseType": "recurring",
  "payCycle": "biweekly",
  "nextPaymentDate": "2025-12-15"
}
```

### 字段说明

所有字段都是可选的，只更新提供的字段：

- `name`: 支出名称
- `amount`: 支出金额
- `category`: 支出分类
- `note`: 备注
- `spendFrom`: 支出来源（`"needs"`, `"wants"`, `"savings"`）
- `expenseType`: 支出类型（`"one-time"` 或 `"recurring"`）
- `payCycle`: 支付周期（仅 recurring，`"weekly"`, `"biweekly"`, `"monthly"`）
- `createdAt`: 创建日期（仅 one-time）
- `nextPaymentDate`: 下次支付日期（仅 recurring）

### 成功响应 (200)

```json
{
  "success": true,
  "expense": {
    "_id": "67643685b45c2a23456789cd",
    "userId": "67643685b45c2a23412398b2",
    "name": "Updated Expense Name",
    "amount": 200,
    "category": "Transport",
    "note": "Updated note",
    "spendFrom": "wants",
    "expenseType": "recurring",
    "payCycle": "biweekly",
    "nextPaymentDate": "2025-12-15T00:00:00.000Z",
    "created": "2024-12-13T10:00:00.000Z",
    "updated": "2024-12-13T11:00:00.000Z"
  }
}
```

### 错误响应

- `400`: 验证失败（如字段值无效）
- `401`: 未授权
- `404`: 支出不存在
- `500`: 服务器错误

---

## 5. 删除支出

**DELETE** `/api/expense/:id`

删除指定的支出记录。

### 路径参数

- `id`: 支出记录 ID

### 成功响应 (200)

```json
{
  "success": true,
  "message": "Expense deleted"
}
```

### 错误响应

- `401`: 未授权
- `404`: 支出不存在
- `500`: 服务器错误

---

## 6. 获取分类列表

**GET** `/api/expense/categories`

获取可用的支出分类列表。

### 成功响应 (200)

```json
[
  "Food",
  "Transport",
  "Housing",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Healthcare",
  "Education",
  "Gifts",
  "Travel"
]
```

### 错误响应

- `401`: 未授权
- `500`: 服务器错误

---

## 数据模型

### Expense 对象结构

```typescript
{
  _id: string;                    // MongoDB ID
  userId: string;                  // 用户 ID
  name: string;                    // 支出名称
  amount: number;                   // 金额（≥ 0）
  category: string;                 // 分类
  note: string;                    // 备注
  spendFrom: "needs" | "wants" | "savings";  // 支出来源
  expenseType: "one-time" | "recurring";      // 支出类型

  // 仅 recurring 支出
  payCycle?: "weekly" | "biweekly" | "monthly";
  nextPaymentDate?: Date;

  // 仅 one-time 支出
  createdAt?: Date;

  // 系统字段
  created: Date;                   // 记录创建时间
  updated: Date;                   // 记录更新时间
}
```

---

## 业务规则

### 一次性支出 (one-time)

- 需要 `createdAt` 字段
- 忽略 `payCycle` 和 `nextPaymentDate`
- 如果未提供 `createdAt`，使用当前日期

### 循环支出 (recurring)

- 需要 `payCycle` 和 `nextPaymentDate` 字段
- 忽略 `createdAt` 字段
- `payCycle` 必须是：`"weekly"`, `"biweekly"`, 或 `"monthly"`

### 周期计算

- 周期基于用户的主收入计算
- 使用 `/api/income/view-cycle` 的逻辑
- 如果没有主收入，`/api/expense/current-cycle` 会返回错误

### 查询规则

- **当前周期支出**:
  - 一次性支出：`createdAt` 在周期内
  - 循环支出：`nextPaymentDate` 在周期内

---

## 使用示例

### 完整流程

1. **创建一次性支出**

   ```bash
   POST /api/expense/add
   Authorization: Bearer <token>
   {
     "name": "Grocery Shopping",
     "amount": 150,
     "category": "Food",
     "spendFrom": "needs",
     "expenseType": "one-time",
     "createdAt": "2025-11-25"
   }
   ```

2. **创建循环支出**

   ```bash
   POST /api/expense/add
   Authorization: Bearer <token>
   {
     "name": "Netflix Subscription",
     "amount": 15,
     "category": "Entertainment",
     "spendFrom": "wants",
     "expenseType": "recurring",
     "payCycle": "monthly",
     "nextPaymentDate": "2025-12-01"
   }
   ```

3. **获取当前周期支出**

   ```bash
   GET /api/expense/current-cycle
   Authorization: Bearer <token>
   ```

4. **更新支出**

   ```bash
   PUT /api/expense/67643685b45c2a23456789cd/update
   Authorization: Bearer <token>
   {
     "amount": 200,
     "note": "Updated amount"
   }
   ```

5. **删除支出**
   ```bash
   DELETE /api/expense/67643685b45c2a23456789cd
   Authorization: Bearer <token>
   ```

---

## 错误处理

所有错误响应都遵循统一格式：

```json
{
  "error": "错误描述信息"
}
```

### 常见错误

- `"name, amount, category, spendFrom, and expenseType are required"` - 必填字段缺失
- `"spendFrom must be: needs, wants, or savings"` - spendFrom 值无效
- `"expenseType must be: one-time or recurring"` - expenseType 值无效
- `"payCycle is required for recurring expenses"` - 循环支出缺少 payCycle
- `"nextPaymentDate is required for recurring expenses"` - 循环支出缺少 nextPaymentDate
- `"NO_MAIN_INCOME"` - 用户没有主收入，无法计算周期

---

**最后更新**: 2024-12-13
