
// 初始三个变量
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
  // 初始化参数
  state = PENDING;
  value = null;
  reason = "";
  // 构造函数
  constructor(exec) {
    // 传递两个函数,绑定 this 避免 this指向出错
    try {
      exec(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) {
      console.log("exec。出错");
      this.reject(error.message);
    }
  }
  resolve(value) {
    // 判断状态, 修改状态 并赋值
    if (this.state === PENDING) {
      this.state = FULFILLED;
      this.value = value;
      // 这里遵循，先进先出，shift最前面的函数， 然后执行它
      while (this.successCallback.length) {
        this.successCallback.shift()();
      }
    }
  }
  reject(reason) {
    // 判断状态, 修改状态 并赋值
    if (this.state === PENDING) {
      this.state = REJECTED;
      this.reason = reason;
      while (this.failCallback.length) {
        this.failCallback.shift()();
      }
    }
  }
  successCallback = [];
  failCallback = [];
  then(onFulfilled, onRejected) {
    onFulfilled = onFulfilled ? onFulfilled : (value) => value;
    onRejected = onRejected
      ? onRejected
      : (reason) => {
          throw Error(reason);
        };
    // 返回一个新的实例
    let p = new Promise((resolve, reject) => {
      if (this.state === FULFILLED) {
        queueMicrotask(() => {
          try {
            let res = onFulfilled(this.value);
            resolveRes(res, p, resolve, reject);
          } catch (error) {
            reject(error.message);
          }
        });
      } else if (this.state === REJECTED) {
        queueMicrotask(() => {
          try {
            let res = onRejected(this.reason);
            resolveRes(res, p, resolve, reject);
          } catch (error) {
            reject(error.message);
          }
        });
      } else {
        this.successCallback.push(() => {
          queueMicrotask(() => {
            try {
              let res = onFulfilled(this.value);
              // 拿到我们生成的实例，和用户的实例做对比
              resolveRes(res, p, resolve, reject);
            } catch (error) {
              reject(error.message);
            }
          });
        });
        this.failCallback.push(() => {
          queueMicrotask(() => {
            try {
              let res = onRejected(this.reason);
              resolveRes(res, p, resolve, reject);
            } catch (error) {
              reject(error.message);
            }
          });
        });
      }
    });
    return p;
  }
  catch(e) {
    return this.then(null, e);
  }
  static resolve(val) {
    // 1. 普通值就直接返回
    // 2. Promise 需要直接运行，需要放在构造函数中
    return val instanceof Promise ? val : new Promise((s) => s(val));
  }
  finally(callback) {
    // 1. callback 需要执行
    // 2. 需要保证 原先的promise状态
    return this.then(
      (value) => {
        return Promise.resolve(callback()).then(() => value);
      },
      (reason) => {
        return Promise.resolve(callback()).then(() => {
          throw reason;
        });
      }
    );
  }

  static all(data) {
    // 1. 参数判定
    return new Promise((resolve, reject) => {
      if (Array.isArray(data)) {
        let res = [];
        let resIndex = 0;
        // 空数组 就直接返回
        if (data.length === 0) {
          resolve(res);
          return;
        }
        const addRes = (val, i) => {
          res[i] = val;
          resIndex++;
          // 这里不能使用 res.length, 切记 因为： arr[10] , arr.length ===10
          if (resIndex === data.length) {
            resolve(res);
          }
        };
        for (let index = 0; index < data.length; index++) {
          const item = data[index];
          if (item instanceof MyPromise) {
            item.then(
              (val) => {
                // 拿到值再增加
                addRes(val, index);
              },
              (msg) => {
                reject(msg);
              }
            );
          } else {
            addRes(item, index);
          }
        }
      } else {
        reject("all 参数必须是数组");
      }
    });
  }

  static race(data) {
    return new MyPromise((resolve, reject) => {
      if (Array.isArray(data)) {
        // 空数组 就直接返回
        if (data.length === 0) {
          resolve();
          return;
        }
        for (let index = 0; index < data.length; index++) {
          const item = data[index];
          if (item instanceof MyPromise) {
            MyPromise.resolve(item).then(
              (val) => resolve(val),
              (msg) => reject(msg)
            );
          }
        }
      } else {
        reject("race 参数必须是数组");
      }
    });
  }
  static allSettled(data) {
    // 1. 参数判定
    return new Promise((resolve, reject) => {
      if (Array.isArray(data)) {
        let res = [];
        let resIndex = 0;
        // 空数组 就直接返回
        if (data.length === 0) {
          resolve(res);
          return;
        }
        for (let index = 0; index < data.length; index++) {
          const item = data[index];
          MyPromise.resolve(item).then(
            (value) => {
              res[index] = { status: "fulfilled", value };
              resIndex++;
              if (resIndex === data.length) resolve(res);
            },
            (reason) => {
              res[index] = { status: "rejected", reason };
              resIndex++;
              if (resIndex === data.length) resolve(res);
            }
          );
        }
      } else {
        reject("allSettled 参数必须是数组");
      }
    });
  }
}
function resolveRes(res, promise, resolve, reject) {
  if (promise === res) {
    reject(new Error("不能是相同实例"));
    return;
  }
  if (res instanceof Promise) {
    res.then(resolve, reject); // 如果是promise，就调用它的then方法，并把当前的resolve，reject传递下去，它结束时就能调用
  } else {
    resolve(res);
  }
}
