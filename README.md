# 信号检测服务

这是一个部署在Vercel上的加密货币服务，提供实时价格数据和技术指标信号检测（如MACD、KDJ、RSI、ADX、OBV、MFI和资金费率等）。采用模块化设计，方便后期添加新的指标。

## 功能特点

- 支持多种技术指标（MACD、KDJ、Zero-Lag MACD、RSI、ADX、OBV、MFI和资金费率等）
- 模块化设计，易于扩展新指标
- RESTful API接口，易于集成
- 可与n8n工作流无缝对接
- 部署在Vercel上，无需服务器维护

## 技术栈

- Next.js - React框架
- TypeScript - 类型安全
- Vercel - 部署平台
- technicalindicators - 技术指标计算库

## 部署指南

### 部署到Vercel

1. 在GitHub上创建一个新仓库，并上传项目代码
2. 登录Vercel账户：https://vercel.com/
3. 点击"New Project"按钮
4. 导入你的GitHub仓库
5. 保持默认设置，点击"Deploy"按钮
6. 等待部署完成，Vercel会自动提供一个域名

### 在n8n中使用

1. 在n8n工作流中添加HTTP请求节点
2. 设置方法为POST
3. URL设置为你的Vercel部署地址 + `/api/detect`
4. 在请求体中添加所需参数，例如：

```json
{
  "symbol": "BTCUSDT",
  "timeframe": "1h",
  "exchange": "binance",
  "indicators": ["macd", "kdj", "zerolagmacd", "rsi", "adx", "obv", "mfi", "fundingrate"],
  "limit": 100
}
```

5. 连接后续节点处理API返回的信号数据

## API文档

### 实时价格 API

**端点:** `/api/price`

**方法:** GET 或 POST

**GET请求参数:**

```
symbol=BTCUSDT&timeframe=1m&exchange=binance&startTime=1634567890000&endTime=1634567990000&limit=10
```

**POST请求体:**

```json
{
  "symbol": "BTCUSDT",
  "timeframe": "1m",
  "exchange": "binance",
  "startTime": 1634567890000,
  "endTime": 1634567990000,
  "limit": 10
}
```

**参数说明:**

- `symbol` (必填): 交易对，如 BTCUSDT
- `timeframe` (可选): 时间周期，默认 1m，支持 1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w
- `exchange` (可选): 交易所，默认 binance
- `startTime` (可选): 开始时间戳（毫秒），获取此时间之后的数据
- `endTime` (可选): 结束时间戳（毫秒），获取此时间之前的数据
- `limit` (可选): 获取的K线数量，默认 1

**响应示例:**

```json
{
  "success": true,
  "prices": [
    {
      "current": 50000.25,
      "open": 49800.50,
      "high": 50100.75,
      "low": 49750.25,
      "volume": 1250.35,
      "timestamp": 1634567890000
    },
    {
      "current": 50100.50,
      "open": 50000.25,
      "high": 50200.00,
      "low": 49950.00,
      "volume": 1300.75,
      "timestamp": 1634567950000
    }
  ],
  "metadata": {
    "symbol": "BTCUSDT",
    "timeframe": "1m",
    "exchange": "binance",
    "timestamp": 1634567990000,
    "count": 2
  }
}
```

### 信号检测 API

**端点:** `/api/detect`

**方法:** POST

**请求体:**

```json
{
  "symbol": "BTCUSDT",
  "timeframe": "1h",
  "exchange": "binance",
  "indicators": ["macd", "kdj"],
  "limit": 100
}
```

**参数说明:**

- `symbol` (必填): 交易对，如 BTCUSDT
- `timeframe` (可选): 时间周期，默认 1h，支持 1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w
- `exchange` (可选): 交易所，默认 binance
- `indicators` (可选): 要检测的指标数组，默认检测所有支持的指标
- `limit` (可选): 获取的K线数量，默认 100

**响应示例:**

```json
{
  "success": true,
  "signals": [
    {
      "type": "BUY",
      "strength": "MEDIUM",
      "indicator": "MACD",
      "timestamp": 1634567890000,
      "values": {
        "MACD": 0.5,
        "signal": 0.2,
        "histogram": 0.3
      },
      "message": "MACD上穿信号线，产生买入信号"
    },
    {
      "type": "NEUTRAL",
      "strength": "WEAK",
      "indicator": "KDJ",
      "timestamp": 1634567890000,
      "values": {
        "K": 50,
        "D": 50,
        "J": 50
      },
      "message": "KDJ无明显信号"
    }
  ],
  "metadata": {
    "symbol": "BTCUSDT",
    "timeframe": "1h",
    "exchange": "binance",
    "timestamp": 1634567890000,
    "indicators": ["macd", "kdj", "zerolagmacd", "rsi", "adx", "obv", "mfi", "fundingrate"]
  }
}
```

## 添加新指标

要添加新的技术指标，请按照以下步骤操作：

1. 在 `lib/indicators` 目录下创建新的指标实现文件，参考现有的 `macd.ts` 或 `kdj.ts`
2. 实现 `Indicator` 接口和对应的工厂类
3. 在 `lib/indicators/index.ts` 中注册新的指标

## 许可证

MIT
