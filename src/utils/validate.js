// 正则表达式验证手机格式
export function rulesTel(rule, tel, callback) {
  const reg = /^1[0-9]\d{9}$/;
  if (reg.test(tel)) {
    callback();
  } else {
    return callback(new Error('手机格式不正确,请重新输入'));
  }
}

// 正则表达式验证正整数
export function rulesInt(rule, values, callback) {
  const reg = /^[0-9]+$/;
  if (reg.test(values)) {
    callback();
  } else {
    return callback(new Error('请输入正整数'));
  }
}

// 正则表达式校验esn
export function rulesEsn(rule, esn, callback) {
  const reg = /^[0-9A-Za-z]+$/;
  if (reg.test(esn)) {
    callback();
  } else {
    return callback(new Error('格式不正确,请重新输入'));
  }
}

// 正则表达式验证邮箱格式
export function rulesEmail(rule, email, callback) {
  const reg = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;
  if (reg.test(email)) {
    callback();
  } else {
    return callback(new Error('邮箱格式不正确,请重新输入'));
  }
}

// 正则表达式判断字母+数字或字母
export function rulesValue(rule, values, callback) {
  const letter = /^[A-Za-z]+$/;
  const reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]*$/;
  if (letter.test(values) || reg.test(values)) {
    callback();
  } else {
    return callback(new Error('请输入字母或（字母+数字）'));
  }
}

// 正则表达式匹配特效字符
export function ruleSpecial(rule, value, callback) {
  const reg = /[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/im;
  if (reg.test(value)) {
    callback();
  } else {
    return callback(new Error('不支持特殊字符,请重新输入'));
  }
}

