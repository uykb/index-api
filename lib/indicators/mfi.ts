import { MFI as TechnicalMFI } from 'technicalindicators';
import { Indicator, SignalResult, SignalType, SignalStrength } from './types';
import { PriceData } from '../dataService';

export interface MFIParams {
  period: number;
  overboughtThreshold: number;
  oversoldThreshold: number;
}

export class MFI implements Indicator {
  name = 'MFI';
  private params: MFIParams;

  constructor(params?: Partial<MFIParams>) {
    // 默认参数
    this.params = {
      period: params?.period || 14,
      overboughtThreshold: params?.overboughtThreshold || 80,
      oversoldThreshold: params?.oversoldThreshold || 20
    };
  }

  calculate(data: PriceData[]): Record<string, number[]> {
    if (data.length < this.params.period) {
      return {
        mfi: []
      };
    }

    const input = {
      high: data.map(candle => candle.high),
      low: data.map(candle => candle.low),
      close: data.map(candle => candle.close),
      volume: data.map(candle => candle.volume),
      period: this.params.period
    };

    const result = TechnicalMFI.calculate(input);
    
    // 填充前面的空值，使结果长度与输入数据相同
    const offset = data.length - result.length;
    const filledResult = Array(offset).fill(null).concat(result);

    return {
      mfi: filledResult
    };
  }

  detectSignal(data: PriceData[]): SignalResult {
    const result = this.calculate(data);
    const length = result.mfi.length;
    
    if (length < 2) {
      return {
        type: SignalType.NEUTRAL,
        strength: SignalStrength.WEAK,
        indicator: this.name,
        timestamp: Date.now(),
        values: {
          mfi: 0
        },
        message: '数据不足，无法生成信号'
      };
    }

    // 获取最新的值
    const currentMFI = result.mfi[length - 1];
    // 获取前一个值
    const previousMFI = result.mfi[length - 2];

    let signalType = SignalType.NEUTRAL;
    let signalStrength = SignalStrength.WEAK;
    let message = '';

    // MFI超买超卖判断
    if (currentMFI < this.params.oversoldThreshold) {
      signalType = SignalType.BUY;
      message = `MFI处于超卖区域 (${currentMFI.toFixed(2)})，产生买入信号`;
      
      // 判断信号强度
      if (currentMFI < this.params.oversoldThreshold - 10) {
        signalStrength = SignalStrength.STRONG;
      } else if (currentMFI < this.params.oversoldThreshold - 5) {
        signalStrength = SignalStrength.MEDIUM;
      }
    } else if (currentMFI > this.params.overboughtThreshold) {
      signalType = SignalType.SELL;
      message = `MFI处于超买区域 (${currentMFI.toFixed(2)})，产生卖出信号`;
      
      // 判断信号强度
      if (currentMFI > this.params.overboughtThreshold + 10) {
        signalStrength = SignalStrength.STRONG;
      } else if (currentMFI > this.params.overboughtThreshold + 5) {
        signalStrength = SignalStrength.MEDIUM;
      }
    } else if (previousMFI < this.params.oversoldThreshold && currentMFI >= this.params.oversoldThreshold) {
      // 从超卖区域回升
      signalType = SignalType.BUY;
      message = `MFI从超卖区域回升 (${currentMFI.toFixed(2)})，产生买入信号`;
      signalStrength = SignalStrength.MEDIUM;
    } else if (previousMFI > this.params.overboughtThreshold && currentMFI <= this.params.overboughtThreshold) {
      // 从超买区域回落
      signalType = SignalType.SELL;
      message = `MFI从超买区域回落 (${currentMFI.toFixed(2)})，产生卖出信号`;
      signalStrength = SignalStrength.MEDIUM;
    } else {
      message = `MFI当前值: ${currentMFI.toFixed(2)}，无明显信号`;
    }

    return {
      type: signalType,
      strength: signalStrength,
      indicator: this.name,
      timestamp: data[data.length - 1].timestamp,
      values: {
        mfi: currentMFI
      },
      message
    };
  }
}

export class MFIFactory {
  createIndicator(params?: Record<string, any>): Indicator {
    return new MFI(params as Partial<MFIParams>);
  }
}