/*
 * @Author: Yorn Qiu
 * @Date: 2021-04-10 20:33:12
 * @LastEditors: Yorn Qiu
 * @LastEditTime: 2023-12-18 16:44:26
 * @FilePath: /vue3-ts-template/src/directives/index.ts
 * @Description: common vue directives
 */

import type { Directive, DirectiveBinding } from 'vue';

/**
 * v-focus
 * 自动聚焦元素
 */
export const vFocus: Directive = {
  mounted(el: HTMLElement) {
    el.focus();
  },
};

/**
 * v-copy="text"
 * 单击或双击复制文本内容
 */
interface CopyElement extends HTMLElement {
  handler: () => void;
  $value: string;
}

export const vCopy: Directive = {
  mounted(el: CopyElement, { value, modifiers }: DirectiveBinding) {
    el.$value = value;
    el.handler = () => {
      if (!el.$value) {
        console.log('无复制内容');
        return false;
      }
      // 动态创建 textarea 标签
      const textarea = document.createElement('textarea');
      // 将该 textarea 设为 readonly 防止 iOS 下自动唤起键盘，同时将 textarea 移出可视区域
      textarea.readOnly = true;
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      // 将要 copy 的值赋给 textarea 标签的 value 属性
      textarea.value = el.$value;
      // 将 textarea 插入到 body 中
      document.body.appendChild(textarea);
      // 选中值并复制
      textarea.select();
      const result = document.execCommand('Copy');
      if (result) {
        console.log('复制成功');
      }
      document.body.removeChild(textarea);
    };

    // 绑定事件
    const events = ['click', 'dblclick'];
    let evt = 'click';
    if (modifiers) {
      for (const e of events) {
        if (modifiers[e]) {
          evt = e;
          break;
        }
      }
    }
    el.addEventListener(evt, el.handler);
  },
  // 当传进来的值更新的时候触发
  updated(el: CopyElement, { value }: DirectiveBinding) {
    el.$value = value;
  },
  // 指令与元素解绑的时候，移除事件绑定
  unmounted(el: CopyElement) {
    el.removeEventListener('click', el.handler);
  },
};

/**
 * v-debounce.event:[time]="handler", event为事件类型，默认mouseup，可为空，可选keyup；time为间隔时间，默认800，可为空
 * 防抖
 */
export const vDebounce: Directive = {
  mounted(el: HTMLElement, { arg, modifiers, value }: DirectiveBinding) {
    let timer: number;
    const time = arg ? parseInt(arg) : 800;
    const event = modifiers.keyup ? 'keyup' : 'mouseup';
    el.addEventListener(event, () => {
      timer && clearTimeout(timer);
      timer = window.setTimeout(() => {
        value();
      }, time);
    });
  },
};

/**
 * 图钉
 */
type PositionType = 'top' | 'bottom' | 'left' | 'right';

export const vPin: Directive = (el: HTMLElement, { arg = 'top', value = 0 }: DirectiveBinding): void => {
  el.style.position = 'fixed';
  el.style[arg as PositionType] = value + 'px';
};
