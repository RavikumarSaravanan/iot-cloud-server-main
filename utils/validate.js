// import xss from 'xss';

// export function cleanStr(s, max=200){
//   if(typeof s !== 'string') return '';
//   const t = s.slice(0, max);
//   return xss(t);
// }

// export function required(v, name='field'){
//   if(!v || (typeof v==='string' && !v.trim())){
//     const e = new Error(`${name} is required`);
//     e.status = 422;
//     throw e;
//   }
//   return v;
// }
import xss from 'xss';

export function cleanStr(s, max=200){
  if(typeof s !== 'string') return '';
  const t = s.slice(0, max);
  // Additional security: remove null bytes and other dangerous characters
  const cleaned = t.replace(/\0/g, '').replace(/\x00/g, '');
  return xss(cleaned);
}

export function required(v, name='field'){
  if(!v || (typeof v==='string' && !v.trim())){
    const e = new Error(`${name} is required`);
    e.status = 422;
    throw e;
  }
  return v;
}

// Add email validation
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Add strong password validation
export function validatePassword(password) {
  // At least 8 characters, one uppercase, one lowercase, one number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return re.test(password);
}