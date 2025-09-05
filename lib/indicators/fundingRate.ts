import axios from 'axios';
import { Indicator, SignalResult, SignalType, SignalStrength } from './types';
import { PriceData } from '../dataService';

export interface FundingRateParams {
  highThreshold: number;  // 高资金费率阈值
  lowThreshold: number;   // 低资金费率阈值
}

export class FundingRate implements Indicator {
  name = 'FundingRate';
  private params: FundingRateParams;

  constructor(params?: Partial<FundingRateParams>) {
    // 默认参数
    this.params = {
      highThreshold: params?.highThreshold || 0.0005, // 0.05%
      lowThreshold: params?.lowThreshold || -0.0005   // -0.05%
    };
  }

  async fetchBinanceFundingRate(symbol: string): Promise<number> {
    try {
      const response = await axios.get(
        'https://fapi.binance.com/fapi/v1/premiumIndex',
        {
          params: {
            symbol: symbol.toUpperCase()
          }
        }
      );
      return parseFloat(response.data.lastFundingRate);
    } catch (error) {
      console.error('获取Binance资金费率失败:', error);
      throw new Error(`获取Binance资金费率失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // 由于资金费率需要实时获取，我们不使用历史价格数据计算
  calculate(data: PriceData[]): Record<string, number[]> {
    // 这个方法在这个指标中不会被直接使用，但需要实现接口
    return {
      fundingRate: [0] // 占位符
    };
  }

  async detectSignalAsync(symbol: string): Promise<SignalResult> {
    try {
      const currentRate = await this.fetchBinanceFundingRate(symbol);
      
      let signalType = SignalType.NEUTRAL;
      let signalStrength = SignalStrength.WEAK;
      let message = '';

      // 资金费率判断
      if (currentRate > this.params.highThreshold) {
        signalType = SignalType.SELL;
        message = `资金费率较高 (${(currentRate * 100).toFixed(4)}%)，做多成本增加，产生卖出信号`;
        
        // 判断信号强度
        if (currentRate > this.params.highThreshold * 2) {
          signalStrength = SignalStrength.STRONG;
        } else if (currentRate > this.params.highThreshold * 1.5) {
          signalStrength = SignalStrength.MEDIUM;
        }
      } else if (currentRate < this.params.lowThreshold) {
        signalType = SignalType.BUY;
        message = `资金费率较低 (${(currentRate * 100).toFixed(4)}%)，做空成本增加，产生买入信号`;
        
        // 判断信号强度
        if (currentRate < this.params.lowThreshold * 2) {
          signalStrength = SignalStrength.STRONG;
        } else if (currentRate < this.params.lowThreshold * 1.5) {
          signalStrength = SignalStrength.MEDIUM;
        }
      } else {
        message = `资金费率在正常范围 (${(currentRate * 100).toFixed(4)}%)，无明显信号`;
      }

      return {
        type: signalType,
        strength: signalStrength,
        indicator: this.name,
        timestamp: Date.now(),
        values: {
          fundingRate: currentRate
        },
        message
      };
    } catch (error) {
      return {
        type: SignalType.NEUTRAL,
        strength: SignalStrength.WEAK,
        indicator: this.name,
        timestamp: Date.now(),
        values: {
          fundingRate: 0
        },
        message: `获取资金费率失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  // 实现接口方法，但实际上我们会使用异步版本
  detectSignal(data: PriceData[]): SignalResult {
    return {
      type: SignalType.NEUTRAL,
      strength: SignalStrength.WEAK,
      indicator: this.name,
      timestamp: Date.now(),
      values: {
        fundingRate: 0
      },
      message: '资金费率需要实时获取，请使用detectSignalAsync方法'
    };
  }
}

export class FundingRateFactory {
  createIndicator(params?: Record<string, any>): Indicator {
    return new FundingRate(params as Partial<FundingRateParams>);
  }
}