@[TOC](手写Promise)

# 前言

> 上一篇我们已经完成了 Promise 的基本实现：`包括 Promise的类创建，状态设定，resovle、reject、then方法实现，并处理了Promise实例化中异步情况，then 方法返回 promise实例的情况`，接下来我们将继续完成 Promise 类中的一些其他方法
>
> 如果有没有看过的，可以通过 [第一篇内容入口 手写 Promise 特性全解析，手把手实现（一）](https://blog.csdn.net/cdns_1/article/details/140306551)， 进行查看

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/d319d79da0c04fe2b59ff404f0573eab.gif#pic_center)

# 手写逻辑

`为了避免篇幅过长，我们将案例分为两张来写`,本章实现功能

> - 实例方法 catch 的实现
> - 静态方法 resolve 返回一个 promise
> - 实例方法 finally 方法 不管成功失败都会执行一次
> - 静态方法 all 方法的实现, 只有全部成功会返回所有的结果，任意一个失败就返回失败
> - 静态方法 race 方法的实现, 返回最先成功的promise结果
> - 静态方法 allSettled 方法的实现, 等到所有这些参数实例都返回结果，不管是fulfilled还是rejected，包装实例才会结束

## 1. catch 实例方法实现

> - `catch` 是一个实例方法，用于处理 Promise 被拒绝的情况。
> - 它接受一个 `onRejected` 回调函数作为参数，当 Promise 被拒绝时，将调用该函数。
> - `catch` 返回一个新的 Promise 对象，如果 `onRejected` 回调函数返回的是一个值或新的 Promise，那么返回的 Promise 将解析为该值或新的 Promise 的结果。

**代码实例**

> **`我们需要对 then 方法中的代码进行异常捕获，不然，后面的代码会因为异常终止执行`**

```js
then() {
    //... 省略一些代码

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

```

**编写 catch 实现**

```js
class MyPromise {
  // 。。。上面代码省略
  catch(e) {
    return this.then(null, e);
  }
}
```

**测试实例**

```js
let p = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    reject("抛出错误");
  }, 1000);
})
  .then(
    (val) => {
      console.log("success:", val);
    },
    (e) => {
      console.log("出错了", e);
      throw new Error("....");
    }
  )
  .catch((e) => {
    console.log("尾部捕获错误：", e);
  });
```

**测试截图**

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/3e90cc0da56e462c8ecc8e67bac26b24.png)

## 2. resolve 静态方法实现

- resolve 是 Promise 构造函数上的一个静态方法，可以通过 Promise.resolve(value) 来调用
- resolve 方法返回一个新的 Promise 对象，该对象立即进入已解析状态，而不是等待异步操作完成
- 如果传递给 resolve 的参数是一个 Promise 实例，返回的 Promise 将跟随该实例的最终状态（解析或拒绝）。
- 如果参数是一个 thenable 对象（即具有 then 方法的对象），返回的 Promise 将等待 thenable 被解析或拒绝，并相应地解析或拒绝。

**代码示例**

```js
  static resolve(val){
    // 1. 普通值就直接返回
    // 2. Promise 需要直接运行，需要放在构造函数中
    return val instanceof Promise ? val : new Promise((s) => s(val));
  }
```

**测试实例**

```js
<script>
    MyPromise.resolve(123).then((val) => {
        console.log("resolve:", val);
      });
      let p = new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve("1s 后输出");
        }, 1000);
      })

      MyPromise.resolve(p).then((val) => {
        console.log("resolve:", val);
      });
</script>
```

**测试截图**

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/4293fcf299774dd9b072d99cefda8d3f.png)

## 3. finally(onFinally) 实例方法实现

- `finally` 是一个实例方法，无论 Promise 最终是解析还是拒绝，都会执行 `onFinally` 回调函数。
- `finally` 返回一个新的 Promise 对象，解析或拒绝的结果与原 Promise 相同。
- `finally` 方法常用于清理工作，如关闭数据库连接、释放资源等。

**代码示例**

```js
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
```

**测试实例**

```js
<script>
    let p = new MyPromise((resolve, reject) => {
        setTimeout(() => {
          reject("抛出错误");
        }, 1000);
      })
        .finally((e) => {
          console.log("finally执行了");
        })
        .then(null, (msg) => {
          console.log("finally后面的then ： ", msg);
        });
</script>
```

**测试截图**

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/5ee642f23ced4f6ba1decb9b6efc2913.png)

## 4. all 方法实现

- `all` 是一个静态方法，它接受一个` Promise 数组`作为参数。
- 只有当数组中的所有 Promise 都成功解析时，`all` 返回的 Promise 才会解析，并且解析值为一个数组，包含所有 Promise 的解析值。
- 如果数组中的任何一个 Promise 失败，`all` 返回的 Promise 将立即拒绝，拒绝原因为第一个失败的 Promise 的拒绝原因。

**代码示例**

```js
static all(data) {
    // 1. 参数判定
    return new Promise((resolve, reject) => {
      if (Array.isArray(data)) {
        let res = [];
        let resIndex = 0;
        // 空数组 就直接返回
        if(data.length === 0){
          resolve(res)
          return
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
```

**测试实例**

```js
let p1 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(200);
    //reject("出错了。。。");
  }, 2000);
});
MyPromise.all([100, p1, 300]).then(
  (res) => {
    console.log("2s 后 all 执行结果：", res);
  },
  (msg) => {
    console.log("出错了：", msg);
  }
);
```
**成功后的截图**

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/e77111f1b39042bdb69fc0ac6e6b3eea.png)

**出错后的截图**

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/d6cc24a610ca4756bf15e4db9a4854c1.png)

## 5. race 方法实现

- `Promise.race(iterable)` 同样接受一个可迭代对象。
- `race` 返回的 Promise 将根据可迭代对象中第一个解析或拒绝的 Promise 来确定自己的状态。
- 如果数组中任何一个 Promise 解析，`race` 返回的 Promise 将解析，并以该 Promise 的解析值作为自己的解析值。
- 如果任何一个 Promise 拒绝，`race` 返回的 Promise 将拒绝，并以该 Promise 的拒绝原因作为自己的拒绝原因。

**代码示例**

```js
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
            // 获取值，先得到的值就直接返回
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
```

**测试实例**

```js
let p1 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(200);
  }, 2000);
});
let p2 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(300);
  }, 3000);
});
MyPromise.race([p2, p1]).then(
  (res) => {
    console.log("race 执行结果：", res);
  },
  (msg) => {
    console.log("race 出错了：", msg);
  }
);
```

**测试截图**

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/9f110f55402f4fccb159234ac3a1f497.png)

## 6. allSettled 方法实现

- `Promise.allSettled(iterable)` 是 ES2020 新增的方法。
- 与 `all` 不同，`allSettled` 会等待可迭代对象中的所有 Promise 都完成（无论是解析还是拒绝）。
- `allSettled` 返回的 Promise 解析后，结果是一个数组，每个元素是一个对象，包含 `status`（值为 `"fulfilled"` 或 `"rejected"`）和 `value` 或 `reason`。
- 这个数组的顺序与输入的可迭代对象一致，无论 Promise 是解析还是拒绝。

**代码示例**

```js
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
```

**测试实例**

```js
let p1 = new MyPromise((resolve, reject) => {
        setTimeout(() => {
          resolve(200);
        }, 2000);
      });
      let p2 = new MyPromise((resolve, reject) => {
        setTimeout(() => {
          reject(300);
        }, 3000);
      });
      MyPromise.allSettled([p2, p1]).then(
        (res) => {
          console.log("allSettled 执行结果：", res);
        },
        (msg) => {
          console.log("allSettled 出错了：", msg);
        }
      );
```

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/4cb726254741439db0db44d74fb72415.png)

## 总结



---

通过本系列文章的深入探索，我们从零开始，一步步构建了对 Promise 机制的理解，实现了一个基本的 Promise 构造函数，并逐步扩展了它的功能，包括 `then`、`catch`、`all`、`race` 和 `allSettled` 等高级 API。这个过程不仅加深了我们对异步编程模式的认识，也锻炼了我们解决实际编程问题的能力。

手写 Promise 的旅程是一次对 JavaScript 核心概念的深刻反思。它教会我们，即使是日常使用的简单工具，背后也可能隐藏着复杂的逻辑和精巧的设计。在未来的编程道路上，无论是面对现有的库和框架，还是设计自己的解决方案，这种深入理解都将是我们宝贵的财富。

--- 

