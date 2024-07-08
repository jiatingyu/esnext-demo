function f() {
  {
    let x;
    {
      // 这是一个独立的区域
      const x = "sneaky";
      // error, const 不能再赋值
      x = "foo";
    }
    // 复制成功,let声明
    x = "bar";
    // error, 已经在上面声明了
    //   let x = "inner";
  }
}
