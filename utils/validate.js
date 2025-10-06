import xss from 'xss';

export function cleanStr(s, max=200){
  if(typeof s !== 'string') return '';
  const t = s.slice(0, max);
  return xss(t);
}

export function required(v, name='field'){
  if(!v || (typeof v==='string' && !v.trim())){
    const e = new Error(`${name} is required`);
    e.status = 422;
    throw e;
  }
  return v;
}
