let user= {
    name :'ziyu',
    age:20
}

const handler = ()=> 123

let obj = {
    // 设置原型链. "__proto__" or '__proto__' 
    __proto__: user,
    // ['__proto__']: user,
    
    // handler: handler 简写
    handler,
    // Methods
    toString() {
     // Super 调用
     return "d " + super.toString();
    },
    // 动态属性名
    [ "prop_" + (() => 42)() ]: 42
};

console.log(obj.__proto__ ,`name:` , obj.name);
console.log(obj.toString());