// 测试Zero-Lag MACD指标的简单脚本
const axios = require('axios');

async function testZeroLagMACD() {
  try {
    console.log('测试Zero-Lag MACD指标...');
    
    const response = await axios.post('http://localhost:3000/api/detect', {
      symbol: 'BTCUSDT',
      timeframe: '1h',
      exchange: 'binance',
      indicators: ['zerolagmacd'],
      limit: 100
    });
    
    console.log('API响应状态:', response.status);
    console.log('Zero-Lag MACD信号结果:');
    
    if (response.data.success) {
      const signals = response.data.signals;
      signals.forEach(signal => {
        console.log(`\n指标: ${signal.indicator}`);
        console.log(`信号类型: ${signal.type}`);
        console.log(`信号强度: ${signal.strength}`);
        console.log(`信号消息: ${signal.message}`);
        console.log('指标值:', signal.values);
      });
    } else {
      console.error('API返回错误:', response.data.error);
    }
  } catch (error) {
    console.error('测试失败:', error.message);
    if (error.response) {
      console.error('错误详情:', error.response.data);
    }
  }
}

// 执行测试
testZeroLagMACD();