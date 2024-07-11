
// 实现步骤
// 1. 新建Promise需要使用new关键字，那他肯定是作为面向对象的方式调用的，Promise是一个类。
// 2. new Promise(fn) 的时候需要传一个函数进去，说明Promise的参数是一个函数
// 3. 构造函数传进去的fn会收到resolve和reject两个函数，用来表示Promise成功和失败，说明构造函数里面还需要resolve和reject这两个函数，这两个函数的作用是改变Promise的状态。
// 4. 根据规范，promise 有 pending，fulfilled，rejected三个状态，初始状态为pending，调用resolve会将其改为fulfilled，调用reject会改为rejected。
// 5. promise实例对象建好后可以调用then方法，说明then是一个实例方法。而且then方法可以链式调用，说明他很方法返回一个新的promise实例,(原生Promise不能自己返回自己)

// 初始三个变量
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
    // 初始化参数
    state = PENDING;
    value = null;
    reason = "";
    // 构造函数
    constructor(exec) {
        // 传递两个函数,绑定 this 避免 this指向出错
        try {
            exec(this.resolve.bind(this), this.reject.bind(this))
        } catch (error) {
            this.reject(error.message)
        }
    }
    resolve(value) {
        // 判断状态, 修改状态 并赋值
        if (this.state === PENDING) {
            this.state = FULFILLED
            this.value = value
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
    successCallback = []
    failCallback = []
    then(onFulfilled, onRejected) {
        onFulfilled = onFulfilled ? onFulfilled : (value) => value
        onRejected = onRejected ? onRejected : (reason) => { throw Error(reason) }
        // 返回一个新的实例
        let p = new Promise((resolve, reject) => {
            if (this.state === FULFILLED) {
                queueMicrotask(() => {
                    let res = onFulfilled(this.value)
                    resolveRes(res, p, resolve, reject)
                })
            } else if (this.state === REJECTED) {
                queueMicrotask(() => {
                    let res = reject(onRejected(this.reason))
                    resolveRes(res, p, resolve, reject)
                })
            } else {
                this.successCallback.push(() => {
                    queueMicrotask(() => {
                        let res = onFulfilled(this.value)
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
        })
        return p
    }
}
function resolveRes(res, promise, resolve, reject) {
    console.log(res,promise);
    if (promise === res) {
        reject(new Error("不能是相同实例"));
        return;
    }
    if (res instanceof Promise) {
        res.then(resolve, reject)
    } else {
        resolve(res)
    }
}
// export default Promise




// 4.
// then(onFulfilled, onRejected) {
//     onFulfilled = onFulfilled ? onFulfilled : (value) => value
//     onRejected = onRejected ? onRejected : (reason) => { throw Error(reason) }
//     // 返回一个新的实例
//     let p = new Promise((resolve, reject) => {
//         if (this.state === FULFILLED) {
//             resolve(onFulfilled(this.value))
//         } else if (this.state === REJECTED) {
//             reject(onRejected(this.reason))
//         } else {
//             this.successCallback.push(() => resolve(onFulfilled(this.value)))
//             this.failCallback.push(() => reject(onRejected(this.reason)))
//         }
//     })
//     return p
// }


// 5.
// then(onFulfilled, onRejected) {
//     onFulfilled = onFulfilled ? onFulfilled : (value) => value
//     onRejected = onRejected ? onRejected : (reason) => { throw Error(reason) }
//     // 返回一个新的实例
//     let p = new Promise((resolve, reject) => {
//         if (this.state === FULFILLED) {
//             let res = onFulfilled(this.value)
//             resolveRes(res, resolve, reject)
//         } else if (this.state === REJECTED) {
//             let res = reject(onRejected(this.reason))
//             resolveRes(res, resolve, reject)
//         } else {
//             this.successCallback.push(() => {
//                 let res = onFulfilled(this.value)
//                 resolveRes(res, resolve, reject)
//             })
//             this.failCallback.push(() => {
//                 let res = onRejected(this.reason)
//                 resolveRes(res, resolve, reject)
//             })
//         }
//     })
//     return p
// }