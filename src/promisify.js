// Adopted from https://github.com/nodejs/node/blob/master/lib/internal/util.js
const promisifyCode = `
const kCustomPromisifiedSymbol = Symbol('util.promisify.custom');
const kCustomPromisifyArgsSymbol = Symbol('customPromisifyArgs');

function promisify(original) {
  if (typeof original !== 'function')
    throw new errors.TypeError('ERR_INVALID_ARG_TYPE', 'original', 'Function');

  if (original[kCustomPromisifiedSymbol]) {
    const fn = original[kCustomPromisifiedSymbol];
    if (typeof fn !== 'function') {
      throw new errors.TypeError('ERR_INVALID_ARG_TYPE',
                                 'util.promisify.custom',
                                 'Function',
                                 fn);
    }
    Object.defineProperty(fn, kCustomPromisifiedSymbol, {
      value: fn, enumerable: false, writable: false, configurable: true
    });
    return fn;
  }

  // Names to create an object from in case the callback receives multiple
  // arguments, e.g. ['stdout', 'stderr'] for child_process.exec.
  const argumentNames = original[kCustomPromisifyArgsSymbol];

  function fn(...args) {
    const promise = createPromise();
    try {
      original.call(this, ...args, (err, ...values) => {
        if (err) {
          promiseReject(promise, err);
        } else if (argumentNames !== undefined && values.length > 1) {
          const obj = {};
          for (var i = 0; i < argumentNames.length; i++)
            obj[argumentNames[i]] = values[i];
          promiseResolve(promise, obj);
        } else {
          promiseResolve(promise, values[0]);
        }
      });
    } catch (err) {
      promiseReject(promise, err);
    }
    return promise;
  }

  Object.setPrototypeOf(fn, Object.getPrototypeOf(original));

  Object.defineProperty(fn, kCustomPromisifiedSymbol, {
    value: fn, enumerable: false, writable: false, configurable: true
  });
  return Object.defineProperties(
    fn,
    Object.getOwnPropertyDescriptors(original)
  );
}

promisify.custom = kCustomPromisifiedSymbol;
`;

export {promisifyCode};
