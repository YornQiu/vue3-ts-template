/*
 * @Author: Yorn Qiu
 * @Date: 2020-12-15 11:44:23
 * @LastEditors: Yorn Qiu
 * @LastEditTime: 2022-02-28 11:35:41
 * @Description: http
 * @FilePath: /vue3-ts-template/src/libs/http.ts
 */

import type { AxiosPromise, Method, ResponseType } from 'axios';
import qs from 'qs';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import utils from '@/utils';

interface HttpObjectParams {
  [key: string]: unknown;
}
interface HttpConfig {
  contentType?: string;
  responseType?: ResponseType;
  [key: string]: unknown;
}

type HttpParams = HttpObjectParams | FormData | string;

type HttpMethod = (url: string, parmas: HttpParams, config: HttpConfig) => AxiosPromise;

const TOKEN_TYPE = utils.getItem('token_type') || 'bearer';
const AUTH_TOKEN = utils.getItem('access_token');

// axios整体配置
const instance = axios.create({
  baseURL: import.meta.url,
  headers: {
    Authorization: `${TOKEN_TYPE} ${AUTH_TOKEN}`,
  },
});

// 对请求进行拦截
instance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// 对响应进行拦截
instance.interceptors.response.use(
  (res) => res.data,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        ElMessage.error('身份状态失效，请重新登录');
        // window.location.href = `${window.location.origin}/login`;
      }

      if (error.response.status === 500) {
        ElMessage.error('请求失败，网络错误');
      }

      if (error.response.status === 504) {
        ElMessage.error('请求超时');
      }
    }

    return Promise.reject(error.response);
  }
);

const http = (method: Method, url: string, params: HttpParams, config: HttpConfig) =>
  instance({
    url,
    method,
    data: method === 'POST' || method === 'PUT' ? params : null,
    params: method === 'GET' || method === 'DELETE' ? params : null,
    responseType: config?.responseType || 'json',
    headers: {
      'Content-Type': config?.contentType || 'application/json; charset=UTF-8',
    },
    // 若需其他配置，在此处添加。切勿使用 ...config 等不安全的方式
  });

export interface HTTP {
  get: HttpMethod;
  post: HttpMethod;
  postForm: HttpMethod;
  put: HttpMethod;
  delete: HttpMethod;
}

export default {
  /**
   * get，参数为Object，会自动转化为query形式并添加在地址之后
   * @param {string} url 地址
   * @param {object} params 参数
   * @param {object} config 配置，其中属性名应始终为驼峰式写法
   */
  get(url: string, params: HttpParams, config: HttpConfig): AxiosPromise {
    return http('GET', url, params, config);
  },
  /**
   * post，参数为Object或FormData，此时content-type为 application/json或multipart/form-data，无需手动指定
   * @param {string} url 地址
   * @param {object|FormData} params 参数
   * @param {object} config 配置，其中属性名应始终为驼峰式写法
   */
  post(url: string, params: HttpParams, config: HttpConfig): AxiosPromise {
    return http('POST', url, params, config);
  },
  /**
   * post 表单，参数为表单键值对或Object，若为Object则会自动转化为键值对，此时content-type为 application/x-www-form-urlencoded
   * @param {string} url 地址
   * @param {object} params 参数
   * @param {object} config 配置，其中属性名应始终为驼峰式写法
   */
  postForm(url: string, params: HttpParams, config: HttpConfig): AxiosPromise {
    if (typeof params === 'object') {
      params = qs.stringify(params);
    }
    return http('POST', url, params, { ...config, contentType: 'application/x-www-form-urlencoded' });
  },
  put(url: string, params: HttpParams, config: HttpConfig): AxiosPromise {
    return http('PUT', url, params, config);
  },
  delete(url: string, params: HttpParams, config: HttpConfig): AxiosPromise {
    return http('DELETE', url, params, config);
  },
};
