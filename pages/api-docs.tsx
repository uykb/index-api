import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function ApiDocs() {
  return (
    <div className={styles.container}>
      <Head>
        <title>API文档 - 加密货币交易信号检测服务</title>
        <meta name="description" content="加密货币交易信号检测服务API文档" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          API文档
        </h1>

        <div className={styles.description}>
          <p>本服务提供加密货币市场的技术指标信号检测，可以被n8n工作流调用</p>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>实时价格 API</h2>
            <p><strong>端点:</strong> <code>/api/price</code></p>
            <p><strong>方法:</strong> GET 或 POST</p>
            <p><strong>GET请求参数:</strong></p>
            <pre style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
              symbol=BTCUSDT&timeframe=1m&exchange=binance&startTime=1634567890000&endTime=1634567990000&limit=10
            </pre>
            <p><strong>POST请求体:</strong></p>
            <pre style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
              {JSON.stringify({
                symbol: 'BTCUSDT',
                timeframe: '1m',
                exchange: 'binance',
                startTime: 1634567890000,
                endTime: 1634567990000,
                limit: 10
              }, null, 2)}
            </pre>
            <p><strong>参数说明:</strong></p>
            <ul>
              <li><code>symbol</code> (必填): 交易对，如 BTCUSDT</li>
              <li><code>timeframe</code> (可选): 时间周期，默认 1m，支持 1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w</li>
              <li><code>exchange</code> (可选): 交易所，默认 binance</li>
              <li><code>startTime</code> (可选): 开始时间戳（毫秒），获取此时间之后的数据</li>
              <li><code>endTime</code> (可选): 结束时间戳（毫秒），获取此时间之前的数据</li>
              <li><code>limit</code> (可选): 获取的K线数量，默认 1</li>
            </ul>
            <p><strong>响应示例:</strong></p>
            <pre style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
              {JSON.stringify({
                success: true,
                prices: [
                  {
                    current: 50000.25,
                    open: 49800.50,
                    high: 50100.75,
                    low: 49750.25,
                    volume: 1250.35,
                    timestamp: 1634567890000
                  },
                  {
                    current: 50100.50,
                    open: 50000.25,
                    high: 50200.00,
                    low: 49950.00,
                    volume: 1300.75,
                    timestamp: 1634567950000
                  }
                ],
                metadata: {
                  symbol: 'BTCUSDT',
                  timeframe: '1m',
                  exchange: 'binance',
                  timestamp: 1634567990000,
                  count: 2
                }
              }, null, 2)}
            </pre>
          </div>

          <div className={styles.card}>
            <h2>信号检测 API</h2>
            <p><strong>端点:</strong> <code>/api/detect</code></p>
            <p><strong>方法:</strong> POST</p>
            <p><strong>请求体:</strong></p>
            <pre style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
              {JSON.stringify({
                symbol: 'BTCUSDT',
                timeframe: '1h',
                exchange: 'binance',
                indicators: ['macd', 'kdj'],
                limit: 100
              }, null, 2)}
            </pre>
            <p><strong>参数说明:</strong></p>
            <ul>
              <li><code>symbol</code> (必填): 交易对，如 BTCUSDT</li>
              <li><code>timeframe</code> (可选): 时间周期，默认 1h，支持 1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w</li>
              <li><code>exchange</code> (可选): 交易所，默认 binance</li>
              <li><code>indicators</code> (可选): 要检测的指标数组，默认检测所有支持的指标</li>
              <li><code>limit</code> (可选): 获取的K线数量，默认 100</li>
            </ul>
            <p><strong>响应示例:</strong></p>
            <pre style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
              {JSON.stringify({
                success: true,
                signals: [
                  {
                    type: 'BUY',
                    strength: 'MEDIUM',
                    indicator: 'MACD',
                    timestamp: 1634567890000,
                    values: {
                      MACD: 0.5,
                      signal: 0.2,
                      histogram: 0.3
                    },
                    message: 'MACD上穿信号线，产生买入信号'
                  },
                  {
                    type: 'NEUTRAL',
                    strength: 'WEAK',
                    indicator: 'KDJ',
                    timestamp: 1634567890000,
                    values: {
                      K: 50,
                      D: 50,
                      J: 50
                    },
                    message: 'KDJ无明显信号'
                  }
                ],
                metadata: {
                  symbol: 'BTCUSDT',
                  timeframe: '1h',
                  exchange: 'binance',
                  timestamp: 1634567890000,
                  indicators: ['macd', 'kdj']
                }
              }, null, 2)}
            </pre>
          </div>

          <div className={styles.card}>
            <h2>在n8n中使用</h2>
            <p>在n8n工作流中，您可以使用HTTP请求节点调用此API：</p>
            <ol>
              <li>添加HTTP请求节点</li>
              <li>设置方法为POST</li>
              <li>URL设置为您的Vercel部署地址 + /api/detect</li>
              <li>在请求体中添加所需参数</li>
              <li>连接后续节点处理API返回的信号数据</li>
            </ol>
          </div>

          <div className={styles.card}>
            <h2>支持的指标</h2>
            <p>目前支持以下技术指标：</p>
            <ul>
              <li><strong>MACD</strong> - 移动平均线收敛/发散指标</li>
              <li><strong>KDJ</strong> - 随机指标</li>
              <li><strong>Zero-Lag MACD</strong> - 零滞后MACD指标，减少了传统MACD的滞后性，提供更快的信号</li>
              <li><strong>RSI</strong> - 相对强弱指标，用于判断市场超买超卖状态</li>
              <li><strong>ADX</strong> - 平均趋向指数，用于判断趋势强度</li>
              <li><strong>OBV</strong> - 能量潮指标，通过成交量分析价格趋势</li>
              <li><strong>MFI</strong> - 资金流量指标，结合价格和成交量分析市场资金流向</li>
              <li><strong>Funding Rate</strong> - 资金费率指标，分析期货市场做多做空成本</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>部署在 Vercel 上的交易信号检测服务</p>
      </footer>
    </div>
  );
}