import { PriceData } from '../dataService';

// 信号类型
export enum SignalType {
  BUY = 'BUY',
  SELL = 'SELL',
  NEUTRAL = 'NEUTRAL'
}

// 信号强度
export enum SignalStrength {
  WEAK = 'WEAK',
  MEDIUM = 'MEDIUM',
  STRONG = 'STRONG'
}

// 信号结果接口
export interface SignalResult {
  type: SignalType;
  strength: SignalStrength;
  indicator: string;
  timestamp: number;
  values: Record<string, number>;
  message: string;
}

// 指标接口
export interface Indicator {
  // 指标名称
  name: string;
  
  // 计算指标值
  calculate(data: PriceData[]): Record<string, number[]>;
  
  // 检测信号
  detectSignal(data: PriceData[]): SignalResult;
}

// 指标工厂接口
export interface IndicatorFactory {
  // 创建指标实例
  createIndicator(params?: Record<string, any>): Indicator;
}