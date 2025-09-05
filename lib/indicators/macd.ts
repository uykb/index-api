import { MACD as TechnicalMACD } from 'technicalindicators';
import { Indicator, SignalResult, SignalType, SignalStrength } from './types';
import { PriceData } from '../dataService';

export interface MACDParams {
  fastPeriod: number;
  slowPeriod: number;
  signalPeriod: number;
  SimpleMAOscillator: boolean;
  SimpleMASignal: boolean;
}

export class MACD implements Indicator {
  name = 'MACD';
  private params: MACDParams;

  constructor(params?: Partial<MACDParams>) {
    // 默认参数
    this.params = {
      fastPeriod: params?.fastPeriod || 12,
      slowPeriod: params?.slowPeriod || 26,
      signalPeriod: params?.signalPeriod || 9,
      SimpleMAOscillator: params?.SimpleMAOscillator || false,
      SimpleMASignal: params?.SimpleMASignal || false
    };
  }

  calculate(data: PriceData[]): Record<string, number[]> {
    const prices = data.map(candle => candle.close);
    
    const input = {
      values: prices,
      fastPeriod: this.params.fastPeriod,
      slowPeriod: this.params.slowPeriod,
      signalPeriod: this.params.signalPeriod,
      SimpleMAOscillator: this.params.SimpleMAOscillator,
      SimpleMASignal: this.params.SimpleMASignal
    };

    const result = TechnicalMACD.calculate(input);
    
    // 提取MACD、信号线和直方图值
    const macdValues = result.map(item => item.MACD || 0);
    const signalValues = result.map(item => item.signal || 0);
    const histogramValues = result.map(item => item.histogram || 0);

    return {
      MACD: macdValues,
      signal: signalValues,
      histogram: histogramValues
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
      message = 'MACD上穿信号线，产生买入信号';
      
      // 判断信号强度
      const crossoverStrength = Math.abs(currentMACD - currentSignal);
      if (crossoverStrength > 0.5) {
        signalStrength = SignalStrength.STRONG;
      } else if (crossoverStrength > 0.2) {
        signalStrength = SignalStrength.MEDIUM;
      }
    } else if (previousMACD > previousSignal && currentMACD < currentSignal) {
      signalType = SignalType.SELL;
      message = 'MACD下穿信号线，产生卖出信号';
      
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
      message = 'MACD直方图由负转正，产生买入信号';
      signalStrength = SignalStrength.MEDIUM;
    } else if (previousHistogram > 0 && currentHistogram < 0) {
      // 直方图由正转负
      signalType = SignalType.SELL;
      message = 'MACD直方图由正转负，产生卖出信号';
      signalStrength = SignalStrength.MEDIUM;
    } else {
      message = 'MACD无明显信号';
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

export class MACDFactory {
  createIndicator(params?: Record<string, any>): Indicator {
    return new MACD(params as Partial<MACDParams>);
  }
}