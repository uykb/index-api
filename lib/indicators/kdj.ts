import { Indicator, SignalResult, SignalType, SignalStrength } from './types';
import { PriceData } from '../dataService';
import { SMA } from 'technicalindicators';

export interface KDJParams {
  period: number;
  signalPeriod: number;
}

export class KDJ implements Indicator {
  name = 'KDJ';
  private params: KDJParams;

  constructor(params?: Partial<KDJParams>) {
    // 默认参数
    this.params = {
      period: params?.period || 14,
      signalPeriod: params?.signalPeriod || 3
    };
  }

  calculate(data: PriceData[]): Record<string, number[]> {
    const period = this.params.period;
    const signalPeriod = this.params.signalPeriod;
    
    if (data.length < period) {
      return { K: [], D: [], J: [] };
    }

    // 计算最高价和最低价
    const highPrices = data.map(candle => candle.high);
    const lowPrices = data.map(candle => candle.low);
    const closePrices = data.map(candle => candle.close);
    
    // 计算RSV
    const rsv: number[] = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const periodHigh = Math.max(...highPrices.slice(i - period + 1, i + 1));
      const periodLow = Math.min(...lowPrices.slice(i - period + 1, i + 1));
      const close = closePrices[i];
      
      // 计算RSV值 (0-100)
      if (periodHigh === periodLow) {
        rsv.push(50); // 如果最高价等于最低价，设置为50
      } else {
        rsv.push(((close - periodLow) / (periodHigh - periodLow)) * 100);
      }
    }
    
    // 计算K值 (第一个K值等于第一个RSV值)
    const kValues: number[] = [];
    kValues.push(rsv[0]);
    
    for (let i = 1; i < rsv.length; i++) {
      const k = (2/3) * kValues[i-1] + (1/3) * rsv[i];
      kValues.push(k);
    }
    
    // 计算D值 (第一个D值等于第一个K值)
    const dValues: number[] = [];
    dValues.push(kValues[0]);
    
    for (let i = 1; i < kValues.length; i++) {
      const d = (2/3) * dValues[i-1] + (1/3) * kValues[i];
      dValues.push(d);
    }
    
    // 计算J值
    const jValues: number[] = [];
    
    for (let i = 0; i < kValues.length; i++) {
      const j = 3 * kValues[i] - 2 * dValues[i];
      jValues.push(j);
    }
    
    // 填充前面的空值
    const paddingLength = period - 1;
    const paddedK = Array(paddingLength).fill(null).concat(kValues);
    const paddedD = Array(paddingLength).fill(null).concat(dValues);
    const paddedJ = Array(paddingLength).fill(null).concat(jValues);
    
    return {
      K: paddedK,
      D: paddedD,
      J: paddedJ
    };
  }

  detectSignal(data: PriceData[]): SignalResult {
    const result = this.calculate(data);
    const length = result.K.length;
    
    if (length < 2) {
      return {
        type: SignalType.NEUTRAL,
        strength: SignalStrength.WEAK,
        indicator: this.name,
        timestamp: Date.now(),
        values: {
          K: 0,
          D: 0,
          J: 0
        },
        message: '数据不足，无法生成信号'
      };
    }

    // 获取最新的值
    const currentK = result.K[length - 1] as number;
    const currentD = result.D[length - 1] as number;
    const currentJ = result.J[length - 1] as number;
    
    // 获取前一个值
    const previousK = result.K[length - 2] as number;
    const previousD = result.D[length - 2] as number;
    const previousJ = result.J[length - 2] as number;

    let signalType = SignalType.NEUTRAL;
    let signalStrength = SignalStrength.WEAK;
    let message = '';

    // 超买超卖判断
    if (currentK < 20 && currentD < 20) {
      signalType = SignalType.BUY;
      message = 'KDJ指标处于超卖区域，产生买入信号';
      signalStrength = SignalStrength.MEDIUM;
      
      // 如果J值也很低，信号更强
      if (currentJ < 10) {
        signalStrength = SignalStrength.STRONG;
        message = 'KDJ指标处于极度超卖区域，产生强烈买入信号';
      }
    } else if (currentK > 80 && currentD > 80) {
      signalType = SignalType.SELL;
      message = 'KDJ指标处于超买区域，产生卖出信号';
      signalStrength = SignalStrength.MEDIUM;
      
      // 如果J值也很高，信号更强
      if (currentJ > 90) {
        signalStrength = SignalStrength.STRONG;
        message = 'KDJ指标处于极度超买区域，产生强烈卖出信号';
      }
    }
    
    // 金叉死叉判断
    else if (previousK < previousD && currentK > currentD) {
      signalType = SignalType.BUY;
      message = 'KDJ金叉，K线上穿D线，产生买入信号';
      
      // 判断信号强度
      const crossoverStrength = Math.abs(currentK - currentD);
      if (crossoverStrength > 5) {
        signalStrength = SignalStrength.STRONG;
      } else if (crossoverStrength > 2) {
        signalStrength = SignalStrength.MEDIUM;
      }
    } else if (previousK > previousD && currentK < currentD) {
      signalType = SignalType.SELL;
      message = 'KDJ死叉，K线下穿D线，产生卖出信号';
      
      // 判断信号强度
      const crossoverStrength = Math.abs(currentK - currentD);
      if (crossoverStrength > 5) {
        signalStrength = SignalStrength.STRONG;
      } else if (crossoverStrength > 2) {
        signalStrength = SignalStrength.MEDIUM;
      }
    } else {
      message = 'KDJ无明显信号';
    }

    return {
      type: signalType,
      strength: signalStrength,
      indicator: this.name,
      timestamp: data[data.length - 1].timestamp,
      values: {
        K: currentK,
        D: currentD,
        J: currentJ
      },
      message
    };
  }
}

export class KDJFactory {
  createIndicator(params?: Record<string, any>): Indicator {
    return new KDJ(params as Partial<KDJParams>);
  }
}