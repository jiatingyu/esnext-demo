const getASTNode = () => ({
  op: { name: "张三" },
  lhs: { op: "李四" },
  rhs: { op: "王五" },
});

// 数组匹配
var [a1, , b1] = [1, 2, 3];
console.log(a1 === 1); // true
console.log(b1 === 3); // true

// 对象匹配
let {
  op: a,
  lhs: { op: b },
  rhs: c,
} = getASTNode();
console.log("a,b,c", a, b, c); // a,b,c { name: '张三' } 李四 { op: '王五' }

// 结构绑定 `op`, `lhs` and `rhs`
let { op, lhs, rhs } = getASTNode();
console.log(op, lhs, rhs); // { name: '张三' } { op: '李四' } { op: '王五' }

// Can be used in parameter position
function g({ name: x }) {
  console.log(x); // 5
}
g({ name: 5 });

// 无效解构
let [a2] = [];
console.log(a2 === undefined); // true

// 带有默认值的软故障解构
let [a3 = 1] = [];
console.log(a3 === 1); // true

// 结构 + 默认参数
function r({ x, y, w = 10, h = 10 }) {
  return x + y + w + h;
}
console.log(r({ x: 1, y: 2 }) === 23); // true




