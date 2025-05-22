## 環境構築

### 前提
localhost:1443でcodmon-apiが起動していること

### チャットアプリの起動
* nodeのバージョンは20以上を使用してください
1. 対象のフォルダに移動する
```
cd chat/mcp-chat-app
```
2. ライブラリをインストール
```
npm i
```
3. .envがまだない場合は.env.localからコピーして適切な値をセットしてください（キーはOpenAIでもGeminiどちらでもいいです）
```
cp .env.local .env
```
4. チャットアプリ起動
```
npm run dev
```

### MCPサーバー起動
1. フォルダに移動
```
cd mcp-server
```
2. ライブラリをインストール
```
npm i
```
3. .envがまだない場合は.env.localからコピーして適切な値をセットしてください（postmanを参考にセットするとわかりやすいです）
```
cp .env.local .env
```
4. MCPサーバー起動
```
npx tsx src/index.ts
```