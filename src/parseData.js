/* 붙여넣은 data.js 텍스트 → 객체
   허용 형태: export default {...} / export const data = {...} / const data = {...} / 그냥 {...} / JSON */
export function parseDataText(text) {
  let s = String(text || "").trim();
  if (!s) throw new Error("내용이 비어 있습니다.");
  s = s.replace(/^﻿/, "");
  // ```js ... ``` 코드블록 감싸기 제거
  s = s.replace(/^```[a-zA-Z]*\s*/, "").replace(/```\s*$/, "").trim();
  // 선언부 제거
  s = s.replace(/^export\s+default\s+/, "");
  s = s.replace(/^export\s+(const|let|var)\s+\w+\s*=\s*/, "");
  s = s.replace(/^(const|let|var)\s+\w+\s*=\s*/, "");
  s = s.replace(/^module\.exports\s*=\s*/, "");
  // 끝의 export 문 제거
  s = s.replace(/;?\s*export\s+default\s+\w+\s*;?\s*$/, "");
  s = s.replace(/;\s*$/, "");
  let obj;
  try {
    obj = JSON.parse(s);
  } catch (_) {
    try {
      // eslint-disable-next-line no-new-func
      obj = new Function("return (" + s + ");")();
    } catch (e) {
      throw new Error("형식 오류: " + e.message);
    }
  }
  if (!obj || typeof obj !== "object") throw new Error("객체 형태가 아닙니다.");
  if (!obj.items) obj.items = [];
  if (!obj.objective) obj.objective = [];
  if (!obj.subjective) obj.subjective = [];
  return obj;
}
