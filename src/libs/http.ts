/*
 * @Author: Yorn Qiu
 * @Date: 2022-02-25 17:02:56
 * @LastEditors: Yorn Qiu
 * @LastEditTime: 2022-03-31 16:41:45
 * @Description: http
 * @FilePath: /vue3-ts-template/src/libs/http.ts
 */

import type { AxiosInstance, AxiosPromise, AxiosRequestConfig, AxiosResponse, Method, ResponseType } from 'axios';

import qs from 'qs';
import axios from 'axios';

interface HttpOptions {
  baseURL?: string;
  refreshURL?: string;
  tokenTypeField?: string;
  accessTokenField?: string;
  refreshTokenField?: string;
}

interface HttpConfig {
  contentType?: string;
  responseType?: ResponseType;
  [key: string]: string | number | boolean | undefined;
}

type HttpParams = FormData | object | string;

export class Http {
  isRefreshing = false; //是否正在刷新token
  baseURL = '';
  refreshURL = '';
  tokenTypeField: string;
  accessTokenField: string;
  refreshTokenField: string;
  instance: AxiosInstance;
  retryRequests: { (token: string): void }[] = []; // 重发的请求列表

  constructor(options?: HttpOptions) {
    this.baseURL = options?.baseURL || '';
    this.refreshURL = options?.refreshURL || '';

    // 在localStorage中存储的token字段名
    this.tokenTypeField = options?.tokenTypeField || 'token_type';
    this.accessTokenField = options?.accessTokenField || 'access_token';
    this.refreshTokenField = options?.refreshTokenField || 'refresh_token';

    this.instance = this.createInstance(this.baseURL, this.getLocalToken());
    this.setInterceptors(this.instance);
  }

  /**
   * 获取localStorage中保存的accessToken
   * @returns {string} accessToken
   */
  getLocalToken(): string {
    const { tokenTypeField, accessTokenField } = this;
    const takenType = localStorage.getItem(tokenTypeField) || 'bearer';
    const accessToken = localStorage.getItem(accessTokenField) || '';

    return `${takenType} ${accessToken}`;
  }

  /**
   * 获取localStorage中保存的refreshToken
   * @returns {string} refreshToken
   */
  getLocalRefreshToken(): string {
    const { tokenTypeField, refreshTokenField } = this;
    const takenType = localStorage.getItem(tokenTypeField) || 'bearer';
    const refreshToken = localStorage.getItem(refreshTokenField) || '';

    return `${takenType} ${refreshToken}`;
  }

  /**
   * 更新localStorage中的accessToken和refreshToken
   * @param {string} accessToken
   * @param {string} refreshToken
   */
  setLocalToken(accessToken: string, refreshToken: string) {
    const { accessTokenField, refreshTokenField } = this;
    localStorage.setItem(accessTokenField, accessToken);
    localStorage.setItem(refreshTokenField, refreshToken);
  }

  /**
   * 创建axios实例
   * @param {string} baseURL
   * @param {string} token
   * @returns axios实例
   */
  createInstance(baseURL: string, token: string) {
    const instance = axios.create({ baseURL });
    instance.defaults.headers.common['Authorization'] = token;

    return instance;
  }

  /**
   * 设置axios实例拦截器
   * @param {Axios} instance axios实例
   */
  setInterceptors(instance: AxiosInstance) {
    // 对请求进行拦截
    instance.interceptors.request.use(
      (config) => config,
      (error) => Promise.reject(error)
    );

    // 对响应进行拦截
    instance.interceptors.response.use(
      (res) => res.data,
      ({ response }) => {
        if (response?.status === 401) {
          if (this.refreshURL) {
            return this.refreshToken(response.config);
          }
          ElMessage.error('身份状态失效，请重新登录');
          // window.location.href = `${window.location.origin}/login.html`;
        } else {
          if (response?.status === 500) {
            ElMessage.error('服务器错误，请稍后重试');
          }
          if (response?.status === 504) {
            ElMessage.error('请求超时');
          }

          return Promise.reject(response);
        }
      }
    );
  }

  /**
   * token失效后刷新token
   * @param {object} config 被拒的请求的配置
   * @returns Promise
   */
  refreshToken(config: AxiosRequestConfig) {
    // 判断是否正在请求新的token
    if (this.isRefreshing) {
      // 若正在请求token，则将refreshToken时发送的请求加入队列并在token刷新之后重新发送
      return new Promise((resolve) => {
        this.retryRequests.push((token: string) => {
          config.headers && (config.headers.Authorization = token);
          resolve(this.instance(config));
        });
      });
    } else {
      this.isRefreshing = true;

      return this.getRefreshToken()
        .then(({ data }) => {
          // 获取新的token后，重新保存并设置
          const { access_token, refresh_token } = data.data;
          this.setLocalToken(access_token, refresh_token);

          const token = this.getLocalToken();
          this.instance.defaults.headers.common.Authorization = token;

          // 重试队列中的请求
          this.retryRequests.forEach((cb) => cb(token));
          this.retryRequests = [];

          // 将上一请求的token换为新的并重发
          config.headers && (config.headers.Authorization = token);
          return this.instance(config);
        })
        .catch(() => {
          ElMessage.error('身份状态失效，请重新登录');
          // window.location.href = `${window.location.origin}/login.html`;
        })
        .finally(() => {
          this.isRefreshing = false;
        });
    }
  }

  /**
   * 获取refreshToken
   * @returns {Promise} 获取refreshToken的请求
   */
  getRefreshToken(): AxiosPromise<AxiosResponse> {
    const { baseURL, refreshURL } = this;
    const instance = this.createInstance(baseURL, this.getLocalRefreshToken());

    return instance.get(refreshURL);
  }

  /**
   * 生成一个新实例
   */
  refreshInstance() {
    const { baseURL } = this;
    this.instance = this.createInstance(baseURL, this.getLocalToken());
  }

  request<T>(method: Method, url: string, params?: HttpParams, config?: HttpConfig): Promise<T> {
    return this.instance.request({
      url,
      method,
      data: method === 'POST' || method === 'PUT' ? params : null,
      params: method === 'GET' || method === 'DELETE' ? params : null,
      responseType: config?.responseType || 'json',
      headers: {
        'Content-Type': config?.contentType || 'application/json; charset=UTF-8',
      },
      // 若需其他配置，在此处添加。
    });
  }

  /**
   * get，参数为Object，会自动转化为query形式并添加在地址之后
   * @param {string} url 地址
   * @param {object} params 参数
   * @param {object} config axios配置
   */
  get<T>(url: string, params?: HttpParams, config?: HttpConfig) {
    return this.request<T>('GET', url, params, config);
  }

  /**
   * post，参数为Object或FormData，此时content-type为 application/json或multipart/form-data，无需手动指定
   * @param {string} url 地址
   * @param {object|FormData} params 参数
   * @param {object} config axios配置
   */
  post<T>(url: string, params?: HttpParams, config?: HttpConfig) {
    return this.request<T>('POST', url, params, config);
  }

  /**
   * post 表单，参数为表单键值对或Object，若为Object则会自动转化为键值对，此时content-type为 application/x-www-form-urlencoded
   * @param {string} url 地址
   * @param {object} params 参数
   * @param {object} config axios配置
   */
  postForm<T>(url: string, params?: HttpParams, config?: HttpConfig) {
    if (typeof params === 'object') {
      params = qs.stringify(params);
    }
    return this.request<T>('POST', url, params, { ...config, contentType: 'application/x-www-form-urlencoded' });
  }

  put<T>(url: string, params?: HttpParams, config?: HttpConfig) {
    return this.request<T>('PUT', url, params, config);
  }

  delete<T>(url: string, params?: HttpParams, config?: HttpConfig) {
    return this.request<T>('DELETE', url, params, config);
  }
}

export default new Http({ baseURL: '', refreshURL: '/api/user/refresh' });
