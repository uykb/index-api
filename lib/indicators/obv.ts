import { OBV as TechnicalOBV } from 'technicalindicators';
import { Indicator, SignalResult, SignalType, SignalStrength } from './types';
import { PriceData } from '../dataService';

export interface OBVParams {
  emaPeriod: number; // 用于计算OBV的EMA周期
}

export class OBV implements Indicator {
  name = 'OBV';
  private params: OBVParams;

  constructor(params?: Partial<OBVParams>) {
    // 默认参数
    this.params = {
      emaPeriod: params?.emaPeriod || 20
    };
  }

  calculate(data: PriceData[]): Record<string, number[]> {
    if (data.length < 2) {
      return {
        obv: [],
        obvEma: []
      };
    }

    const input = {
      close: data.map(candle => candle.close),
      volume: data.map(candle => candle.volume)
    };

    const obvValues = TechnicalOBV.calculate(input);
    
    // 计算OBV的EMA
    const obvEmaValues = this.calculateEMA(obvValues, this.params.emaPeriod);
    
    return {
      obv: obvValues,
      obvEma: obvEmaValues
    };
  }

  // 计算EMA
  private calculateEMA(data: number[], period: number): number[] {
    const k = 2 / (period + 1);
    const emaValues: number[] = [];
    
    // 初始化EMA为第一个值
    let ema = data[0];
    emaValues.push(ema);
    
    // 计算剩余的EMA值
    for (let i = 1; i < data.length; i++) {
      ema = data[i] * k + ema * (1 - k);
      emaValues.push(ema);
    }
    
    return emaValues;
  }

  detectSignal(data: PriceData[]): SignalResult {
    const result = this.calculate(data);
    const length = result.obv.length;
    
    if (length < 2) {
      return {
        type: SignalType.NEUTRAL,
        strength: SignalStrength.WEAK,
        indicator: this.name,
        timestamp: Date.now(),
        values: {
          obv: 0,
          obvEma: 0
        },
        message: '数据不足，无法生成信号'
      };
    }

    // 获取最新的值
    const currentOBV = result.obv[length - 1];
    const currentOBVEma = result.obvEma[length - 1];
    
    // 获取前一个值
    const previousOBV = result.obv[length - 2];
    const previousOBVEma = result.obvEma[length - 2];

    let signalType = SignalType.NEUTRAL;
    let signalStrength = SignalStrength.WEAK;
    let message = '';

    // OBV与其EMA的交叉判断
    if (previousOBV < previousOBVEma && currentOBV > currentOBVEma) {
      signalType = SignalType.BUY;
      message = 'OBV上穿其EMA，表明成交量增加，产生买入信号';
      
      // 判断信号强度
      const crossoverStrength = Math.abs(currentOBV - currentOBVEma) / Math.abs(currentOBVEma) * 100;
      if (crossoverStrength > 5) {
        signalStrength = SignalStrength.STRONG;
      } else if (crossoverStrength > 2) {
        signalStrength = SignalStrength.MEDIUM;
      }
    } else if (previousOBV > previousOBVEma && currentOBV < currentOBVEma) {
      signalType = SignalType.SELL;
      message = 'OBV下穿其EMA，表明成交量减少，产生卖出信号';
      
      // 判断信号强度
      const crossoverStrength = Math.abs(currentOBV - currentOBVEma) / Math.abs(currentOBVEma) * 100;
      if (crossoverStrength > 5) {
        signalStrength = SignalStrength.STRONG;
      } else if (crossoverStrength > 2) {
        signalStrength = SignalStrength.MEDIUM;
      }
    } else if (currentOBV > previousOBV && data[data.length - 1].close > data[data.length - 2].close) {
      // OBV上升且价格上升，确认上升趋势
      signalType = SignalType.BUY;
      message = 'OBV上升且价格上升，确认上升趋势';
      signalStrength = SignalStrength.MEDIUM;
    } else if (currentOBV < previousOBV && data[data.length - 1].close < data[data.length - 2].close) {
      // OBV下降且价格下降，确认下降趋势
      signalType = SignalType.SELL;
      message = 'OBV下降且价格下降，确认下降趋势';
      signalStrength = SignalStrength.MEDIUM;
    } else if (currentOBV > previousOBV && data[data.length - 1].close < data[data.length - 2].close) {
      // OBV上升但价格下降，可能是底部信号
      signalType = SignalType.BUY;
      message = 'OBV上升但价格下降，可能是底部信号';
      signalStrength = SignalStrength.WEAK;
    } else if (currentOBV < previousOBV && data[data.length - 1].close > data[data.length - 2].close) {
      // OBV下降但价格上升，可能是顶部信号
      signalType = SignalType.SELL;
      message = 'OBV下降但价格上升，可能是顶部信号';
      signalStrength = SignalStrength.WEAK;
    } else {
      message = 'OBV无明显信号';
    }

    return {
      type: signalType,
      strength: signalStrength,
      indicator: this.name,
      timestamp: data[data.length - 1].timestamp,
      values: {
        obv: currentOBV,
        obvEma: currentOBVEma
      },
      message
    };
  }
}

export class OBVFactory {
  createIndicator(params?: Record<string, any>): Indicator {
    return new OBV(params as Partial<OBVParams>);
  }
}