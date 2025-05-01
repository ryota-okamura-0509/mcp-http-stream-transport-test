import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createInterface } from "readline/promises";
import {
    ListToolsRequest,
    ListToolsResultSchema,
    CallToolRequest,
    CallToolResultSchema,
  } from "@modelcontextprotocol/sdk/types.js";

  import https from "https";

const transport = new StreamableHTTPClientTransport(
    new URL("http://localhost:3002/mcp"),
    {
        sessionId: undefined,
    }
)

// filepath: /Users/r_okamura/Dev/private/http_mcp/mcp-server/src/index.ts
const agent = new https.Agent({
    rejectUnauthorized: false, // 証明書検証を無効化
  });

const client = new Client({
    name: "example-client",
    version: "0.0.1",
});

client.onerror = (error) => {
    console.error("Error:", error);
}

const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
})

async function main() {
    try{
        await client.connect(transport);
        console.log("Connected to server");
        while (true) {
            console.log("avaible commands:");
            console.log("1. list-tools");
            console.log("2. call-tool");
            console.log("3. call-admin-login");
            console.log("4. exit");
            console.log("------------------------------");

            const answer = await readline.question("Enter your input: ");

            switch (answer) {
                case "list-tools":
                  await listTools();
                  break;
                case "call-tool":
                  await callTool();
                  break;
                case "call-admin-login":
                  await callTool2();
                case "exit":
                  await disconnect();
                  console.log("Disconnected from server.");
                  return;
         
                default:
                  console.log("You entered:", answer);
                  break;
            }

        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function disconnect() {
    await transport.close();
    await client.close();
    readline.close();
    console.log("Disconnected from server.");
    process.exit(0);
  }

export async function listTools() {
    const req: ListToolsRequest = {
        method: "tools/list",
        params: {},
    };

    const res = await client.request(req, ListToolsResultSchema);

    if (res.tools.length === 0) {
        console.log("No tools available.");
    } else {
        for (const tool of res.tools) {
        console.log(`Tool Name: ${tool.name}`);
        console.log(`Tool Description: ${tool.description}`);
        console.log("------------------------------");
        }
    }
}

export async function callTool2() {
    const sides = await readline.question(
        "職員でログインしますか？: "
    )
    const req2: CallToolRequest = {
        method: "tools/call",
        params: {
          name: "admin_login",
          arguments: { id: "", password: "" },
        },
    }

    try {
        const res = await client.request(req2, CallToolResultSchema);
        console.log("Tool response:");
     
        res.content.forEach((item) => {
          if (item.type === "text") {
            console.log(item.text);
          } else {
            console.log(item.type + "content", item);
          }
        });
        console.log("------------------------------");
      } catch (error) {
        console.error("Error calling tool:", error);
      }
}

export async function callTool() {
    const sides = await readline.question(
        "Enter the number of sides on the dice: "
    )
    const sidesNumber = Number(sides);
    if(isNaN(sidesNumber) || sidesNumber <= 0) {
        console.log("Invalid input. Please enter a positive number.");
        return;
    }
    const req: CallToolRequest = {
        method: "tools/call",
        params: {
          name: "dice",
          arguments: { sides: sidesNumber },
        },
    }

    const req2: CallToolRequest = {
        method: "tools/call",
        params: {
          name: "admin_login",
          arguments: { id: "ログインid", password: "パスワード" },
        },
    }

    try {
        const res = await client.request(req, CallToolResultSchema);
        console.log("Tool response:");
     
        res.content.forEach((item) => {
          if (item.type === "text") {
            console.log(item.text);
          } else {
            console.log(item.type + "content", item);
          }
        });
        console.log("------------------------------");
      } catch (error) {
        console.error("Error calling tool:", error);
      }
}


  main()
  .catch((error) => {
    console.error("Error:", error);
    disconnect();
  });