# napcat-plugin-openclaw 开发文档

## 定位

这是一个 **NapCat 通讯插件**，让 OpenClaw 能通过 QQ 直接与用户通讯，类似 Telegram channel 的角色。

> ⚠️ 注意：这是独立于 seren-cowork 的项目。seren-cowork 是独立 Python 服务（轮询 + SSH），本插件是 NapCat 原生插件（事件驱动 + WebSocket 直连）。

## 模块结构

```
napcat-plugin-openclaw/
├── index.mjs              # 编译产物（NapCat 加载入口）
├── package.json           # 插件元数据（含 napcat 字段）
├── tsconfig.json          # TypeScript 配置
└── src/
    ├── index.ts           # 主入口：注册事件、协调模块
    ├── config-manager.ts  # WebUI 配置面板定义 + 读写
    ├── task-manager.ts    # 任务状态机 + 限流控制
    ├── openclaw-client.ts # WebSocket 客户端（连接 OpenClaw Gateway）
    └── file-fetcher.ts    # SCP 文件回传 + 群文件上传
```

## 模块详解

### index.ts — 插件入口

实现 NapCat 插件接口：

```typescript
// 必须导出的函数
export function plugin_onmessage(ctx, msg): void
  // 收到群消息时触发
  // ctx.actions.call() 发送消息
  // ctx.log 日志

export function plugin_config_ui(): ConfigUI
  // WebUI 配置面板定义

export function plugin_onload(ctx): void
  // 插件加载时初始化
```

**消息处理流程：**

```
plugin_onmessage
  │
  ├─ 群白名单检查 → 不在白名单跳过
  ├─ 用户白名单检查
  ├─ 引用检测：引用了 bot 最新消息 → 接续对话
  ├─ 触发词检测 → 未触发跳过
  ├─ 限流检查 → 超限回复提示
  ├─ 意图过滤 (filter session) → REJECT 回复拒绝
  │
  └─ 创建任务 → OpenClawClient.executeTask()
       ├─ 收集 delta → 拼接结果
       ├─ [NEED_INPUT] → 设为 WAITING_INPUT
       ├─ [SECURITY] → 告警
       └─ 完成 → 发送结果 + 文件检测
```

### openclaw-client.ts — OpenClawClient

WebSocket 客户端，直连 OpenClaw Gateway。

**连接协议：**

```
ws://{host}:{port}
  → {"type": "auth", "token": "xxx"}
  ← {"type": "auth", "status": "ok"}
  → {"type": "agent", "message": "...", "sessionKey": "...", "idempotencyKey": "..."}
  ← {"type": "agent", "payload": {"stream": "assistant", "data": {"delta": "..."}}}
  ...
  ← {"type": "lifecycle", "event": "end"}
```

**关键实现：**

- 每次任务创建新连接（无状态）
- `idempotencyKey` 防重复提交
- `payload.stream === "assistant"` 过滤 delta
- timeout 机制防挂起

### task-manager.ts — TaskManager

```typescript
interface Task {
  id: string;
  groupId: number;
  userId: number;
  text: string;
  status: 'pending' | 'running' | 'waiting_input' | 'completed' | 'failed';
  sessionKey: string;        // qq-{groupId}-{userId}
  replyMessageId: number;    // bot 确认消息 ID
  createdAt: number;
}
```

**限流：**
- 滑动窗口计数（每用户每小时）
- 全局并发数上限
- 任务超时自动清理

### config-manager.ts — ConfigManager

定义 WebUI 配置面板结构，NapCat 会自动渲染 UI：

- OpenClaw 连接信息（host/port/token）
- 触发词列表
- 白名单（用户/群）
- 限流参数
- 过滤开关

### file-fetcher.ts — FileFetcher

**文件回传流程：**

1. 任务执行前：SSH `touch /tmp/.seren_task_marker`
2. 任务完成后：SSH `find output/ -newer /tmp/.seren_task_marker`
3. SCP 拉取文件到本地临时目录
4. `ctx.actions.call("upload_group_file", ...)` 上传到群

## 构建

```bash
# 安装开发依赖
npm install

# 编译 TypeScript → index.mjs
npm run build

# 监听模式
npm run watch
```

编译后只需要 `index.mjs` + `package.json`，源码不需要部署。

## 与 seren-cowork 的区别

| | seren-cowork | napcat-plugin-openclaw |
|---|---|---|
| **类型** | 独立 Python 服务 | NapCat 原生插件 |
| **消息获取** | HTTP 轮询 `get_group_msg_history` | `plugin_onmessage` 事件推送 |
| **任务执行** | SSH 到 Playground 运行 worker.js | WebSocket 直连 OpenClaw |
| **发送消息** | HTTP API `send_group_msg` | `ctx.actions.call()` |
| **配置** | config.yaml | NapCat WebUI |
| **部署** | systemd service | NapCat plugins 目录 |
| **依赖** | Python 3.10+, aiohttp | NapCat 4.14.0+, ws |

## NapCat 插件 API 参考

```typescript
// 消息事件
plugin_onmessage(ctx: PluginContext, msg: Message): void

// 上下文
ctx.log.info(msg: string)       // 日志
ctx.log.error(msg: string)
ctx.actions.call(api, params)   // 调用 OneBot11 API
ctx.config                      // 插件配置（WebUI 读写）

// 配置 UI
plugin_config_ui(): { fields: Field[] }
```

## 扩展

### 支持私聊

在 `plugin_onmessage` 中检测 `msg.message_type === "private"`，调整触发逻辑。

### 添加新的 OneBot11 API 调用

通过 `ctx.actions.call("api_name", params)` 调用任意 OneBot11 标准接口。

### 多 Agent 支持

修改 `openclaw-client.ts`，支持根据群/用户路由到不同的 OpenClaw 实例。
