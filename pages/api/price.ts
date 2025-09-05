import type { NextApiRequest, NextApiResponse } from 'next';
import { getPriceData, Exchange, Timeframe, PriceData } from '../../lib/dataService';

type ErrorResponse = {
  error: string;
};

type PriceItem = {
  current: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  timestamp: number;
};

type SuccessResponse = {
  success: true;
  prices: PriceItem[];
  metadata: {
    symbol: string;
    timeframe: string;
    exchange: string;
    timestamp: number;
    count: number;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  // 允许GET和POST请求
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: '只支持GET和POST请求' });
  }

  try {
    // 从查询参数或请求体中获取参数
    const params = req.method === 'GET' ? req.query : req.body;
    const { symbol, timeframe, exchange, startTime, endTime, limit } = params;

    // 验证必要参数
    if (!symbol) {
      return res.status(400).json({ error: '缺少交易对参数' });
    }

    // 设置默认值
    const tf = (timeframe || '1m') as Timeframe; // 默认使用1分钟K线以获取最新价格
    const ex = (exchange || 'binance') as Exchange;
    const dataLimit = limit ? parseInt(limit as string, 10) : 1; // 默认只获取1条数据
    
    // 处理时间戳参数
    let startTimeMs: number | undefined = undefined;
    let endTimeMs: number | undefined = undefined;
    
    if (startTime) {
      startTimeMs = typeof startTime === 'string' ? parseInt(startTime, 10) : undefined;
    }
    
    if (endTime) {
      endTimeMs = typeof endTime === 'string' ? parseInt(endTime, 10) : undefined;
    }
    
    // 获取价格数据
    const priceData = await getPriceData(ex, symbol, tf, dataLimit, startTimeMs, endTimeMs);
    
    if (!priceData || priceData.length === 0) {
      return res.status(404).json({ error: '未找到价格数据' });
    }

    // 格式化价格数据
    const prices = priceData.map(price => ({
      current: price.close,
      open: price.open,
      high: price.high,
      low: price.low,
      volume: price.volume,
      timestamp: price.timestamp
    }));

    // 返回结果
    return res.status(200).json({
      success: true,
      prices,
      metadata: {
        symbol: symbol as string,
        timeframe: tf,
        exchange: ex,
        timestamp: Date.now(),
        count: prices.length
      }
    });
  } catch (error) {
    console.error('API错误:', error);
    return res.status(500).json({
      error: `处理请求时发生错误: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}