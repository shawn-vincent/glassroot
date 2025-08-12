export const platform = {
  isIOS: /iPhone|iPad|iPod/.test(navigator.userAgent),
  isAndroid: /Android/.test(navigator.userAgent),
  hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
};

export default platform;
