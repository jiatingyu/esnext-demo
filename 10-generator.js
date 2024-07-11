// function* helloWorldGenerator() {
//     yield 'hello';
//     yield 'world';
//     yield 'ending';
//   }
//   var hw = helloWorldGenerator();

//   for(let item of hw){
//     console.log(item);
//   }

function* asyncGenerator() {
    yield Promise.resolve(1);
    yield Promise.resolve(2);
    yield Promise.resolve(3);
  }
  
  async function useAsyncGenerator() {
    for await (const value of asyncGenerator()) {
      console.log(value);
    }
  }
  
  useAsyncGenerator();
