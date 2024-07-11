let fibonacci = {
  friends: ["盖伦", "阿木木", "安妮"],
  [Symbol.iterator]() {
    let len = this.friends.length;
    let index = 0;
    return {
      next:()=> {
        if (index <= len - 1) {
          return { done: false, value: this.friends[index++] };
        }else{
          return { done: true, value: null };
        }
      },
    };
  },
};

for (var n of fibonacci) {
  console.log(n);
}
