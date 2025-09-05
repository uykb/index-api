import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>加密货币交易信号检测服务</title>
        <meta name="description" content="用于检测加密货币市场的技术指标信号" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          加密货币交易信号检测服务
        </h1>

        <p className={styles.description}>
          该服务提供加密货币市场的实时价格数据和技术指标信号检测，包括MACD、KDJ、RSI、ADX、OBV、MFI和资金费率等
        </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>API 使用说明</h2>
            <p>通过 GET/POST 请求访问 /api/price 端点获取实时价格数据</p>
            <p>通过 POST 请求访问 /api/detect 端点获取技术指标信号</p>
          </div>

          <div className={styles.card}>
            <h2>支持的指标</h2>
            <p>目前支持以下技术指标：</p>
            <ul>
              <li>MACD - 移动平均线收敛/发散指标</li>
              <li>KDJ - 随机指标</li>
              <li>Zero-Lag MACD - 零滞后MACD指标</li>
              <li>RSI - 相对强弱指标</li>
              <li>ADX - 平均趋向指数</li>
              <li>OBV - 能量潮指标</li>
              <li>MFI - 资金流量指标</li>
              <li>Funding Rate - 资金费率指标</li>
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