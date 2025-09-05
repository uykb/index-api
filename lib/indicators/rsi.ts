import { RSI as TechnicalRSI } from 'technicalindicators';
import { Indicator, SignalResult, SignalType, SignalStrength } from './types';
import { PriceData } from '../dataService';

export interface RSIParams {
  period: number;
  overboughtThreshold: number;
  oversoldThreshold: number;
}

export class RSI implements Indicator {
  name = 'RSI';
  private params: RSIParams;

  constructor(params?: Partial<RSIParams>) {
    // 默认参数
    this.params = {
      period: params?.period || 14,
      overboughtThreshold: params?.overboughtThreshold || 70,
      oversoldThreshold: params?.oversoldThreshold || 30
    };
  }

  calculate(data: PriceData[]): Record<string, number[]> {
    const prices = data.map(candle => candle.close);
    
    const input = {
      values: prices,
      period: this.params.period
    };

    const result = TechnicalRSI.calculate(input);
    
    // 填充前面的空值，使结果长度与输入数据相同
    const filledResult = Array(prices.length - result.length).fill(null).concat(result);

    return {
      rsi: filledResult
    };
  }

  detectSignal(data: PriceData[]): SignalResult {
    const result = this.calculate(data);
    const length = result.rsi.length;
    
    if (length < 2) {
      return {
        type: SignalType.NEUTRAL,
        strength: SignalStrength.WEAK,
        indicator: this.name,
        timestamp: Date.now(),
        values: {
          rsi: 0
        },
        message: '数据不足，无法生成信号'
      };
    }

    // 获取最新的值
    const currentRSI = result.rsi[length - 1];
    // 获取前一个值
    const previousRSI = result.rsi[length - 2];

    let signalType = SignalType.NEUTRAL;
    let signalStrength = SignalStrength.WEAK;
    let message = '';

    // RSI超买超卖判断
    if (currentRSI < this.params.oversoldThreshold) {
      signalType = SignalType.BUY;
      message = `RSI处于超卖区域 (${currentRSI.toFixed(2)})，产生买入信号`;
      
      // 判断信号强度
      if (currentRSI < this.params.oversoldThreshold - 10) {
        signalStrength = SignalStrength.STRONG;
      } else if (currentRSI < this.params.oversoldThreshold - 5) {
        signalStrength = SignalStrength.MEDIUM;
      }
    } else if (currentRSI > this.params.overboughtThreshold) {
      signalType = SignalType.SELL;
      message = `RSI处于超买区域 (${currentRSI.toFixed(2)})，产生卖出信号`;
      
      // 判断信号强度
      if (currentRSI > this.params.overboughtThreshold + 10) {
        signalStrength = SignalStrength.STRONG;
      } else if (currentRSI > this.params.overboughtThreshold + 5) {
        signalStrength = SignalStrength.MEDIUM;
      }
    } else if (previousRSI < this.params.oversoldThreshold && currentRSI >= this.params.oversoldThreshold) {
      // 从超卖区域回升
      signalType = SignalType.BUY;
      message = `RSI从超卖区域回升 (${currentRSI.toFixed(2)})，产生买入信号`;
      signalStrength = SignalStrength.MEDIUM;
    } else if (previousRSI > this.params.overboughtThreshold && currentRSI <= this.params.overboughtThreshold) {
      // 从超买区域回落
      signalType = SignalType.SELL;
      message = `RSI从超买区域回落 (${currentRSI.toFixed(2)})，产生卖出信号`;
      signalStrength = SignalStrength.MEDIUM;
    } else {
      message = `RSI当前值: ${currentRSI.toFixed(2)}，无明显信号`;
    }

    return {
      type: signalType,
      strength: signalStrength,
      indicator: this.name,
      timestamp: data[data.length - 1].timestamp,
      values: {
        rsi: currentRSI
      },
      message
    };
  }
}

export class RSIFactory {
  createIndicator(params?: Record<string, any>): Indicator {
    return new RSI(params as Partial<RSIParams>);
  }
}