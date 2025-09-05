// 测试获取历史指定时间价格的功能
const axios = require('axios');

// 测试配置
const API_URL = 'http://localhost:3000/api/price';
const SYMBOL = 'BTCUSDT';
const TIMEFRAME = '1h';

// 获取当前时间戳
const now = Date.now();
// 计算1小时前的时间戳 (使用较短的时间范围以减少超时风险)
const oneHourAgo = now - (1 * 60 * 60 * 1000);
// 计算3小时前的时间戳
const threeHoursAgo = now - (3 * 60 * 60 * 1000);

async function testHistoricalPrice() {
  console.log('开始测试获取历史价格数据功能...');
  
  try {
    // 测试1: 获取最近1小时的价格数据
    console.log('\n测试1: 获取最近1小时的价格数据');
    const response1 = await axios.post(API_URL, {
      symbol: SYMBOL,
      timeframe: '1m', // 使用1分钟K线以获取更多数据点
      startTime: oneHourAgo,
      limit: 10
    });
    
    if (response1.data.success) {
      console.log(`成功获取 ${response1.data.prices.length} 条价格数据`);
      console.log(`第一条数据时间: ${new Date(response1.data.prices[0].timestamp).toLocaleString()}`);
      console.log(`最后一条数据时间: ${new Date(response1.data.prices[response1.data.prices.length - 1].timestamp).toLocaleString()}`);
    } else {
      console.error('测试1失败:', response1.data.error);
    }
    
    // 测试2: 获取指定时间范围的价格数据
    console.log('\n测试2: 获取指定时间范围的价格数据');
    const response2 = await axios.post(API_URL, {
      symbol: SYMBOL,
      timeframe: '5m', // 使用5分钟K线
      startTime: threeHoursAgo,
      endTime: oneHourAgo,
      limit: 10
    });
    
    if (response2.data.success) {
      console.log(`成功获取 ${response2.data.prices.length} 条价格数据`);
      console.log(`第一条数据时间: ${new Date(response2.data.prices[0].timestamp).toLocaleString()}`);
      console.log(`最后一条数据时间: ${new Date(response2.data.prices[response2.data.prices.length - 1].timestamp).toLocaleString()}`);
    } else {
      console.error('测试2失败:', response2.data.error);
    }
    
    // 测试3: 获取单条最新价格数据
    console.log('\n测试3: 获取单条最新价格数据');
    const response3 = await axios.post(API_URL, {
      symbol: SYMBOL,
      timeframe: '1m',  // 使用1分钟K线
      limit: 1 // 只获取1条数据
    });
    
    if (response3.data.success) {
      console.log(`成功获取 ${response3.data.prices.length} 条日线价格数据`);
      console.log('日线数据示例:');
      response3.data.prices.forEach((price, index) => {
        console.log(`${index + 1}. ${new Date(price.timestamp).toLocaleDateString()} - 开盘: ${price.open}, 收盘: ${price.current}, 最高: ${price.high}, 最低: ${price.low}`);
      });
    } else {
      console.error('测试3失败:', response3.data.error);
    }
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
    if (error.response) {
      console.error('服务器响应:', error.response.data);
    }
  }
}

// 执行测试
testHistoricalPrice();