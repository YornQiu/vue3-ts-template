import utils from './utils';

declare global {
  const $utils: typeof utils;
  interface Window {
    $utils: typeof utils;
  }
}
