@[TOC](手写Promise)

# 简介

> `Promise 是异步编程的一种解决方案`，比传统的解决方案——`回调函数和事件`——更合理和更强大。ES6 将其写进了语言标准，统一了用法，原生提供了 Promise 对象。
>
> [Promise 概念及使用](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/d319d79da0c04fe2b59ff404f0573eab.gif#pic_center)

## 优点：

- Promise 对象代表一个异步操作，**有三种状态：`pending`（进行中）、`fulfilled`（已成功）和`rejected`（已失败）。** 只有异步操作的结果，可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。这也是 Promise 这个名字的由来，它的英语意思就是“承诺”，表示其他手段无法改变。

- `一旦状态改变，就不会再变`，任何时候都可以得到这个结果。Promise 对象的状态改变，只有两种可能：`从pending变为fulfilled  或  从pending变为rejected。`
- 有了 Promise 对象，就可以将异步操作以同步操作的流程表达出来，`避免了层层嵌套的回调函数`

## 缺点：

- `无法取消Promise`，一旦新建它就会立即执行，无法中途取消。
- `如果不设置回调函数，Promise内部抛出的错误，不会反应到外部`
- 当处于 pending 状态时，`无法得知目前进展到哪一个阶段`（刚刚开始还是即将完成）。

# 手写逻辑

`为了避免篇幅过长，我们将案例分为两张来写`,本章实现功能

> + 创建MyPromise类
> + 通过构造函数constructor，在执行这个类的时候需要传递一个执行器进去并立即调用
> + 绑定resolve和reject this：避免直接调用时this指向全局 `window / undefined` 问题
> + 定义状态常量（成功fulfilled 失败rejected 等待pending），初始化为pending。
> + 完成resolve和reject函数的状态改变（注意：需判断当前状态是否可以改变）
> + MyPromise类中定义value和reason，用来储存执行器执行成功和失败的返回值
> + MyPromise类中添加then方法，成功回调有一个参数 表示成功之后的值；失败回调有一个参数 表示失败后的原因
> + 将then方法的参数变为可选参数
> + 处理异步逻辑（pending状态下在then中将回调存起来）
> + 实现then方法多次调用添加多个处理函数
> + 实现then方法链式调用（写一个函数方法专门判断回调的结果是普通值还是promise，then方法返回的仍然是一个promise）
> + then方法链式调用识别Promise对象自返回




## 1. 初探 Promise 结构

> 1. 我们发现创建 Promise 需要使用`new`关键字，那他肯定是作为面向对象的方式调用的，`说明:Promise是一个类。`
> 2. `new Promise(fn)` 的时候需要传一个函数进去，`说明:Promise的参数是一个函数 `
>
> 3. 构造函数传进去的`fn`会收到 resolve 和 reject 两个函数，用来表示 Promise 成功和失败，说明构造函数里面还需要 resolve 和 reject 这两个函数，这两个函数的作用是改变 Promise 的状态。
> 4. `promise 有pending，fulfilled，rejected三个状态`，初始状态为 pending，调用 resolve 会将其改为 fulfilled，调用 reject 会改为 rejected。
> 5. 状态修改后就不能在修改了，所以在**修改之前必须先判断当前状态是否为`pending`状态**，`resolve 函数接收的值会保存在Value 中，reject 函数接收的值讲保存在 reason中`

**代码实例**

```js
//MyPromise.js
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
    exec(this.resolve.bind(this), this.reject.bind(this));
  }
  resolve(value) {
    // 判断状态, 修改状态 并赋值
    if (this.state === PENDING) {
      this.state = FULFILLED;
      this.value = value;
    }
  }
  reject(reason) {
    // 判断状态, 修改状态 并赋值
    if (this.state === PENDING) {
      this.state = REJECTED;
      this.reason = reason;
    }
  }
}
```

**测试实例**

> 创建一个 html 文件，来加载上面的 js 文件，并执行测试 JS 代码

```html
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Promise 测试</title>
  </head>
  <body>
    <script src="./MyPromise.js"></script>
    <script>
      let p = new MyPromise((resolve, reject) => {
        reject("出错了");
        resolve("success"); // 上面已经改变了状态,下面不会执行
      });
      console.log(p);
    </script>
  </body>
</html>
```

**测试截图**
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/1b3d85a156ae4b0eb4ce5fc2823cbcc8.png)

## 2. 处理构造函数报错

> 捕获` exec` 函数的执行错误，记得加上`try...catch`，如果捕获到错误就`reject`。

**代码示例**

```js
 constructor (exec){
     try {
          exec(this.resolve.bind(this),this.reject.bind(this))
      } catch (error) {
          this.reject(error.message)
      }
  }
```

**测试实例**

```js
<script>
  // 2. 异常处理
  let p = new MyPromise((resolve, reject) => {
            console.log('开始执行。。');
            throw new Error('内部执行错误')
            resolve('success')
   	})
    console.log(p);
</script>
```

**测试截图**
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/8296422eecd7403390ab8ab6e37cd438.png)

## 3. then 方法实现

> 1. promise 实例对象建好后可以调用 then 方法，`说明then是一个实例方法`。而且 then 方法可以`链式调用`，说明他很方法返回一个 promise 实例(`原生Promise不能自己返回自己`),所以我们需要进行判断
> 2. then 方法接收两个参数 `then(onFulfilled, onRejected)`
> 3. `onFulfilled , onRejected`的值 可以是一个函数`(val)=> null | promise` 或者`null | undefined` ，这里我们需要处理他们没有默认值的情况

**代码示例**

```js
    then(onFulfilled, onRejected) {
        onFulfilled = onFulfilled ? onFulfilled : (value) => value
        onRejected = onRejected ? onRejected : (reason) => { throw Error(reason) }
        // 返回一个新的实例
        let p = new MyPromise((resolve, reject) => {
            if (this.state === FULFILLED) {
                resolve(onFulfilled(this.value))// 拿到返回值给到下个Promise
            } else if (this.state === REJECTED) {
                reject(onRejected(this.reason))
            }
        })
        return p
    }
```

**测试实例**

```js
 <script>
	 // 3. then方法，链式调用，上一个then的返回值就是下个then的参数
      new MyPromise((resolve, reject) => {
          resolve('success')
          // reject('出错了')
      }).then((val) => {
          console.log(val);
          return "成功111"
      }).then(val=>{
          console.log(val);
          return "成功222"
      }).then(val=>{
          console.log(val);
      })
</script>
```

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/986156259b634ffb828397992eda3350.png)

## 4. 处理构造函数异步情况

> 1.  上面代码`then` 函数 是在实例对象一创建好就调用了，但是由于构造函数中有异步代码，`resolve` 函数还没有调用呢
>
> 2.  `也就是说他的status还是PENDING`，那么 then 方法执行，也拿不到值，`我们该怎么解决呢？？？`，答案是，我们在状态是 pending 时，将 then 方法的回调进行保存，`当resolve 或 rejecte 函数触发时，我们再进行执行then的回调`，
> 3.  解决方案：我们用两个数组将他们存起来， `successCallback` , `failCallback`

**代码示例：**

```js
 	successCallback = []
    failCallback = []
    then(onFulfilled, onRejected) {
        onFulfilled = onFulfilled ? onFulfilled : (value) => value
        onRejected = onRejected ? onRejected : (reason) => { throw Error(reason) }
        // 返回一个新的实例
        let p = new MyPromise((resolve, reject) => {
            if (this.state === FULFILLED) {
                resolve(onFulfilled(this.value))
            } else if (this.state === REJECTED) {
                reject(onRejected(this.reason))
            } else {
                this.successCallback.push(() => resolve(onFulfilled(this.value)))
                this.failCallback.push(() => reject(onRejected(this.reason)))
            }
        })
        return p
    }
```

```js
  resolve(value) {
        // 判断状态, 修改状态 并赋值
        if (this.state === PENDING) {
            this.state = FULFILLED
            this.value = value
            // 这里遵循，先进先出，shift最前面的函数， 然后执行它
            while (this.successCallback.length) {
                this.successCallback.shift()()
            }

        }
    }
    reject(reason) {
        // 判断状态, 修改状态 并赋值
        if (this.state === PENDING) {
            this.state = REJECTED
            this.reason = reason
            while (this.failCallback.length) {
                this.failCallback.shift()()
            }
        }
    }
```

**测试代码**

```js
new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve("async");
  }, 2000);
})
  .then((val) => {
    console.log(val);
    return "成功111";
  })
  .then((val) => {
    console.log(val);
  });
```

**测试截图**
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/2890197983254b1c9fb811ad49da9a4a.png)

## 5. 处理 then 方法的返回值

> 1. 在 Promise 的规范中，`then方法的返回值不能是自己当前的实例，所以我们也要对返回值进行判断`, 我们通过 `queueMicrotask`,`setTimeout` 异步的方式， 拿到新生成的实例和用户返回的做对比，这里用 `queueMicrotask` 微任务，性能要好些
> 2. then 方法返回值可能是一个普通值，也可能是一个 Promise，如果是 promise，我们就需要等待 promise 完成，再执行下一个 then 回调

## 5.1 处理 then 返回自己当前实例

```js
 then(onFulfilled, onRejected) {
        console.log('then..');
        onFulfilled = onFulfilled ? onFulfilled : (value) => value
        onRejected = onRejected ? onRejected : (reason) => { throw Error(reason) }
        // 返回一个新的实例
        let p = new Promise((resolve, reject) => {
            // ....代码省略

            this.successCallback.push(() => {
                queueMicrotask(() => {
                    let res = onFulfilled(this.value)
                    // 拿到我们生成的实例，和用户的实例做对比
                    resolveRes(res, p, resolve, reject)
                })
            })
            this.failCallback.push(() => {
                queueMicrotask(() => {
                    let res = onRejected(this.reason)
                    resolveRes(res, p, resolve, reject)
                })
            })
        }
 }
```

```js
// 5. 每次调用then都会返回一个新创建的promise对象
function resolveRes(res, promise, resolve, reject) {
  if (promise === res) {
    reject(new Error("不能是相同实例"));
    return;
  }
}
```

**测试用例**

```js
let p = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve("1s 后 success");
  }, 1000);
});

let p1 = p.then((val) => {
  console.log(val);
  return p1; //返回自己当前实例
});
```

**测试截图**
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/5109ea0ff24247bd9c46ef3fc1f95469.png)

### 5.2 处理 then 返回 Promise 值

```js
// 修改resolveRes 函数，
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
```

**测试用例**

```js
//   5.2 处理then返回的promise
let p = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve("1s 后 success");
  }, 1000);
});
let p1 = p
  .then((val) => {
    console.log(val);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("2s 后 then回调");
      }, 1000);
    });
  })
  .then((val) => {
    console.log(val);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("3s 后 then 回调");
      }, 1000);
    });
  })
  .then((val) => {
    console.log(val);
  });
```

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/fa905a66b01b4a14a3b472b74a881581.png)

## 本节完整代码
```js
// MyPromise.js

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
          let res = onFulfilled(this.value);
          resolveRes(res, p, resolve, reject);
        });
      } else if (this.state === REJECTED) {
        queueMicrotask(() => {
          let res = onRejected(this.reason);
          resolveRes(res, p, resolve, reject);
        });
      } else {
        this.successCallback.push(() => {
          queueMicrotask(() => {
            let res = onFulfilled(this.value);
            // 拿到我们生成的实例，和用户的实例做对比
            resolveRes(res, p, resolve, reject);
          });
        });
        this.failCallback.push(() => {
          queueMicrotask(() => {
            let res = onRejected(this.reason);
            resolveRes(res, p, resolve, reject);
          });
        });
      }
    });
    return p;
  }
}
function resolveRes(res, promise, resolve, reject) {
  if (promise === res) {
    reject(new Error("不能是相同实例"));
    return;
  }
  if (res instanceof Promise) {
    res.then(resolve, reject);// 如果是promise，就调用它的then方法，并把当前的resolve，reject传递下去，它结束时就能调用
  } else {
    resolve(res);
  }
}

```
