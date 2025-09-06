# CoinGecko API 集成说明

## 概述

本项目已成功将 Binance API 替换为 CoinGecko API，以解决 Vercel 部署时可能遇到的 IP 封锁问题。<mcreference link="https://www.coingecko.com/en/api" index="1">1</mcreference>

## 已完成的修改

### 1. 数据服务层 (lib/dataService.ts)

- ✅ 添加了 `fetchCoinGeckoOHLC` 函数，支持从 CoinGecko 获取 OHLC 数据
- ✅ 实现了交易对符号到 CoinGecko coin ID 的转换映射
- ✅ 添加了时间周期到天数的计算逻辑
- ✅ 更新了 `getPriceData` 工厂函数以支持 `coingecko` 交易所
- ✅ 在 `Exchange` 类型中添加了 `'coingecko'` 选项

### 2. API 端点修改

#### price.ts
- ✅ 将默认交易所从 `'binance'` 改为 `'coingecko'`

#### detect.ts  
- ✅ 将默认交易所从 `'binance'` 改为 `'coingecko'`

### 3. 指标处理优化

- ✅ 移除了资金费率指标，因为 CoinGecko 不提供此类数据
- ✅ 简化了指标注册表，专注于技术分析指标

## CoinGecko API 特点

### 优势
<mcreference link="https://www.coingecko.com/en/api" index="1">1</mcreference>
- **免费使用**: Demo API 计划免费，每分钟 30 次调用，每月 10,000 次调用
- **无需 API Key**: 免费版本无需注册或 API Key
- **稳定可靠**: 被 Consensys、Chainlink、Coinbase 等大公司信任
- **数据全面**: 支持 17,000+ 币种，1,000+ 交易所数据

### 限制
<mcreference link="https://www.coingecko.com/en/api/pricing" index="3">3</mcreference>
- **数据粒度**: 免费版本的 OHLC 数据有自动粒度限制

- **无成交量**: OHLC 端点不包含成交量数据
- **速率限制**: 免费版本每分钟 30 次调用

## API 使用示例

### 获取价格数据
```bash
# 使用 CoinGecko (默认)
curl "http://localhost:3000/api/price?symbol=BTCUSDT"

# 明确指定 CoinGecko
curl "http://localhost:3000/api/price?symbol=BTCUSDT&exchange=coingecko"

# 仍可使用 Binance (如果网络允许)
curl "http://localhost:3000/api/price?symbol=BTCUSDT&exchange=binance"
```

### 信号检测
```bash
curl -X POST "http://localhost:3000/api/detect" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "exchange": "coingecko",
    "timeframe": "1h",
    "indicators": ["RSI", "MACD"],
    "limit": 50
  }'
```

## 支持的币种映射

项目已内置常见币种的映射关系：

| 交易对 | CoinGecko ID |
|--------|-------------|
| BTCUSDT | bitcoin |
| ETHUSDT | ethereum |
| BNBUSDT | binancecoin |
| ADAUSDT | cardano |
| DOTUSDT | polkadot |
| LINKUSDT | chainlink |
| ... | ... |

## 部署注意事项

1. **Vercel 部署**: CoinGecko API 应该不会被 Vercel 的 IP 段封锁
2. **速率限制**: 注意免费版本的调用限制，生产环境建议升级到付费计划
3. **错误处理**: 代码已包含完善的错误处理和降级机制


## 测试

项目包含测试脚本 `test-coingecko.js`，可用于验证集成：

```bash
node test-coingecko.js
```

## 故障排除

### 网络连接问题
如果遇到 `ETIMEDOUT` 错误：
1. 检查网络连接
2. 确认防火墙设置
3. 考虑使用代理或 VPN
4. 联系网络管理员

### API 限制
如果遇到速率限制：
1. 减少调用频率
2. 实现请求缓存
3. 升级到 CoinGecko 付费计划

## 下一步优化建议

1. **缓存机制**: 实现 Redis 或内存缓存以减少 API 调用
2. **错误重试**: 添加指数退避重试机制
3. **数据源切换**: 实现多数据源自动切换
4. **监控告警**: 添加 API 调用监控和告警
5. **成交量数据**: 考虑使用其他端点获取成交量数据

---

**注意**: 本集成已完成代码层面的修改，实际部署效果需要在 Vercel 环境中验证。