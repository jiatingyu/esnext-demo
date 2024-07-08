function Parent() {
  this.name = "Parent";
  this.sayNum = 0;
  this.arr=[]
}
Parent.prototype.sayHello = function () {
  this.sayNum = this.sayNum + 1;
  this.arr.push(1)
  console.log("Hello from " + this.name);
};

function Child() {
  this.name = "Child";
}

// 设置Child的原型为Parent的实例
Child.prototype = new Parent();

// 创建Child的实例
let child = new Child();
let child2 = new Child();
child.sayHello(); // 输出: Hello from Child
child.sayHello(); // 输出: Hello from Child
console.log(child.sayNum);
console.log(child2.sayNum);
console.log(child2.arr);
