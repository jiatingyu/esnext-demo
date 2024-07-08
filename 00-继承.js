// 原型链继承

// 优点： 父类新增原型方法或属性，子类都能访问到，可共用方法
// 缺点：
// + 创建子类实例时，无法向父类构造函数传参。
// + 引用类型的属性会被所有实例共享
//  因为两个实例使用的是同一个原型对象。它们的内存空间是共享的，当一个发生变化的时候，另外一个也随之进行了变化，这就是使用原型链继承方式的一个缺点。

// function Parent() {
//   this.name = "Parent";
//   this.arr=[]
// }
// Parent.prototype.sayHello = function () {
//   this.arr.push(1)
//   console.log("Hello from " + this.name);
// };

// function Child() {
//   this.name = "Child";
// }

// // 设置Child的原型为Parent的实例
// Child.prototype = new Parent();

// // 创建Child的实例
// let child = new Child();
// let child2 = new Child();
// child.sayHello(); // 输出: Hello from Child
// child.sayHello(); // 输出: Hello from Child
// console.log(child.sayHello  === child2.sayHello); // true
// console.log(child.arr,child2.arr); // [ 1, 1 ] [ 1, 1 ]


// 构造函数继承
// 优点：可以向父类构造函数传参，解决原型链继承无法传参的问题。
// 缺点：每次创建子类实例时都会创建父类的方法，（无法实现函数复用），导致内存浪费
// function Parent(name) {
//   this.name = name;
//   this.arr=[]
// }
// Parent.prototype.sayHello = function () {
//   this.arr.push(1)
//   console.log("Hello from " + this.name);
// };

// function Child(name) {
//   Parent.call(this, name); // 调用Parent的构造函数
// }

// Child.prototype = new Parent(); // 继承Parent的原型方法
// Child.prototype.constructor = Child; // 修正构造函数指向

// var child = new Child('ziyu');
// var child1 = new Child('ziyu');
// console.log(child.sayHello()); 
// console.log(child.sayHello()); 
// console.log(child.arr, child1.arr); // 输出: [ 1, 1 ] []

// 优点: 可以传参，并且可以复用父类方法,可以避免引用类型属性共享的问题。
// 缺点: 父类构造函数被调用了两次，一次在设置原型时，一次在构造函数中，可能会导致不必要性能开销。
// function Parent(name) {
//   this.name = name;
// }
// Parent.prototype.sayHello = function() {
//   console.log('Hello from ' + this.name);
// };

// function Child(name, age) {
//   Parent.call(this, name); // 调用Parent的构造函数 ,   第一次调用
//   this.age = age;
// }

// // 通过原型链继承Parent的方法
// Child.prototype = Object.create(Parent.prototype);    // 第二次调用
// Child.prototype.constructor = Child;

// Child.prototype.sayBye = function() {
//   console.log('Bye from ' + this.name);
// };

// var child = new Child('ziyu', 25);
// child.sayHello(); // 输出: Hello from ziyu
// child.sayBye(); // 输出: Bye from ziyu


function Parent(name) {
  this.name = name;
}
Parent.prototype.sayHello = function() {
  console.log('Hello from ' + this.name);
};

function Child(name, age) {
  // 创建一个没有实例的Parent对象
  var fakeParent = Object.create(Parent.prototype);
  Parent.call(fakeParent, name);
  this.age = age;
}

Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;

Child.prototype.sayBye = function() {
  console.log('Bye from ' + this.name);
};

var child = new Child('ziyu', 25);
child.sayHello(); // 输出: Hello from ziyu
child.sayBye(); // 输出: Bye from ziyu

// class Parent {
//   constructor(name) {
//     this.name = name;
//   }
//   sayHello() {
//     console.log('Hello from ' + this.name);
//   }
// }

// class Child extends Parent {
//   constructor(name, age) {
//     super(name); // 调用父类的构造函数
//     this.age = age;
//   }
//   sayBye() {
//     console.log('Bye from ' + this.name);
//   }
// }

// var child = new Child('Kimi', 25);
// child.sayHello(); // 输出: Hello from Kimi
// child.sayBye(); // 输出: Bye from Kimi