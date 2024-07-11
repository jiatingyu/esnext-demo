// > 代理支持创建具有各种行为的对象 主机对象。可用于拦截、对象虚拟化、 日志记录/分析等。

// Proxying a normal object
// let target = {};
// let handler = {
//   get: function (receiver, key) {
//     return `Hello, ${key}!`;
//   },
//   set: function (receiver, key , value) {
//     console.log(receiver , key, value);
//     receiver[key] = value
//   }
// };

// let p = new Proxy(target, handler);
// console.log( p.world === "Hello, world!") // true
// p.name = 'ziyu' // // {} name ziyu
// console.log(p); // { name: 'ziyu' }

// Proxying a function object
let target = function (name) {
  this.name = name;
  return "I am the target";
};
let handler = {
  get: function (receiver, key) {
    console.log("get:", receiver, key);
    return Reflect.get(receiver, key);
  },
  set: function (receiver, key, value) {
    console.log("set:", receiver, key, value);
    return Reflect.set(receiver, key, value);
  },
  has: function (receiver, key) {
    console.log("has:", receiver, key);
    return Reflect.has(receiver, key);
  },
  deleteProperty: function (receiver, key) {
    console.log("deleteProperty:", receiver, key);
    return Reflect.deleteProperty(receiver, key);
  },
  // 函数调用
  apply: function (receiver, ...args) {
    console.log("apply:", receiver, args);
    return Reflect.apply(receiver, ...args);
  },
  // 函数new
  construct: function (receiver, ...args) {
    console.log("construct:", receiver, args);
    return Reflect.construct(receiver, ...args);
  },
  ownKeys: function (receiver) {
    console.log("ownKeys:", receiver);
    return Reflect.ownKeys(receiver);
  },
};

let p = new Proxy(target, handler);
p.name;
p.name = "proxyName";
"name" in p;
delete p.name;
p("ziyu");
let p1 = new p("ziyu");

console.log(Object.keys(p));
// console.log(p1);