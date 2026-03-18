#!/usr/bin/env bun

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { setLanguage, t } from './i18n.js';
import { tools } from './tools/definitions.js';
import { toolRegistry } from './tools/registry.js';

const HABITICA_USER_ID = process.env.HABITICA_USER_ID;
const HABITICA_API_TOKEN = process.env.HABITICA_API_TOKEN;

setLanguage(process.env.MCP_LANG ?? process.env.LANG ?? 'en');

if (!HABITICA_USER_ID || !HABITICA_API_TOKEN) {
  console.error(
    t(
      'Error: Please set HABITICA_USER_ID and HABITICA_API_TOKEN environment variables',
      '错误: 请设置 HABITICA_USER_ID 和 HABITICA_API_TOKEN 环境变量',
    ),
  );
  process.exit(1);
}

const server = new Server(
  {
    name: 'habitica-mcp-server',
    version: '0.0.6',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: toolArguments } = request.params;
  const toolArgs = (toolArguments ?? {}) as Record<string, unknown>;

  const handler = toolRegistry[name];

  if (!handler) {
    throw new McpError(ErrorCode.MethodNotFound, t(`Unknown tool: ${name}`, `未知工具: ${name}`));
  }

  try {
    return await handler(toolArgs);
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }

    const apiError = error as { message?: string };
    const errorMessage = apiError.message ?? t('Unknown error', '未知错误');
    throw new McpError(
      ErrorCode.InternalError,
      t(`Habitica API error: ${errorMessage}`, `Habitica API 错误: ${errorMessage}`),
    );
  }
});

async function runServer(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(t('Habitica MCP Server started', 'Habitica MCP 服务器已启动'));
}

runServer().catch((error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(t(`Server startup failed: ${errorMessage}`, `服务器启动失败: ${errorMessage}`));
  process.exit(1);
});
