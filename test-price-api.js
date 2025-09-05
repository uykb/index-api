// 测试价格API的简单脚本
const axios = require('axios');

async function testPriceAPI() {
  try {
    console.log('测试实时价格API...');
    
    // 测试GET请求
    const getResponse = await axios.get('http://localhost:3000/api/price', {
      params: {
        symbol: 'BTCUSDT'
      }
    });
    
    console.log('GET请求响应状态:', getResponse.status);
    console.log('实时价格数据 (GET):', getResponse.data);
    
    // 测试POST请求
    const postResponse = await axios.post('http://localhost:3000/api/price', {
      symbol: 'ETHUSDT',
      timeframe: '1m',
      exchange: 'binance'
    });
    
    console.log('\nPOST请求响应状态:', postResponse.status);
    console.log('实时价格数据 (POST):', postResponse.data);
    
  } catch (error) {
    console.error('测试失败:', error.message);
    if (error.response) {
      console.error('错误详情:', error.response.data);
    }
  }
}

// 执行测试
testPriceAPI();