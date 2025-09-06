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
export type Exchange = 'binance' | 'huobi' | 'okex' | 'coingecko';

/**
 * 从CoinGecko获取OHLC数据
 * @param symbol 交易对，如 BTCUSDT (会转换为CoinGecko的coin ID)
 * @param timeframe 时间周期 (CoinGecko会自动选择合适的粒度)
 * @param limit 获取数量 (通过days参数控制)
 * @returns 价格数据数组
 */
export async function fetchCoinGeckoOHLC(
  symbol: string,
  timeframe: Timeframe,
  limit: number = 100
): Promise<PriceData[]> {
  try {
    // 将交易对符号转换为CoinGecko的coin ID
    const coinId = convertSymbolToCoinGeckoId(symbol);
    
    // 根据timeframe和limit计算需要的天数
    const days = calculateDaysFromTimeframe(timeframe, limit);
    
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc`,
      {
        params: {
          vs_currency: 'usd',
          days: days
        }
      }
    );

    // 转换CoinGecko OHLC数据格式
    // CoinGecko返回格式: [[timestamp, open, high, low, close], ...]
    return response.data.map((ohlc: any) => ({
      timestamp: ohlc[0],
      open: ohlc[1],
      high: ohlc[2],
      low: ohlc[3],
      close: ohlc[4],
      volume: 0 // CoinGecko OHLC端点不包含volume数据
    })).slice(-limit); // 只返回最后limit条数据
  } catch (error) {
    console.error('获取CoinGecko数据失败:', error);
    throw new Error(`获取CoinGecko数据失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 将交易对符号转换为CoinGecko的coin ID
 * @param symbol 交易对符号，如 BTCUSDT
 * @returns CoinGecko coin ID
 */
function convertSymbolToCoinGeckoId(symbol: string): string {
  // 移除USDT后缀并转换为小写
  const baseSymbol = symbol.replace(/USDT$/i, '').toLowerCase();
  
  // 常见币种映射
  const symbolMap: Record<string, string> = {
    'btc': 'bitcoin',
    'eth': 'ethereum',
    'bnb': 'binancecoin',
    'ada': 'cardano',
    'dot': 'polkadot',
    'link': 'chainlink',
    'ltc': 'litecoin',
    'bch': 'bitcoin-cash',
    'xlm': 'stellar',
    'vet': 'vechain',
    'trx': 'tron',
    'eos': 'eos',
    'xmr': 'monero',
    'xtz': 'tezos',
    'atom': 'cosmos',
    'neo': 'neo',
    'mkr': 'maker',
    'dash': 'dash',
    'etc': 'ethereum-classic',
    'zec': 'zcash'
  };
  
  return symbolMap[baseSymbol] || baseSymbol;
}

/**
 * 根据时间周期和数量计算需要的天数
 * @param timeframe 时间周期
 * @param limit 数据点数量
 * @returns 天数
 */
function calculateDaysFromTimeframe(timeframe: Timeframe, limit: number): number {
  const timeframeMinutes: Record<Timeframe, number> = {
    '1m': 1,
    '5m': 5,
    '15m': 15,
    '30m': 30,
    '1h': 60,
    '4h': 240,
    '1d': 1440,
    '1w': 10080
  };
  
  const totalMinutes = timeframeMinutes[timeframe] * limit;
  const days = Math.ceil(totalMinutes / 1440); // 转换为天数
  
  // CoinGecko限制最大天数
  return Math.min(days, 365);
}

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
    case 'coingecko':
      return fetchCoinGeckoOHLC(symbol, timeframe, limit);
    // 可以在此添加其他交易所的支持
    default:
      throw new Error(`不支持的交易所: ${exchange}`);
  }
}