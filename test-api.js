// 测试API的简单脚本
// 可以使用Node.js运行: node test-api.js

const https = require('https');

// 替换为你的Vercel部署URL
const API_URL = 'https://your-vercel-app.vercel.app/api/detect';

// 请求参数
const requestData = {
  symbol: 'BTCUSDT',
  timeframe: '1h',
  exchange: 'binance',
  indicators: ['macd', 'kdj'],
  limit: 100
};

// 创建请求选项
const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

// 发送请求
const req = https.request(API_URL, options, (res) => {
  let data = '';

  // 接收数据
  res.on('data', (chunk) => {
    data += chunk;
  });

  // 数据接收完成
  res.on('end', () => {
    console.log('状态码:', res.statusCode);
    console.log('响应头:', res.headers);
    
    try {
      const jsonData = JSON.parse(data);
      console.log('响应数据:', JSON.stringify(jsonData, null, 2));
      
      // 检查信号
      if (jsonData.success && jsonData.signals) {
        console.log('\n检测到的信号:');
        jsonData.signals.forEach(signal => {
          console.log(`- ${signal.indicator}: ${signal.type} (${signal.strength}) - ${signal.message}`);
        });
      }
    } catch (e) {
      console.error('解析响应数据失败:', e.message);
      console.log('原始响应:', data);
    }
  });
});

// 处理请求错误
req.on('error', (error) => {
  console.error('请求失败:', error.message);
});

// 发送请求数据
req.write(JSON.stringify(requestData));
req.end();

console.log('发送API请求...');