class Person {
  constructor(name, gender) {
    this.name = name;
    this.gender = gender;
  }
}

class Student extends Person {
  constructor(name,gender,age) {
    super(name, gender);
    this.age = age
  }
  getInfo(){
    return `name : ${this.name } + age: ${this.age}`
  }
  static getInstance(name,gender,age) {
    return new Student(name,gender,age);
  }
}


let stu = new Student('张三','男','20')
console.log(stu.getInfo());
