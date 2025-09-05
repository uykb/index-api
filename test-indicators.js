// 测试新添加的指标
const axios = require('axios');

async function testIndicators() {
  const baseUrl = 'http://localhost:3000';
  const indicators = ['rsi', 'adx', 'obv', 'mfi', 'fundingrate'];
  
  console.log('测试新添加的指标...');
  
  for (const indicator of indicators) {
    try {
      console.log(`\n测试 ${indicator.toUpperCase()} 指标...`);
      
      const response = await axios.post(`${baseUrl}/api/detect`, {
        symbol: 'BTCUSDT',
        timeframe: '1h',
        exchange: 'binance',
        indicators: [indicator],
        limit: 100
      });
      
      if (response.data.success) {
        const signal = response.data.signals[0];
        console.log(`信号类型: ${signal.type}`);
        console.log(`信号强度: ${signal.strength}`);
        console.log(`指标: ${signal.indicator}`);
        console.log(`时间戳: ${new Date(signal.timestamp).toLocaleString()}`);
        console.log(`值: ${JSON.stringify(signal.values)}`);
        console.log(`消息: ${signal.message}`);
      } else {
        console.error(`测试 ${indicator} 失败:`, response.data.error);
      }
    } catch (error) {
      console.error(`测试 ${indicator} 出错:`, error.message);
    }
  }
}

testIndicators().catch(console.error);