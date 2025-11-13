# Yoobudget Backend API 文档

## 基础信息

- **Base URL**: `http://localhost:8000/api`
- **认证方式**: JWT Bearer Token
- **Content-Type**: `application/json`

---

## 目录

1. [认证 API](#认证-api)
2. [用户 API](#用户-api)
3. [收入 API](#收入-api)
4. [错误响应](#错误响应)

---

## 认证 API

### 1. 用户注册

**POST** `/api/auth/register`

创建新用户账户。

**请求体**:

```json
{
  "email": "test@example.com",
  "password": "12345678",
  "name": "John Doe",
  "budgetRatio": {
    "needs": 50,
    "wants": 30,
    "savings": 20
  },
  "viewCycle": "monthly",
  "currentSavings": 0,
  "weekDay": null,
  "fortnightStartDay": null,
  "monthDate": 15
}
```

**字段说明**:

- `email` (必填): 用户邮箱，必须唯一
- `password` (必填): 密码
- `name` (必填): 用户姓名
- `budgetRatio` (可选): 预算比例，默认 `{ needs: 50, wants: 30, savings: 20 }`
- `viewCycle` (可选): 视图周期，可选值: `"weekly"`, `"fortnightly"`, `"monthly"`，默认 `"monthly"`
- `currentSavings` (可选): 当前储蓄金额，默认 `0`
- `weekDay` (条件必填): 当 `viewCycle="weekly"` 时必填，范围 0-6 (0=周日, 6=周六)
- `fortnightStartDay` (条件必填): 当 `viewCycle="fortnightly"` 时必填，范围 0-6
- `monthDate` (条件必填): 当 `viewCycle="monthly"` 时必填，范围 1-28

**成功响应** (201):

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "67643685b45c2a23412398b2",
    "email": "test@example.com",
    "name": "John Doe",
    "budgetRatio": {
      "needs": 50,
      "wants": 30,
      "savings": 20
    },
    "currentSavings": 0,
    "viewCycle": "monthly",
    "weekDay": null,
    "fortnightStartDay": null,
    "monthDate": 15,
    "createdAt": "2024-12-13T10:00:00.000Z",
    "updatedAt": "2024-12-13T10:00:00.000Z"
  }
}
```

**错误响应**:

- `400`: 邮箱已存在或验证失败
- `500`: 服务器错误

---

### 2. 用户登录

**POST** `/api/auth/login`

用户登录获取 JWT token。

**请求体**:

```json
{
  "email": "test@example.com",
  "password": "12345678"
}
```

**成功响应** (200):

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "67643685b45c2a23412398b2",
    "email": "test@example.com",
    "name": "John Doe",
    "budgetRatio": {
      "needs": 50,
      "wants": 30,
      "savings": 20
    },
    "currentSavings": 0,
    "viewCycle": "monthly",
    "weekDay": null,
    "fortnightStartDay": null,
    "monthDate": 15,
    "createdAt": "2024-12-13T10:00:00.000Z",
    "updatedAt": "2024-12-13T10:00:00.000Z"
  }
}
```

**错误响应**:

- `400`: 邮箱和密码必填
- `401`: 用户不存在或密码错误
- `500`: 服务器错误

---

## 用户 API

所有用户 API 都需要 JWT 认证。

**请求头**:

```
Authorization: Bearer <token>
```

---

### 3. 获取当前用户信息

**GET** `/api/users/me`

获取当前登录用户的详细信息。

**成功响应** (200):

```json
{
  "_id": "67643685b45c2a23412398b2",
  "email": "test@example.com",
  "name": "John Doe",
  "budgetRatio": {
    "needs": 50,
    "wants": 30,
    "savings": 20
  },
  "currentSavings": 0,
  "viewCycle": "monthly",
  "weekDay": null,
  "fortnightStartDay": null,
  "monthDate": 15,
  "createdAt": "2024-12-13T10:00:00.000Z",
  "updatedAt": "2024-12-13T10:00:00.000Z"
}
```

**错误响应**:

- `401`: 未授权（token 无效或过期）
- `404`: 用户不存在
- `500`: 服务器错误

---

### 4. 更新用户设置

**PATCH** `/api/users/me`

更新当前用户的设置信息。

**请求体** (所有字段可选):

```json
{
  "name": "Jane Doe",
  "budgetRatio": {
    "needs": 40,
    "wants": 40,
    "savings": 20
  },
  "viewCycle": "weekly",
  "weekDay": 1,
  "fortnightStartDay": null,
  "monthDate": null
}
```

**字段说明**:

- `name`: 用户姓名
- `budgetRatio`: 预算比例对象
- `viewCycle`: 视图周期，可选值: `"weekly"`, `"fortnightly"`, `"monthly"`
- `weekDay`: 当 `viewCycle="weekly"` 时必填，范围 0-6
- `fortnightStartDay`: 当 `viewCycle="fortnightly"` 时必填，范围 0-6
- `monthDate`: 当 `viewCycle="monthly"` 时必填，范围 1-28

**成功响应** (200):

```json
{
  "_id": "67643685b45c2a23412398b2",
  "email": "test@example.com",
  "name": "Jane Doe",
  "budgetRatio": {
    "needs": 40,
    "wants": 40,
    "savings": 20
  },
  "currentSavings": 0,
  "viewCycle": "weekly",
  "weekDay": 1,
  "fortnightStartDay": null,
  "monthDate": null,
  "createdAt": "2024-12-13T10:00:00.000Z",
  "updatedAt": "2024-12-13T11:00:00.000Z"
}
```

**错误响应**:

- `400`: 验证失败（如 viewCycle 和对应字段不匹配）
- `401`: 未授权
- `404`: 用户不存在
- `500`: 服务器错误

---

## 收入 API

所有收入 API 都需要 JWT 认证。

**请求头**:

```
Authorization: Bearer <token>
```

---

### 5. 创建收入

**POST** `/api/income`

创建新的收入记录。

**请求体**:

```json
{
  "name": "Main Job",
  "amount": 2000,
  "payCycle": "biweekly",
  "nextPayDate": "2025-11-25",
  "isMain": true
}
```

**字段说明**:

- `name` (可选): 收入名称，默认 `"Income"`
- `amount` (必填): 收入金额
- `payCycle` (必填): 支付周期，可选值: `"weekly"`, `"biweekly"`, `"monthly"`, `"one-time"`
- `nextPayDate` (必填): 下次支付日期 (ISO 8601 格式)
- `isMain` (可选): 是否为主收入，默认 `false`

**注意**: 如果 `isMain=true`，系统会自动将用户的其他收入设为非主收入。

**成功响应** (201):

```json
{
  "_id": "67643685b45c2a23456789ab",
  "userId": "67643685b45c2a23412398b2",
  "name": "Main Job",
  "amount": 2000,
  "payCycle": "biweekly",
  "nextPayDate": "2025-11-25T00:00:00.000Z",
  "isMain": true,
  "createdAt": "2024-12-13T10:00:00.000Z",
  "updatedAt": "2024-12-13T10:00:00.000Z"
}
```

**错误响应**:

- `400`: 必填字段缺失或验证失败
- `401`: 未授权
- `500`: 服务器错误

---

### 6. 获取所有收入

**GET** `/api/income`

获取当前用户的所有收入记录，按创建时间倒序排列。

**成功响应** (200):

```json
[
  {
    "_id": "67643685b45c2a23456789ab",
    "userId": "67643685b45c2a23412398b2",
    "name": "Main Job",
    "amount": 2000,
    "payCycle": "biweekly",
    "nextPayDate": "2025-11-25T00:00:00.000Z",
    "isMain": true,
    "createdAt": "2024-12-13T10:00:00.000Z",
    "updatedAt": "2024-12-13T10:00:00.000Z"
  },
  {
    "_id": "67643685b45c2a23456789ac",
    "userId": "67643685b45c2a23412398b2",
    "name": "Side Gig",
    "amount": 500,
    "payCycle": "monthly",
    "nextPayDate": "2025-12-01T00:00:00.000Z",
    "isMain": false,
    "createdAt": "2024-12-13T09:00:00.000Z",
    "updatedAt": "2024-12-13T09:00:00.000Z"
  }
]
```

**错误响应**:

- `401`: 未授权
- `500`: 服务器错误

---

### 7. 获取主收入

**GET** `/api/income/main`

获取当前用户的主收入记录。

**成功响应** (200):

```json
{
  "mainIncome": {
    "_id": "67643685b45c2a23456789ab",
    "userId": "67643685b45c2a23412398b2",
    "name": "Main Job",
    "amount": 2000,
    "payCycle": "biweekly",
    "nextPayDate": "2025-11-25T00:00:00.000Z",
    "isMain": true,
    "createdAt": "2024-12-13T10:00:00.000Z",
    "updatedAt": "2024-12-13T10:00:00.000Z"
  }
}
```

**如果没有主收入** (200):

```json
{
  "mainIncome": null
}
```

**错误响应**:

- `401`: 未授权
- `500`: 服务器错误

---

### 8. 设置主收入

**POST** `/api/income/set-main/:id`

将指定的收入设置为主收入。系统会自动将用户的其他收入设为非主收入。

**路径参数**:

- `id`: 收入记录 ID

**成功响应** (200):

```json
{
  "_id": "67643685b45c2a23456789ab",
  "userId": "67643685b45c2a23412398b2",
  "name": "Main Job",
  "amount": 2000,
  "payCycle": "biweekly",
  "nextPayDate": "2025-11-25T00:00:00.000Z",
  "isMain": true,
  "createdAt": "2024-12-13T10:00:00.000Z",
  "updatedAt": "2024-12-13T10:00:00.000Z"
}
```

**错误响应**:

- `401`: 未授权
- `404`: 收入不存在
- `500`: 服务器错误

---

### 9. 获取视图周期

**GET** `/api/income/view-cycle`

获取基于主收入的当前预算周期信息。这是应用的核心 API，用于计算预算周期、剩余天数和总收入。

**成功响应** (200):

```json
{
  "cycleStart": "2025-11-25T00:00:00.000Z",
  "cycleEnd": "2025-12-09T23:59:59.999Z",
  "payCycle": "biweekly",
  "remainingDays": 10,
  "totalIncome": 4000
}
```

**字段说明**:

- `cycleStart`: 当前周期开始日期（主收入的 nextPayDate）
- `cycleEnd`: 当前周期结束日期
  - `weekly`: cycleStart + 7 天
  - `biweekly`: cycleStart + 14 天
  - `monthly`: cycleStart + 1 个月
- `payCycle`: 主收入的支付周期
- `remainingDays`: 距离周期结束的剩余天数（可能为负数）
- `totalIncome`: 周期内的总收入（包括所有收入在周期内的出现次数）

**错误响应**:

- `400`: 没有主收入 (`{ error: "NO_MAIN_INCOME" }`) 或主收入为 one-time 类型
- `401`: 未授权
- `500`: 服务器错误

---

### 10. 更新收入

**PUT** `/api/income/:id`

更新指定的收入记录。

**路径参数**:

- `id`: 收入记录 ID

**请求体** (所有字段可选):

```json
{
  "name": "Updated Job Name",
  "amount": 2500,
  "payCycle": "monthly",
  "nextPayDate": "2025-12-01",
  "isMain": false
}
```

**注意**: 如果 `isMain=true`，系统会自动将用户的其他收入设为非主收入。

**成功响应** (200):

```json
{
  "_id": "67643685b45c2a23456789ab",
  "userId": "67643685b45c2a23412398b2",
  "name": "Updated Job Name",
  "amount": 2500,
  "payCycle": "monthly",
  "nextPayDate": "2025-12-01T00:00:00.000Z",
  "isMain": false,
  "createdAt": "2024-12-13T10:00:00.000Z",
  "updatedAt": "2024-12-13T11:00:00.000Z"
}
```

**错误响应**:

- `400`: 验证失败
- `401`: 未授权
- `404`: 收入不存在
- `500`: 服务器错误

---

### 11. 删除收入

**DELETE** `/api/income/:id`

删除指定的收入记录。

**路径参数**:

- `id`: 收入记录 ID

**成功响应** (200):

```json
{
  "message": "Income deleted"
}
```

**错误响应**:

- `401`: 未授权
- `404`: 收入不存在
- `500`: 服务器错误

---

## 错误响应

所有 API 在发生错误时都会返回统一的错误格式：

```json
{
  "error": "错误描述信息"
}
```

### 常见 HTTP 状态码

- `200`: 请求成功
- `201`: 创建成功
- `400`: 请求参数错误或验证失败
- `401`: 未授权（token 无效、过期或缺失）
- `404`: 资源不存在
- `500`: 服务器内部错误

### 认证错误

当 JWT token 无效或过期时，所有需要认证的 API 会返回：

```json
{
  "error": "Invalid token"
}
```

或

```json
{
  "error": "Token expired"
}
```

---

## 使用示例

### 完整的用户流程

1. **注册用户**

   ```bash
   POST /api/auth/register
   ```

2. **登录获取 Token**

   ```bash
   POST /api/auth/login
   ```

3. **创建主收入**

   ```bash
   POST /api/income
   Authorization: Bearer <token>
   {
     "name": "Main Job",
     "amount": 2000,
     "payCycle": "biweekly",
     "nextPayDate": "2025-11-25",
     "isMain": true
   }
   ```

4. **获取预算周期信息**

   ```bash
   GET /api/income/view-cycle
   Authorization: Bearer <token>
   ```

5. **更新用户设置**
   ```bash
   PATCH /api/users/me
   Authorization: Bearer <token>
   {
     "viewCycle": "weekly",
     "weekDay": 1
   }
   ```

---

## 注意事项

1. **JWT Token 有效期**: 7 天
2. **主收入规则**: 每个用户只能有一个主收入
3. **视图周期验证**:
   - `weekly` 需要 `weekDay` (0-6)
   - `fortnightly` 需要 `fortnightStartDay` (0-6)
   - `monthly` 需要 `monthDate` (1-28)
4. **支付周期**:
   - `weekly`: 每周
   - `biweekly`: 每两周
   - `monthly`: 每月
   - `one-time`: 一次性（不能作为主收入）
5. **日期格式**: 所有日期使用 ISO 8601 格式 (YYYY-MM-DD 或完整 ISO 字符串)

---

**最后更新**: 2024-12-13
