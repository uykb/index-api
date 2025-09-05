import axios from 'axios';

// 定义价格数据接口
export interface PriceData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// 支持的时间周期
export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w';

// 支持的交易所
export type Exchange = 'binance' | 'huobi' | 'okex';

/**
 * 从Binance获取K线数据
 * @param symbol 交易对，如 BTCUSDT
 * @param timeframe 时间周期
 * @param limit 获取数量
 * @param startTime 开始时间戳（毫秒）
 * @param endTime 结束时间戳（毫秒）
 * @returns 价格数据数组
 */
export async function fetchBinanceKlines(
  symbol: string,
  timeframe: Timeframe,
  limit: number = 100,
  startTime?: number,
  endTime?: number
): Promise<PriceData[]> {
  try {
    const params: any = {
      symbol: symbol.toUpperCase(),
      interval: timeframe,
      limit
    };
    
    // 添加开始时间和结束时间参数（如果提供）
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;
    
    const response = await axios.get(
      `https://api.binance.com/api/v3/klines`,
      { params }
    );

    // 转换Binance K线数据格式
    return response.data.map((kline: any) => ({
      timestamp: kline[0],
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5])
    }));
  } catch (error) {
    console.error('获取Binance数据失败:', error);
    throw new Error(`获取Binance数据失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 获取价格数据的工厂函数
 * @param exchange 交易所
 * @param symbol 交易对
 * @param timeframe 时间周期
 * @param limit 获取数量
 * @param startTime 开始时间戳（毫秒）
 * @param endTime 结束时间戳（毫秒）
 * @returns 价格数据数组
 */
export async function getPriceData(
  exchange: Exchange,
  symbol: string,
  timeframe: Timeframe,
  limit: number = 100,
  startTime?: number,
  endTime?: number
): Promise<PriceData[]> {
  switch (exchange) {
    case 'binance':
      return fetchBinanceKlines(symbol, timeframe, limit, startTime, endTime);
    // 可以在此添加其他交易所的支持
    default:
      throw new Error(`不支持的交易所: ${exchange}`);
  }
}