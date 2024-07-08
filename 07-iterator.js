let fibonacci = {
  [Symbol.iterator]() {
    let pre = 0,
      cur = 1;
    return {
      next() {
        [pre, cur] = [cur, pre + cur];
        if(cur >100){
            return { done: true, value: cur };
        }else{
            return { done: false, value: cur };
        }
      },
    };
  },
};

for (var n of fibonacci) {
  console.log(n);

}
