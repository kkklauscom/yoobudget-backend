# User API 文档

## 基础信息

- **Base URL**: `http://localhost:8000/api`
- **认证方式**: JWT Bearer Token（部分 API 需要认证）
- **Content-Type**: `application/json`

---

## 目录

1. [认证 API](#认证-api)
   - [用户注册](#1-用户注册)
   - [用户登录](#2-用户登录)
2. [用户信息 API](#用户信息-api)
   - [获取当前用户信息](#3-获取当前用户信息)
   - [更新用户设置](#4-更新用户设置)

---

## 认证 API

### 1. 用户注册

**POST** `/api/auth/register`

创建新用户账户。

#### 请求体

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
  "currentSavings": 0
}
```

#### 字段说明

| 字段             | 类型   | 必填 | 说明                                                                         |
| ---------------- | ------ | ---- | ---------------------------------------------------------------------------- |
| `email`          | String | ✅   | 用户邮箱，必须唯一                                                           |
| `password`       | String | ✅   | 密码                                                                         |
| `name`           | String | ✅   | 用户姓名                                                                     |
| `budgetRatio`    | Object | ❌   | 预算比例，默认 `{ needs: 50, wants: 30, savings: 20 }`                       |
| `viewCycle`      | String | ❌   | 视图周期，可选值: `"weekly"`, `"fortnightly"`, `"monthly"`，默认 `"monthly"` |
| `currentSavings` | Number | ❌   | 当前储蓄金额，默认 `0`                                                       |

#### 视图周期说明

注册时只需要提供 `viewCycle`，系统会自动设置默认值：

- **monthly** (默认): 自动设置 `monthDate = 1`
- **weekly**: `weekDay` 设为 `null`，用户可在后续通过更新 API 设置
- **fortnightly**: `fortnightStartDay` 设为 `null`，用户可在后续通过更新 API 设置

**注意**: 如果需要在注册时设置周期详细字段（`weekDay`, `fortnightStartDay`, `monthDate`），请使用 `PATCH /api/users/me` API 进行更新。

#### 成功响应 (201)

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

#### 错误响应

- `400`: 邮箱已存在或验证失败
  ```json
  {
    "error": "Email already exists"
  }
  ```
  或
  ```json
  {
    "error": "weekDay is required when viewCycle is 'weekly'"
  }
  ```
- `500`: 服务器错误

---

### 2. 用户登录

**POST** `/api/auth/login`

用户登录获取 JWT token。

#### 请求体

```json
{
  "email": "test@example.com",
  "password": "12345678"
}
```

#### 字段说明

| 字段       | 类型   | 必填 | 说明     |
| ---------- | ------ | ---- | -------- |
| `email`    | String | ✅   | 用户邮箱 |
| `password` | String | ✅   | 密码     |

#### 成功响应 (200)

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

#### 错误响应

- `400`: 邮箱和密码必填
  ```json
  {
    "error": "Email and password are required"
  }
  ```
- `401`: 用户不存在或密码错误
  ```json
  {
    "error": "User not found"
  }
  ```
  或
  ```json
  {
    "error": "Invalid password"
  }
  ```
- `500`: 服务器错误

---

## 用户信息 API

所有用户信息 API 都需要 JWT 认证。

**请求头**:

```
Authorization: Bearer <token>
```

---

### 3. 获取当前用户信息

**GET** `/api/users/me`

获取当前登录用户的详细信息。

#### 成功响应 (200)

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

#### 响应字段说明

| 字段                | 类型   | 说明                                               |
| ------------------- | ------ | -------------------------------------------------- |
| `_id`               | String | 用户唯一标识                                       |
| `email`             | String | 用户邮箱                                           |
| `name`              | String | 用户姓名                                           |
| `budgetRatio`       | Object | 预算比例对象                                       |
| `currentSavings`    | Number | 当前储蓄金额                                       |
| `viewCycle`         | String | 视图周期：`"weekly"`, `"fortnightly"`, `"monthly"` |
| `weekDay`           | Number | 周几（weekly），0-6，null 表示不使用               |
| `fortnightStartDay` | Number | 双周起始日（fortnightly），0-6，null 表示不使用    |
| `monthDate`         | Number | 月日期（monthly），1-28，null 表示不使用           |
| `createdAt`         | Date   | 账户创建时间                                       |
| `updatedAt`         | Date   | 最后更新时间                                       |

**注意**: 返回数据不包含 `passwordHash`，确保密码安全。

#### 错误响应

- `401`: 未授权（token 无效或过期）
  ```json
  {
    "error": "Invalid token"
  }
  ```
- `404`: 用户不存在
  ```json
  {
    "error": "User not found"
  }
  ```
- `500`: 服务器错误

---

### 4. 更新用户设置

**PATCH** `/api/users/me`

更新当前用户的设置信息。支持部分更新，只更新提供的字段。

#### 请求体（所有字段可选）

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

#### 字段说明

| 字段                | 类型   | 必填 | 说明                                                       |
| ------------------- | ------ | ---- | ---------------------------------------------------------- |
| `name`              | String | ❌   | 用户姓名                                                   |
| `budgetRatio`       | Object | ❌   | 预算比例对象                                               |
| `viewCycle`         | String | ❌   | 视图周期，可选值: `"weekly"`, `"fortnightly"`, `"monthly"` |
| `weekDay`           | Number | 条件 | 当 `viewCycle="weekly"` 时必填，范围 0-6                   |
| `fortnightStartDay` | Number | 条件 | 当 `viewCycle="fortnightly"` 时必填，范围 0-6              |
| `monthDate`         | Number | 条件 | 当 `viewCycle="monthly"` 时必填，范围 1-28                 |

#### 视图周期更新规则

- 如果更新 `viewCycle`，必须提供对应的周期字段
- 系统会自动清理无关的周期字段（设为 `null`）
- 例如：从 `monthly` 改为 `weekly` 时，`monthDate` 会自动设为 `null`，`weekDay` 必须提供

#### 成功响应 (200)

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

#### 错误响应

- `400`: 验证失败
  ```json
  {
    "error": "weekDay is required when viewCycle is 'weekly'"
  }
  ```
  或
  ```json
  {
    "error": "monthDate must be a number between 1 and 28"
  }
  ```
- `401`: 未授权
- `404`: 用户不存在
- `500`: 服务器错误

---

## 数据模型

### User 对象结构

```typescript
{
  _id: string; // MongoDB ID
  email: string; // 用户邮箱（唯一）
  name: string; // 用户姓名
  budgetRatio: {
    // 预算比例
    needs: number; // 必需支出比例（默认 50）
    wants: number; // 想要支出比例（默认 30）
    savings: number; // 储蓄比例（默认 20）
  }
  currentSavings: number; // 当前储蓄金额（默认 0）
  viewCycle: "weekly" | "fortnightly" | "monthly"; // 视图周期
  weekDay: number | null; // 周几（0-6），仅 weekly 使用
  fortnightStartDay: number | null; // 双周起始日（0-6），仅 fortnightly 使用
  monthDate: number | null; // 月日期（1-28），仅 monthly 使用
  createdAt: Date; // 账户创建时间
  updatedAt: Date; // 最后更新时间
}
```

---

## 业务规则

### 视图周期验证

1. **weekly** (每周)

   - 需要 `weekDay`: 0-6 (0=周日, 1=周一, ..., 6=周六)
   - `fortnightStartDay` 和 `monthDate` 必须为 `null`

2. **fortnightly** (每两周)

   - 需要 `fortnightStartDay`: 0-6
   - `weekDay` 和 `monthDate` 必须为 `null`

3. **monthly** (每月)
   - 需要 `monthDate`: 1-28
   - `weekDay` 和 `fortnightStartDay` 必须为 `null`

### 数据一致性

- 如果 `viewCycle` 是 `monthly` 但 `monthDate` 是 `null`，系统会自动设置为 `1`
- 更新 `viewCycle` 时，系统会自动清理无关的周期字段

### 预算比例

- 三个比例的总和应该等于 100（但后端不强制验证）
- 默认值：`needs: 50, wants: 30, savings: 20`

---

## 使用示例

### 完整流程

1. **注册新用户**

   ```bash
   POST /api/auth/register
   {
     "email": "user@example.com",
     "password": "password123",
     "name": "John Doe",
     "viewCycle": "monthly"
   }
   ```

2. **登录获取 Token**

   ```bash
   POST /api/auth/login
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```

3. **获取用户信息**

   ```bash
   GET /api/users/me
   Authorization: Bearer <token>
   ```

4. **更新用户设置**
   ```bash
   PATCH /api/users/me
   Authorization: Bearer <token>
   {
     "viewCycle": "weekly",
     "weekDay": 1
   }
   ```

### 更新视图周期示例

**从 monthly 改为 weekly**:

```json
PATCH /api/users/me
{
  "viewCycle": "weekly",
  "weekDay": 1
}
```

响应中会自动清理 `monthDate` 和 `fortnightStartDay`:

```json
{
  "viewCycle": "weekly",
  "weekDay": 1,
  "fortnightStartDay": null,
  "monthDate": null
}
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

- `"Email, password, and name are required"` - 注册时必填字段缺失
- `"Email already exists"` - 邮箱已被注册
- `"Email and password are required"` - 登录时必填字段缺失
- `"User not found"` - 用户不存在
- `"Invalid password"` - 密码错误
- `"weekDay is required when viewCycle is 'weekly'"` - weekly 周期缺少 weekDay
- `"fortnightStartDay is required when viewCycle is 'fortnightly'"` - fortnightly 周期缺少字段
- `"monthDate is required when viewCycle is 'monthly'"` - monthly 周期缺少 monthDate
- `"Invalid token"` - JWT token 无效
- `"Token expired"` - JWT token 已过期

---

## 注意事项

1. **JWT Token 有效期**: 7 天
2. **密码安全**: 密码使用 bcrypt 加密存储，永远不会返回给客户端
3. **视图周期**: 更改 `viewCycle` 时必须提供对应的周期字段
4. **数据自动修复**: 如果 `viewCycle` 是 `monthly` 但 `monthDate` 是 `null`，系统会自动设置为 `1`
5. **部分更新**: `PATCH /api/users/me` 支持部分更新，只更新提供的字段

---

**最后更新**: 2024-12-13
