// 默认参数
function f(x, y = 12) {
  return x + y;
}
f(3) == 15;

// reset参数
function f(x, ...y) {
  // y is an Array
  return x * y.length;
}
f(3, "hello", true) == 6;
// 参数展开
function f(x, y, z) {
  return x + y + z;
}
// Pass each elem of array as argument
f(...[1, 2, 3]) == 6;