import { EMA } from 'technicalindicators';
import { Indicator, SignalResult, SignalType, SignalStrength } from './types';
import { PriceData } from '../dataService';

export interface ZeroLagMACDParams {
  fastPeriod: number;
  slowPeriod: number;
  signalPeriod: number;
  emaAlpha: number; // EMA平滑因子
}

export class ZeroLagMACD implements Indicator {
  name = 'Zero-Lag MACD';
  private params: ZeroLagMACDParams;

  constructor(params?: Partial<ZeroLagMACDParams>) {
    // 默认参数
    this.params = {
      fastPeriod: params?.fastPeriod || 12,
      slowPeriod: params?.slowPeriod || 26,
      signalPeriod: params?.signalPeriod || 9,
      emaAlpha: params?.emaAlpha || 0.7 // 默认平滑因子
    };
  }

  // 计算Zero-Lag EMA
  private calculateZeroLagEMA(prices: number[], period: number, alpha: number): number[] {
    // 首先计算普通EMA
    const emaValues = EMA.calculate({
      values: prices,
      period: period
    });

    // 计算Zero-Lag EMA
    const zeroLagEma: number[] = [];
    const paddingLength = prices.length - emaValues.length;

    // 填充前面的空值
    for (let i = 0; i < paddingLength; i++) {
      zeroLagEma.push(0);
    }

    // 计算Zero-Lag EMA值
    for (let i = 0; i < emaValues.length; i++) {
      const actualIndex = i + paddingLength;
      if (actualIndex >= 2 * period - 2) {
        // 应用Zero-Lag公式: EMA + alpha * (EMA - EMA of EMA)
        const emaOfEma = EMA.calculate({
          values: emaValues.slice(0, i + 1),
          period: period
        }).pop() || 0;
        
        const zeroLagValue = emaValues[i] + alpha * (emaValues[i] - emaOfEma);
        zeroLagEma.push(zeroLagValue);
      } else {
        // 对于前面的数据，使用普通EMA
        zeroLagEma.push(emaValues[i]);
      }
    }

    return zeroLagEma;
  }

  calculate(data: PriceData[]): Record<string, number[]> {
    const prices = data.map(candle => candle.close);
    
    // 计算快速和慢速Zero-Lag EMA
    const fastEMA = this.calculateZeroLagEMA(prices, this.params.fastPeriod, this.params.emaAlpha);
    const slowEMA = this.calculateZeroLagEMA(prices, this.params.slowPeriod, this.params.emaAlpha);
    
    // 确保两个数组长度相同
    const length = Math.min(fastEMA.length, slowEMA.length);
    const macdLine: number[] = [];
    
    // 计算MACD线
    for (let i = 0; i < length; i++) {
      macdLine.push(fastEMA[fastEMA.length - length + i] - slowEMA[slowEMA.length - length + i]);
    }
    
    // 计算信号线 (使用Zero-Lag EMA)
    const signalLine = this.calculateZeroLagEMA(macdLine, this.params.signalPeriod, this.params.emaAlpha);
    
    // 计算直方图
    const histogram: number[] = [];
    for (let i = 0; i < signalLine.length; i++) {
      histogram.push(macdLine[macdLine.length - signalLine.length + i] - signalLine[i]);
    }
    
    return {
      MACD: macdLine.slice(-signalLine.length),
      signal: signalLine,
      histogram: histogram
    };
  }

  detectSignal(data: PriceData[]): SignalResult {
    const result = this.calculate(data);
    const length = result.MACD.length;
    
    if (length < 2) {
      return {
        type: SignalType.NEUTRAL,
        strength: SignalStrength.WEAK,
        indicator: this.name,
        timestamp: Date.now(),
        values: {
          MACD: 0,
          signal: 0,
          histogram: 0
        },
        message: '数据不足，无法生成信号'
      };
    }

    // 获取最新的值
    const currentMACD = result.MACD[length - 1];
    const currentSignal = result.signal[length - 1];
    const currentHistogram = result.histogram[length - 1];
    
    // 获取前一个值
    const previousMACD = result.MACD[length - 2];
    const previousSignal = result.signal[length - 2];
    const previousHistogram = result.histogram[length - 2];

    let signalType = SignalType.NEUTRAL;
    let signalStrength = SignalStrength.WEAK;
    let message = '';

    // MACD穿越信号线判断
    if (previousMACD < previousSignal && currentMACD > currentSignal) {
      signalType = SignalType.BUY;
      message = 'Zero-Lag MACD上穿信号线，产生买入信号';
      
      // 判断信号强度
      const crossoverStrength = Math.abs(currentMACD - currentSignal);
      if (crossoverStrength > 0.5) {
        signalStrength = SignalStrength.STRONG;
      } else if (crossoverStrength > 0.2) {
        signalStrength = SignalStrength.MEDIUM;
      }
    } else if (previousMACD > previousSignal && currentMACD < currentSignal) {
      signalType = SignalType.SELL;
      message = 'Zero-Lag MACD下穿信号线，产生卖出信号';
      
      // 判断信号强度
      const crossoverStrength = Math.abs(currentMACD - currentSignal);
      if (crossoverStrength > 0.5) {
        signalStrength = SignalStrength.STRONG;
      } else if (crossoverStrength > 0.2) {
        signalStrength = SignalStrength.MEDIUM;
      }
    } else if (previousHistogram < 0 && currentHistogram > 0) {
      // 直方图由负转正
      signalType = SignalType.BUY;
      message = 'Zero-Lag MACD直方图由负转正，产生买入信号';
      signalStrength = SignalStrength.MEDIUM;
    } else if (previousHistogram > 0 && currentHistogram < 0) {
      // 直方图由正转负
      signalType = SignalType.SELL;
      message = 'Zero-Lag MACD直方图由正转负，产生卖出信号';
      signalStrength = SignalStrength.MEDIUM;
    } else {
      message = 'Zero-Lag MACD无明显信号';
    }

    return {
      type: signalType,
      strength: signalStrength,
      indicator: this.name,
      timestamp: data[data.length - 1].timestamp,
      values: {
        MACD: currentMACD,
        signal: currentSignal,
        histogram: currentHistogram
      },
      message
    };
  }
}

export class ZeroLagMACDFactory {
  createIndicator(params?: Record<string, any>): Indicator {
    return new ZeroLagMACD(params as Partial<ZeroLagMACDParams>);
  }
}