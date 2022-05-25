export const base64Encode = (str) => btoa(unescape(encodeURIComponent(str)));
export const base64Decode = (str) => decodeURIComponent(escape(atob(str)));
