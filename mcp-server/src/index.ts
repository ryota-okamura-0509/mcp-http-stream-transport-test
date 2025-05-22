import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import express from "express";
import https from "https";
import dotenv from "dotenv";

dotenv.config();

const clientId = process.env.CLIENT_ID ?? "";
const clientSecret = process.env.CLIENT_SECRET ?? "";
const username = process.env.USERNAME ?? "";
const password = process.env.PASSWORD ?? "";
const grantType = process.env.GRANT_TYPE ?? "";

const agent = new https.Agent({
    rejectUnauthorized: false, // 証明書検証を無効化
  });
const app = express();
app.use(express.json());
 
const transport: StreamableHTTPServerTransport =
  new StreamableHTTPServerTransport({
    // ステートレスなサーバーの場合、undefined を指定する
    sessionIdGenerator: undefined,
  });
 
const mcpServer = new McpServer({ name: "my-server", version: "0.0.1" });

mcpServer.tool(
    'get_classes',
    "クラス情報を取得",
    {id: z.string().describe("サービスID")},
    async (input) => {
        const { id } = input;
        // TODO; envにまとめたい
        const body = new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          username: username,
          password: password,
          grant_type: grantType,
        });
        try {
            const res = await fetch("https://localhost:1443/oauth/token", {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                  "Accept": "application/json",
                },
                body: body,
            });
            console.log("Response:", res);

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            const accessToken = data.access_token;
            console.log("Access Token:", accessToken);

            const classRes = await fetch(`https://localhost:1443/api/v1/classes?service_id=${id}&limit=50&offset=0`, {
              method: "GET",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json",
                "Authorization": `Bearer ${accessToken}`,
              },
            });

            const classes = await classRes.json();
            console.log("対象クラス:", classes);
            return {
                content: [
                    {
                        type: "text",
                        text: `対象クラス一覧: ${JSON.stringify(classes)}`,
                    },
                ],
            };
        } catch (error) {
            console.error("Error:", error);
            return {
                content: [
                    {
                        type: "text",
                        text: `Login failed: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    }
)

mcpServer.tool(
  'get_member',
  "園児情報の取得",
  {id: z.string().describe("サービスID"), member_id: z.string().describe("園児ID")},
  async (input) => {
      const { id, member_id } = input;
      // TODO; envにまとめたい
      const body = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        username: username,
        password: password,
        grant_type: grantType,
      });
      try {
          const res = await fetch("https://localhost:1443/oauth/token", {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json",
              },
              body: body,
          });
          console.log("Response:", res);

          if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
          }

          const data = await res.json();
          const accessToken = data.access_token;
          console.log("Access Token:", accessToken);
          const memberSearchRequest = {
            service_ids: [id], // 配列形式
            member_ids: [member_id], // 配列形式
          };

          const classRes = await fetch(`https://localhost:1443/api/v1/members/search`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify(memberSearchRequest),
          });

          const classes = await classRes.json();
          console.log("対象クラス:", classes);
          return {
              content: [
                  {
                      type: "text",
                      text: `対象クラス一覧: ${JSON.stringify(classes)}`,
                  },
              ],
          };
      } catch (error) {
          console.error("Error:", error);
          return {
              content: [
                  {
                      type: "text",
                      text: `Login failed: ${error.message}`,
                  },
              ],
              isError: true,
          };
      }
  }
)
 
const setupServer = async () => {
  await mcpServer.connect(transport);
};
 
// POST リクエストで受け付ける
app.post("/mcp", async (req, res) => {
  console.log("Received MCP request:", req.body);
  try {
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          // JSON-RPC 2.0のエラーコードを指定
          // http://www.jsonrpc.org/specification#error_object
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});
 
// GET リクエストは SSE エンドポイントとの互換性のために実装する必要がある
// SSE エンドポイントを実装しない場合は、405 Method Not Allowed を返す
app.get("/mcp", async (req, res) => {
  console.log("Received GET MCP request");
  res.writeHead(405).end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed.",
      },
      id: null,
    })
  );
});
 
// DELETE リクエストはステートフルなサーバーの場合に実装する必要がある
app.delete("/mcp", async (req, res) => {
  console.log("Received DELETE MCP request");
  res.writeHead(405).end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed.",
      },
      id: null,
    })
  );
});
 
 
setupServer()
  .then(() => {
    app.listen(3002, () => {
      console.log("Server is running on http://localhost:3002/mcp");
    });
  })
  .catch((err) => {
    console.error("Error setting up server:", err);
    process.exit(1);
  });
 
// graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  try {
    console.log(`Closing transport`);
    await transport.close();
  } catch (error) {
    console.error(`Error closing transport:`, error);
  }
 
  await mcpServer.close();
  console.log("Server shutdown complete");
  process.exit(0);
});