# NapCat Plugin OpenClaw - 部署指南

## 项目结构

```
napcat-plugin-openclaw/
├── index.mjs              # 插件入口（已编译，可直接使用）
├── package.json           # 插件元数据
├── README.md              # 说明文档
├── tsconfig.json          # TypeScript 配置
├── .gitignore             # Git 忽略配置
└── src/                   # TypeScript 源码
    ├── index.ts           # 主入口
    ├── config-manager.ts  # 配置管理
    ├── task-manager.ts    # 任务管理
    ├── openclaw-client.ts # WebSocket 客户端
    └── file-fetcher.ts    # 文件传输
```

## 部署步骤

### 1. 安装到 NapCat 插件目录

```bash
# 找到 NapCat 的插件目录（通常在 napcat/plugins/ 下）
cd /path/to/napcat/plugins

# 复制插件
mkdir -p napcat-plugin-openclaw
cp -r /path/to/napcat-plugin-openclaw/* napcat-plugin-openclaw/
```

### 2. 安装依赖

```bash
cd napcat-plugin-openclaw
npm install
```

### 3. 配置插件

在 NapCat WebUI 中找到插件配置，填写以下配置项：

```json
{
  "openclaw": {
    "host": "202.47.135.226",
    "port": 18789,
    "token": "d34e4487b0197e2b7c5eb340d03555bc7ceaa1e2568f639e",
    "user": "root"
  },
  "triggers": {
    "keywords": ["莲莲帮我"],
    "atTrigger": false
  },
  "whitelist": {
    "users": [768295235],
    "groups": [902106123]
  },
  "limits": {
    "ratePerUserPerHour": 5,
    "maxConcurrent": 3,
    "taskTimeoutSec": 180,
    "cooldownSec": 3
  },
  "filter": {
    "enabled": true
  }
}
```

### 4. 重启 NapCat

插件会自动加载。

## 开发构建（如需修改源码）

```bash
# 开发模式（自动编译）
npm run watch

# 生产构建
npm run build
```

## 功能特性

- ✅ 关键词触发（可配置）
- ✅ 用户/群白名单
- ✅ 限流控制（每小时/并发）
- ✅ 意图过滤（LLM 判断）
- ✅ WebSocket 直连 OpenClaw
- ✅ 文件自动 SCP 回传
- ✅ 每用户固定 session
- ✅ WebUI 配置面板
- ✅ 消息发送冷却

## 注意事项

1. 需要安装 `ws` 依赖：`npm install ws`
2. 文件传输需要 SSH 免密登录到 playground
3. 确保 `/tmp/napcat-openclaw-files` 有写入权限
