import { ADX as TechnicalADX } from 'technicalindicators';
import { Indicator, SignalResult, SignalType, SignalStrength } from './types';
import { PriceData } from '../dataService';

export interface ADXParams {
  period: number;
  trendStrengthThreshold: number;
}

export class ADX implements Indicator {
  name = 'ADX';
  private params: ADXParams;

  constructor(params?: Partial<ADXParams>) {
    // 默认参数
    this.params = {
      period: params?.period || 14,
      trendStrengthThreshold: params?.trendStrengthThreshold || 25
    };
  }

  calculate(data: PriceData[]): Record<string, number[]> {
    if (data.length < this.params.period + 1) {
      return {
        adx: [],
        pdi: [],
        mdi: []
      };
    }

    const input = {
      high: data.map(candle => candle.high),
      low: data.map(candle => candle.low),
      close: data.map(candle => candle.close),
      period: this.params.period
    };

    const result = TechnicalADX.calculate(input);
    
    // 提取ADX、+DI和-DI值
    const adxValues = result.map(item => item.adx || 0);
    const pdiValues = result.map(item => item.pdi || 0);
    const mdiValues = result.map(item => item.mdi || 0);

    // 填充前面的空值，使结果长度与输入数据相同
    const offset = data.length - adxValues.length;
    const filledADX = Array(offset).fill(null).concat(adxValues);
    const filledPDI = Array(offset).fill(null).concat(pdiValues);
    const filledMDI = Array(offset).fill(null).concat(mdiValues);

    return {
      adx: filledADX,
      pdi: filledPDI,
      mdi: filledMDI
    };
  }

  detectSignal(data: PriceData[]): SignalResult {
    const result = this.calculate(data);
    const length = result.adx.length;
    
    if (length < 2) {
      return {
        type: SignalType.NEUTRAL,
        strength: SignalStrength.WEAK,
        indicator: this.name,
        timestamp: Date.now(),
        values: {
          adx: 0,
          pdi: 0,
          mdi: 0
        },
        message: '数据不足，无法生成信号'
      };
    }

    // 获取最新的值
    const currentADX = result.adx[length - 1];
    const currentPDI = result.pdi[length - 1];
    const currentMDI = result.mdi[length - 1];
    
    // 获取前一个值
    const previousADX = result.adx[length - 2];
    const previousPDI = result.pdi[length - 2];
    const previousMDI = result.mdi[length - 2];

    let signalType = SignalType.NEUTRAL;
    let signalStrength = SignalStrength.WEAK;
    let message = '';

    // 判断趋势强度
    const isTrendStrong = currentADX > this.params.trendStrengthThreshold;
    
    // +DI和-DI交叉判断
    if (previousPDI < previousMDI && currentPDI > currentMDI) {
      signalType = SignalType.BUY;
      message = '+DI上穿-DI，产生买入信号';
      
      // 判断信号强度
      if (isTrendStrong) {
        if (currentADX > this.params.trendStrengthThreshold + 10) {
          signalStrength = SignalStrength.STRONG;
          message += '，趋势强度强';
        } else {
          signalStrength = SignalStrength.MEDIUM;
          message += '，趋势强度中等';
        }
      } else {
        message += '，趋势强度弱';
      }
    } else if (previousPDI > previousMDI && currentPDI < currentMDI) {
      signalType = SignalType.SELL;
      message = '+DI下穿-DI，产生卖出信号';
      
      // 判断信号强度
      if (isTrendStrong) {
        if (currentADX > this.params.trendStrengthThreshold + 10) {
          signalStrength = SignalStrength.STRONG;
          message += '，趋势强度强';
        } else {
          signalStrength = SignalStrength.MEDIUM;
          message += '，趋势强度中等';
        }
      } else {
        message += '，趋势强度弱';
      }
    } else if (currentPDI > currentMDI && isTrendStrong && currentADX > previousADX) {
      // 上升趋势增强
      signalType = SignalType.BUY;
      message = 'ADX上升且+DI>-DI，上升趋势增强';
      signalStrength = currentADX > this.params.trendStrengthThreshold + 10 ? SignalStrength.STRONG : SignalStrength.MEDIUM;
    } else if (currentPDI < currentMDI && isTrendStrong && currentADX > previousADX) {
      // 下降趋势增强
      signalType = SignalType.SELL;
      message = 'ADX上升且+DI<-DI，下降趋势增强';
      signalStrength = currentADX > this.params.trendStrengthThreshold + 10 ? SignalStrength.STRONG : SignalStrength.MEDIUM;
    } else {
      message = `ADX: ${currentADX.toFixed(2)}, +DI: ${currentPDI.toFixed(2)}, -DI: ${currentMDI.toFixed(2)}，无明显信号`;
    }

    return {
      type: signalType,
      strength: signalStrength,
      indicator: this.name,
      timestamp: data[data.length - 1].timestamp,
      values: {
        adx: currentADX,
        pdi: currentPDI,
        mdi: currentMDI
      },
      message
    };
  }
}

export class ADXFactory {
  createIndicator(params?: Record<string, any>): Indicator {
    return new ADX(params as Partial<ADXParams>);
  }
}