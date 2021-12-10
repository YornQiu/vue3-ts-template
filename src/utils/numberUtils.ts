/*
 * @Author: YornQiu
 * @Date: 2020-12-03 16:44:42
 * @LastEditors: YornQiu
 * @LastEditTime: 2021-12-10 17:58:55
 * @Description: 数值格式化工具
 * @FilePath: /vue3-ts-template/src/utils/numberUtils.ts
 */

interface FormatOption {
  type?: 'num' | 'percent' | 'flowNum';
  deg?: number;
  kannma?: boolean;
  autoUnit?: boolean;
  unit?: keyof typeof formatUnit;
}

const formatUnit = {
  1: '',
  10000: '万',
  100000000: '亿',
  1000000000000: '万亿',
  1000: 'k',
  1000000: 'M',
  1000000000: 'G',
};

const numberUtils = {
  // 数值格式化的单位映射
  formatUnit,
  /**
   * @description 增加千分位
   * @param {number} value 数值
   * @param {number} deg 保留小数点位数，默认2位，小于0时保持原有的小数位数
   * @return {string}
   */
  addKannma(value: number, deg = 2): string {
    let num = `${value}`;
    num = num.replace(new RegExp(',', 'g'), '');
    // 正负号处理
    let symble = '';
    if (/^([-+]).*$/.test(num)) {
      symble = num.replace(/^([-+]).*$/, '$1');
      num = num.replace(/^([-+])(.*)$/, '$2');
    }

    if (/^[0-9]+(\.[0-9]+)?$/.test(num)) {
      num = num.replace(new RegExp('^[0]+', 'g'), '');
      if (/^\./.test(num)) {
        num = `0${num}`;
      }

      const decimal = num.replace(/^[0-9]+(\.[0-9]+)?$/, '$1');
      let integer = num.replace(/^([0-9]+)(\.[0-9]+)?$/, '$1');

      const re = /(\d+)(\d{3})/;

      while (re.test(integer)) {
        integer = integer.replace(re, '$1,$2');
      }
      const result = symble + integer + (decimal && decimal.length > 3 ? this.toFixed(parseFloat(decimal), deg).substring(1) : decimal);
      return result === '' ? '0' : result;
    }

    return `${value}`;
  },
  /**
   * @description 数值格式化
   * @param {number} value 数值
   * @param {object} option 格式化参数集合, 默认增加千分位,保留2位小数
   * @param {string} option.type 格式化类型 num 数值, percent 百分比, flowNum 容量
   * @param {number} option.deg 保留几位小数
   * @param {boolean} option.kannma 是否增加千分位
   * @param {boolean} option.autoUnit 是否自动进行数值单位换算
   * @param {number} option.unit 指定单位换算值
   * @return {string}
   */
  format(value: number, option: FormatOption): string {
    if (Number.isNaN(value) || value === Infinity || value === -Infinity || value === undefined || value === null) {
      return '-';
    }
    if (!Number.isNaN(value)) {
      if (!option) {
        option = {
          type: 'num',
          deg: 2,
          kannma: true,
        };
      }
      value = Number(value);
      const deg = option.deg || 0;

      if (option.type === 'num') {
        if (option.autoUnit) {
          const datum = 1;
          if (Math.abs(value / 10 ** 12) >= datum) {
            return `${this.toFixed(value / 10 ** 12, deg)}万亿`;
          }
          if (Math.abs(value / 10 ** 8) >= datum) {
            return `${this.toFixed(value / 10 ** 8, deg)}亿`;
          }
          if (Math.abs(value / 10 ** 4) >= datum) {
            return `${this.toFixed(value / 10 ** 4, deg)}万`;
          }
          return `${value}`;
        }

        let formatedValue;
        if (option.unit) {
          formatedValue = value / option.unit;
        }
        formatedValue = this.toFixed(value, deg);
        if (option.kannma) {
          formatedValue = this.addKannma(value, deg);
        }
        if (option.unit) {
          formatedValue += this.formatUnit[option.unit];
        }
        return formatedValue;
      }
      if (option.type === 'percent') {
        return `${this.toFixed(value * 100, deg)}%`;
      }
      if (option.type === 'flowNum') {
        const datum = 1;
        if (Math.abs(value / 1024 ** 4) >= datum) {
          return `${this.toFixed(value / 1024 ** 4, deg)}TB`;
        }
        if (Math.abs(value / 1024 ** 3) >= datum) {
          return `${this.toFixed(value / 1024 ** 3, deg)}GB`;
        }
        if (Math.abs(value / 1024 ** 2) >= datum) {
          return `${this.toFixed(value / 1024 ** 2, deg)}MB`;
        }
        if (Math.abs(value / 1024 ** 1) >= datum) {
          return `${this.toFixed(value / 1024 ** 1, deg)}KB`;
        }
        return `${value.toFixed(deg)}B`;
      }
    }
    return `${value}`;
  },
  /**
   * @description: 保留小数位，使用toFixed方法固定小数位数
   * @param {number} value 数值
   * @param {number} deg 位数，小于0时保持原有的小数位数
   * @return {string}
   */
  toFixed(value: number, deg: number): string {
    if (deg < 0) {
      return `${value}`;
    }
    let strNum = `${value}`;
    const match = strNum.match(/\.(\d+)/);
    if (match && match[1].length < deg) {
      for (let i = 0; i < deg - match[1].length; i += 1) {
        strNum += '0';
      }
      return strNum;
    }
    return value.toFixed(deg);
  },
  /**
   * @description: 金额类格式化，增加千分位并保留两位小数
   * @param {number} value 数值
   * @param {boolean} isPercent 是否为百分数
   * @param {object} option 其他适用于format的参数
   * @return {string} 格式化后的数值为String
   */
  financeFormat(value: number, isPercent = false, option: object): string {
    return this.format(value, {
      type: isPercent ? 'percent' : 'num',
      kannma: true,
      deg: 2,
      ...option,
    });
  },
};

export default numberUtils;
