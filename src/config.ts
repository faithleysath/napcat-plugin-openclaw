import type { PluginConfig } from './types';

export const DEFAULT_CONFIG: PluginConfig = {
  openclaw: {
    token: '',
    gatewayUrl: 'ws://127.0.0.1:18789',
    cliPath: '/root/.nvm/versions/node/v22.22.0/bin/openclaw',
  },
  behavior: {
    privateChat: true,
    groupAtOnly: true,
    userWhitelist: [],
    groupWhitelist: [],
    debounceMs: 2000,
    groupSessionMode: 'user',
  },
};

export function buildConfigSchema(): any[] {
  return [
    // OpenClaw 连接配置
    {
      key: 'openclaw.gatewayUrl',
      label: 'Gateway 地址',
      type: 'string',
      default: 'ws://127.0.0.1:18789',
      description: 'OpenClaw Gateway WebSocket 连接地址',
    },
    {
      key: 'openclaw.token',
      label: '认证 Token',
      type: 'string',
      default: '',
      description: 'OpenClaw Gateway 认证令牌（可选）',
      secret: true,
    },
    {
      key: 'openclaw.cliPath',
      label: 'CLI 路径',
      type: 'string',
      default: '/root/.nvm/versions/node/v22.22.0/bin/openclaw',
      description: 'OpenClaw CLI 命令路径（备用连接方式）',
    },
    // 行为配置
    {
      key: 'behavior.privateChat',
      label: '启用私聊',
      type: 'boolean',
      default: true,
      description: '是否允许通过私聊触发 AI 助手',
    },
    {
      key: 'behavior.groupAtOnly',
      label: '群聊仅 @ 触发',
      type: 'boolean',
      default: true,
      description: '群聊中是否需要 @ 机器人才触发',
    },
    {
      key: 'behavior.debounceMs',
      label: '防抖时间（毫秒）',
      type: 'number',
      default: 2000,
      description: '相同会话消息防抖时间',
    },
    {
      key: 'behavior.groupSessionMode',
      label: '群聊会话模式',
      type: 'select',
      default: 'user',
      options: [
        { label: '独立会话', value: 'user' },
        { label: '共享会话', value: 'shared' },
      ],
      description: '群聊中每个用户是否独立会话',
    },
    // 白名单配置（用字符串表示，逗号分隔）
    {
      key: 'behavior.userWhitelist',
      label: '用户白名单',
      type: 'string',
      default: '',
      description: '允许访问的用户 QQ 号列表（空则允许所有，逗号分隔，如：123456,789012）',
    },
    {
      key: 'behavior.groupWhitelist',
      label: '群组白名单',
      type: 'string',
      default: '',
      description: '允许访问的群号列表（空则允许所有，逗号分隔，如：987654321,123456789）',
    },
  ];
}
