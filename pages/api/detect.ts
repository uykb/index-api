import type { NextApiRequest, NextApiResponse } from 'next';
import { getPriceData, Exchange, Timeframe } from '../../lib/dataService';
import { registry, SignalResult } from '../../lib/indicators';

type ErrorResponse = {
  error: string;
};

type SuccessResponse = {
  success: true;
  signals: SignalResult[];
  metadata: {
    symbol: string;
    timeframe: string;
    exchange: string;
    timestamp: number;
    indicators: string[];
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持POST请求' });
  }

  try {
    const { symbol, timeframe, exchange, indicators, limit } = req.body;

    // 验证必要参数
    if (!symbol) {
      return res.status(400).json({ error: '缺少交易对参数' });
    }

    // 设置默认值
    const tf = (timeframe || '1h') as Timeframe;
    const ex = (exchange || 'binance') as Exchange;
    const dataLimit = limit || 100;
    
    // 获取要检测的指标列表
    let indicatorList: string[] = [];
    if (indicators && Array.isArray(indicators)) {
      indicatorList = indicators;
    } else if (indicators && typeof indicators === 'string') {
      indicatorList = [indicators];
    } else {
      // 默认使用所有支持的指标
      indicatorList = registry.getSupportedIndicators();
    }

    // 获取价格数据
    const priceData = await getPriceData(ex, symbol, tf, dataLimit);
    
    if (!priceData || priceData.length === 0) {
      return res.status(404).json({ error: '未找到价格数据' });
    }

    // 计算每个指标的信号
    const signals: SignalResult[] = [];
    
    for (const indicatorName of indicatorList) {
      try {
        const indicator = registry.createIndicator(indicatorName);
        const signal = indicator.detectSignal(priceData);
        signals.push(signal);
      } catch (err) {
        console.error(`计算指标 ${indicatorName} 失败:`, err);
        // 继续处理其他指标
      }
    }

    // 返回结果
    return res.status(200).json({
      success: true,
      signals,
      metadata: {
        symbol,
        timeframe: tf,
        exchange: ex,
        timestamp: Date.now(),
        indicators: indicatorList
      }
    });
  } catch (error) {
    console.error('API错误:', error);
    return res.status(500).json({
      error: `处理请求时发生错误: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}