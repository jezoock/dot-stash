const throttle = (func, wait, leading = false, trailing = false, context?) => {
  let ctx, args, result;
  let timeout = null;
  let previous = 0;
  const later = function () {
    previous = Date.now();
    timeout = null;
    result = func.apply(ctx, args);
  };
  return function (...rest) {
    const now = Date.now();
    if (!previous && !leading) {
      previous = now;
    }
    const remaining = wait - (now - previous);
    ctx = context || this;
    args = rest;
    if (remaining <= 0) {
      clearTimeout(timeout);
      timeout = null;
      previous = now;
      result = func.apply(ctx, args);
    } else if (!timeout && trailing) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};

export default throttle;
