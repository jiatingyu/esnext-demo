const toChinesNum = (num) => {
  let flag = num >= 0 ? true : false;
  if (!flag) {
    num = Math.abs(num);
  }
  let changeNum = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"]; //changeNum[0] = "零"
  let unit = ["", "拾", "佰", "仟", "万"];
  num = parseInt(num);
  let getWan = (temp) => {
    let strArr = temp.toString().split("").reverse();
    if(strArr.length === 1 && +strArr[0]===0){
        return changeNum[0]
    }
    let newNum = "";
    for (var i = 0; i < strArr.length; i++) {
      newNum =
        (i == 0 && strArr[i] == 0
          ? ""
          : i > 0 && strArr[i] == 0 && strArr[i - 1] == 0
          ? ""
          : changeNum[strArr[i]] + (strArr[i] == 0 ? unit[0] : unit[i])) +
        newNum;
    }
    return newNum;
  };
  let overWan = Math.floor(num / 10000);
  let noWan = num % 10000;
  if (noWan.toString().length < 4) noWan = 0 + noWan;
  let res = overWan ? getWan(overWan) + "万" + getWan(noWan) : getWan(num);
  return flag ? res + "元" : "负" + res + "元";
};


console.log(toChinesNum(1500));

