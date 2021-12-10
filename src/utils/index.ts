/*
 * @Author: YornQiu
 * @Date: 2020-12-16 15:35:55
 * @LastEditors: YornQiu
 * @LastEditTime: 2021-12-10 17:51:33
 * @Description: 工具类
 * @FilePath: /vue3-ts-template/src/utils/index.ts
 */

import numberUtils from '@/utils/numberUtils';
import validateUtils from '@/utils/validateUtils';

interface SelectFileOption {
  multiple?: boolean;
  accept?: string;
}

interface UploadFileOption {
  beforeSelect?: (params?: unknown) => void;
  beforeUpload?: (params?: unknown) => void;
  onprogress?: (e?: ProgressEvent<EventTarget>) => void;
  params?: { [key: string]: string };
}

interface DownloadFileAjaxOption {
  method?: string;
  type?: string;
  name?: string;
  params?: string | object;
  onprogress?: (e?: ProgressEvent<EventTarget>) => void;
}

interface TreeNode {
  id: string;
  pid: string;
  children?: TreeNode[];
  [key: string]: any;
}

type Tree = TreeNode | TreeNode[];

const utils = {
  /**
   * @description: 从localStorage中读取属性值
   * @param {string} key
   * @param {boolean} parse 是否将序列化的字符串转化为Object
   * @return {string|object|null}
   */
  getItem(key: string, parse?: boolean): string | object | null {
    const value = localStorage.getItem(key);
    if (value !== null && parse) {
      return JSON.parse(value);
    }
    return value;
  },

  /**
   * @description: 在localStorage中设置属性值
   * @param {string} key
   * @param {string|object} value
   * @return {boolean}
   */
  setItem(key: string, value: string | object): boolean {
    if (this.isEmpty(key) || this.isVain(value)) {
      return false;
    }
    if (typeof value === 'object') {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.setItem(key, value);
    }
    return true;
  },

  /**
   * @description: 从localStorage中删除属性值
   * @param {string} key
   */
  removeItem(key: string): void {
    localStorage.removeItem(key);
  },

  /**
   * @description: 判断是否为 null,undefined或""
   * @param {any} value
   * @return {boolean} 是否为空
   */
  isEmpty(value: unknown): boolean {
    return value === null || value === undefined || value === '';
  },

  /**
   * @description: 判断是否为 null或undefined
   * @param {any} value
   * @return {boolean} 是否为空
   */
  isVain(value: unknown): boolean {
    return value === null || value === undefined;
  },

  /**
   * @description 生成32位唯一数uuid
   * @return {string} uuid
   */
  uuid(): string {
    const s = [];
    const hexDigits = '0123456789abcdef';
    for (let i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr(((<number>(<unknown>s[19])) & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = '-';

    return s.join('');
  },

  /**
   * @description: 判断浏览器类型是否为IE
   * @return {boolean}
   */
  isIE(): boolean {
    const userAgent = navigator.userAgent;
    return userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1 && userAgent.indexOf('Opera') === -1;
  },

  /**
   * @description: 获取浏览器类型
   * @return {string} 浏览器类型：Edge、Firefox、Safari、Chrome、Opera、IE
   */
  getBrowser(): string {
    const userAgent = navigator.userAgent;

    if (userAgent.indexOf('Edge') > -1) {
      return 'Edge';
    }
    if (userAgent.indexOf('Firefox') > -1) {
      return 'Firefox';
    }
    if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') == -1) {
      return 'Safari';
    }
    if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Safari') > -1) {
      return 'Chrome';
    }
    if (userAgent.indexOf('Opera') > -1 && userAgent.indexOf('MSIE') === -1) {
      return 'Opera';
    }

    if (userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1) {
      const reIE = new RegExp('MSIE (\\d+\\.\\d+);');
      reIE.test(userAgent);
      const IEVersion = parseFloat(RegExp['$1']);
      if (IEVersion === 7) {
        return 'IE7';
      } else if (IEVersion === 8) {
        return 'IE8';
      } else if (IEVersion === 9) {
        return 'IE9';
      } else if (IEVersion === 10) {
        return 'IE10';
      } else if (IEVersion === 11) {
        return 'IE11';
      } else {
        return 'IE';
      }
    }

    return '';
  },

  /**
   * @description: 选择文件，使用input输入框选择文件
   * @param {object} option 配置选项，可选配置项为：multiple，是否支持多选，默认false；accept，接受的文件类型，默认全部
   * @return {promise} Promise对象，内容为input[file]返回的文件列表
   */
  selectFile(option: SelectFileOption = {}): Promise<FileList | null> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = option.multiple || false;
      input.accept = option.accept || '';

      input.onchange = function (e) {
        resolve((e.target as HTMLInputElement).files);
      };
      input.onabort = function () {
        reject();
      };

      input.click();
    });
  },

  /**
   * @description: 通过xhr请求上传文件
   * @param {string} url 请求地址
   * @param {object} option 配置选项，支持multiple(多选)，accept(接受的文件类型)，params(请求参数)，beforeSelect(选择文件之前的钩子)，beforeUpload(上传文件之前的钩子)，onprogress(下载进度回调函数)
   * @return {promise} 包含请求结果的Promise对象
   */
  async uploadFile(url: string, option: UploadFileOption = {}): Promise<unknown> {
    const { beforeSelect, beforeUpload, onprogress, params } = option;

    beforeSelect && beforeSelect(params);

    const files = (await this.selectFile(option as SelectFileOption)) as FileList;
    const fd = new FormData();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      fd.append('files', file, file.name);
    }
    params && Object.keys(params).forEach((k) => fd.append(k, params[k]));

    beforeUpload && beforeUpload(params);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.onload = function () {
        if (xhr.status === 200) {
          resolve(xhr.response);
        } else {
          reject(xhr.response);
        }
      };
      xhr.onerror = function () {
        reject(xhr.response);
      };

      if (onprogress) {
        xhr.upload.onprogress = (e) => onprogress(e);
      }

      xhr.send(fd);
    });
  },

  /**
   * @description: 通过xhr请求下载文件
   * @param {string} url 请求地址
   * @param {object} option 配置选项，支持 method(请求方法)，params(请求参数)，type(参数类型)，name(文件名)，onprogress(下载进度回调函数)
   * @return {promise} 包含请求结果的Promise对象
   */
  downloadFileAjax(url: string, option: DownloadFileAjaxOption = {}): Promise<unknown> {
    const { method, type, name, params, onprogress } = option;
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method || 'get', url, true);
      xhr.responseType = 'blob';
      xhr.setRequestHeader('Content-Type', type === 'json' ? 'application/json; charset=utf-8' : 'application/x-www-form-urlencoded');

      const _params =
        typeof params === 'object'
          ? type === 'json'
            ? JSON.stringify(params)
            : Object.entries(params)
                .map((item) => item.join('='))
                .join('&')
          : params;

      xhr.onload = () => {
        if (xhr.status === 200) {
          const blob = xhr.response as BlobPart;
          const fileName = xhr.getResponseHeader('Content-Disposition')?.substring(20) || '';
          this.downloadFile(name || decodeURIComponent(fileName), blob); //解码名称
          resolve(xhr.response);
        } else {
          reject(xhr.response);
        }
      };
      xhr.onerror = () => {
        reject(xhr.response);
      };

      if (onprogress) {
        xhr.onprogress = (e) => onprogress(e);
      }

      xhr.send(null || _params);
    });
  },

  /**
   * @description: 文件下载
   * @param {string} fileName 文件名
   * @param {string|BlobPart} content 文件内容或文件地址
   */
  downloadFile(fileName: string, content: string | BlobPart) {
    const a = document.createElement('a');
    a.download = fileName;
    a.style.display = 'none';

    if (typeof content === 'string') {
      a.href = content; // content为文件地址
    } else {
      const blob = new Blob([content]);
      a.href = URL.createObjectURL(blob); // content为文件内容
    }

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },

  /**
   * @description: 将扁平数组转化为树或森林
   * @param {array} nodes 节点数组
   * @param {string} id 节点的id字段，默认为id
   * @param {string} pid 节点的父节点id字段，默认为pid
   * @param {string} children 节点的子节点字段，默认为children
   * @return {array} 树或森林
   */
  generateTree(nodes: Array<TreeNode>, id = 'id', pid = 'pid', children = 'children'): Array<TreeNode> {
    if (!Array.isArray(nodes)) {
      return [];
    }

    const tree: TreeNode[] = [];
    const treeMap: { [key: string]: TreeNode } = {};

    for (const node of nodes) {
      treeMap[node[id]] = node;
    }

    for (const node of nodes) {
      const pNode = treeMap[node[pid]];

      if (pNode) {
        (pNode[children] || (pNode[children] = [])).push(node);
      } else {
        tree.push(node);
      }
    }

    return tree;
  },

  /**
   * @description: 广度优先遍历树
   * @param {object|array} tree 树或森林
   * @param {Function} handler 用来处理树节点的方法
   */
  BFSTree(tree: Tree, handler: (node: TreeNode) => unknown) {
    if (!tree || typeof tree !== 'object') return;

    const queue = Array.isArray(tree) ? [...tree] : [tree];
    let node;

    while (queue.length) {
      node = queue.shift() as TreeNode;
      handler && handler(node);
      node.children && node.children.forEach((child: TreeNode) => queue.push(child));
    }
  },

  /**
   * @description: 广度优先遍历树
   * @param {object|array} tree 树或森林
   * @param {Function} handler 用来处理树节点的方法
   */
  DFSTree(tree: Tree, handler: (node: TreeNode) => unknown) {
    if (!tree || typeof tree !== 'object') return;

    const stack = Array.isArray(tree) ? [...tree] : [tree];
    let node;

    while (stack.length) {
      node = stack.pop() as TreeNode;
      handler && handler(node);
      node.children && node.children.forEach((child: TreeNode) => stack.push(child));
    }
  },

  /**
   * @description: 获取树中的某一个节点，得到一个节点后直接返回，不会继续查找
   * @param {object|array} tree 树或森林
   * @param {string} id 要获取的节点id
   * @return {object|undefined} 要获取的节点，未找到时返回undefined
   */
  getTreeNode(tree: Tree, id: string): TreeNode | undefined {
    if (!tree || typeof tree !== 'object') return;

    const queue = Array.isArray(tree) ? [...tree] : [tree];
    let node;

    while (queue.length) {
      node = queue.shift() as TreeNode;
      if (node.id === id) return node;
      node.children && node.children.forEach((child: TreeNode) => queue.push(child));
    }
  },
};

export default Object.freeze({ ...utils, numberUtils, validateUtils });
