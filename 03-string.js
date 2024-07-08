// Basic literal string creation
console.log(`This is a pretty little template string.`)

// Multiline strings
console.log(
    `In ES5 this is
     not legal.`
);

// 插值变量绑定
let name = "Bob", time = "today";
console.log(`Hello ${name}, how are you ${time}?`)

// 未转义的模板字符串
console.log( String.raw`In ES5 "\n" is a line-feed.`)
