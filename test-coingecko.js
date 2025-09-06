const axios = require('axios');

// 测试CoinGecko API集成
async function testCoinGeckoIntegration() {
  console.log('开始测试CoinGecko API集成...');
  
  try {
    // 测试1: 直接调用CoinGecko OHLC API
    console.log('\n1. 测试直接调用CoinGecko OHLC API:');
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/bitcoin/ohlc', {
      params: {
        vs_currency: 'usd',
        days: 1
      }
    });
    
    console.log('CoinGecko API响应成功!');
    console.log('数据点数量:', response.data.length);
    if (response.data.length > 0) {
      const latest = response.data[response.data.length - 1];
      console.log('最新数据:', {
        timestamp: new Date(latest[0]),
        open: latest[1],
        high: latest[2],
        low: latest[3],
        close: latest[4]
      });
    }
    
    // 测试2: 测试本地价格API
    console.log('\n2. 测试本地价格API (使用CoinGecko):');
    const priceResponse = await axios.get('http://localhost:3000/api/price', {
      params: {
        symbol: 'BTCUSDT',
        exchange: 'coingecko',
        timeframe: '1h',
        limit: 5
      }
    });
    
    console.log('本地价格API响应成功!');
    console.log('返回数据:', JSON.stringify(priceResponse.data, null, 2));
    
    // 测试3: 测试信号检测API
    console.log('\n3. 测试信号检测API (使用CoinGecko):');
    const detectResponse = await axios.post('http://localhost:3000/api/detect', {
      symbol: 'BTCUSDT',
      exchange: 'coingecko',
      timeframe: '1h',
      indicators: ['RSI', 'MACD'],
      limit: 50
    });
    
    console.log('信号检测API响应成功!');
    console.log('检测到的信号数量:', detectResponse.data.signals.length);
    detectResponse.data.signals.forEach(signal => {
      console.log(`${signal.indicator}: ${signal.type} (${signal.strength}) - ${signal.message}`);
    });
    
    console.log('\n✅ 所有测试通过! CoinGecko集成成功!');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

// 运行测试
testCoinGeckoIntegration();