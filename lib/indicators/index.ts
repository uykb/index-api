import { Indicator, IndicatorFactory } from './types';
import { MACD, MACDFactory } from './macd';
import { KDJ, KDJFactory } from './kdj';
import { ZeroLagMACD, ZeroLagMACDFactory } from './zeroLagMacd';
import { RSI, RSIFactory } from './rsi';
import { ADX, ADXFactory } from './adx';
import { OBV, OBVFactory } from './obv';
import { MFI, MFIFactory } from './mfi';


// 指标注册表
class IndicatorRegistry {
  private factories: Map<string, IndicatorFactory> = new Map();

  // 注册指标工厂
  register(name: string, factory: IndicatorFactory): void {
    this.factories.set(name.toLowerCase(), factory);
  }

  // 获取指标工厂
  getFactory(name: string): IndicatorFactory | undefined {
    return this.factories.get(name.toLowerCase());
  }

  // 创建指标实例
  createIndicator(name: string, params?: Record<string, any>): Indicator {
    const factory = this.getFactory(name.toLowerCase());
    if (!factory) {
      throw new Error(`未找到指标: ${name}`);
    }
    return factory.createIndicator(params);
  }

  // 获取所有支持的指标名称
  getSupportedIndicators(): string[] {
    return Array.from(this.factories.keys());
  }
}

// 创建全局指标注册表实例
const registry = new IndicatorRegistry();

// 注册内置指标
registry.register('macd', new MACDFactory());
registry.register('kdj', new KDJFactory());
registry.register('zerolagmacd', new ZeroLagMACDFactory());
registry.register('rsi', new RSIFactory());
registry.register('adx', new ADXFactory());
registry.register('obv', new OBVFactory());
registry.register('mfi', new MFIFactory());


export { registry };
export * from './types';
export * from './macd';
export * from './kdj';
export * from './zeroLagMacd';
export * from './rsi';
export * from './adx';
export * from './obv';
export * from './mfi';