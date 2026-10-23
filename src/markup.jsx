/* ─────────────────────────────────────────────────────────────
   인라인 마크업 → React 노드
   [y:텍스트|①]  노랑 형광 (+ 오른쪽 위 작은 번호, 생략 가능)
   [b:텍스트|③]  파랑 형광 — 부연설명 대상 선지 전용
   [w:단어|뜻]    단어 위에 작은 뜻
   [x:단어]       오답 키워드 배제 ✕
   [ko:우리말]    밑줄 친 우리말(영작 대상)
   [lab:(A)]     굵은 라벨
   [u:텍스트]     밑줄
   [q:텍스트]     선지 설명 안 본문 인용(노랑)   [qb:텍스트] (파랑)
   [skip]         […] 생략 표시
   [blank] / [blank:40]  빈칸 밑줄 (mm)
   **굵게**
   중첩 가능: [y:being [w:cautious|조심하는] while …|B]
   ───────────────────────────────────────────────────────────── */
import React from "react";

const TAGS = ["y", "b", "w", "x", "ko", "lab", "u", "q", "qb", "skip", "blank"];

function splitTop(inner) {
  // 최상위(중첩 밖) 마지막 '|' 기준 분리
  let depth = 0, pos = -1;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === "[") depth++;
    else if (ch === "]") depth--;
    else if (ch === "|" && depth === 0) pos = i;
  }
  if (pos < 0) return [inner, null];
  return [inner.slice(0, pos), inner.slice(pos + 1)];
}

let keySeq = 0;
const k = () => "m" + (keySeq++);

function render(tag, inner, extra) {
  switch (tag) {
    case "y":
      return <mark key={k()}>{parse(inner)}{extra ? <sup>{extra}</sup> : null}</mark>;
    case "b":
      return <mark key={k()} className="b">{parse(inner)}{extra ? <sup>{extra}</sup> : null}</mark>;
    case "w":
      return <ruby key={k()}>{parse(inner)}<rt>{extra || ""}</rt></ruby>;
    case "x":
      return <span key={k()} className="xk">{parse(inner)}</span>;
    case "ko":
      return <span key={k()} className="ko">{parse(inner)}</span>;
    case "lab":
      return <span key={k()} className="lab">{parse(inner)}</span>;
    case "u":
      return <u key={k()}>{parse(inner)}</u>;
    case "q":
      return <q key={k()}>{parse(inner)}</q>;
    case "qb":
      return <q key={k()} className="b">{parse(inner)}</q>;
    case "skip":
      return <span key={k()} className="skip">[…]</span>;
    case "blank": {
      const w = inner && /^\d+$/.test(inner.trim()) ? inner.trim() + "mm" : "22mm";
      return <span key={k()} className="blank" style={{ minWidth: w }}>&nbsp;</span>;
    }
    default:
      return inner;
  }
}

export function parse(str) {
  if (str == null) return null;
  if (typeof str !== "string") return str;
  const out = [];
  let buf = "";
  let i = 0;
  const flush = () => { if (buf) { out.push(buf); buf = ""; } };

  while (i < str.length) {
    if (str[i] === "[") {
      const rest = str.slice(i);
      const m = /^\[([a-z]+)(:|\])/.exec(rest);
      if (m && TAGS.includes(m[1])) {
        const tag = m[1];
        if (m[2] === "]") { // [skip] [blank]
          flush();
          out.push(render(tag, "", null));
          i += m[0].length;
          continue;
        }
        // 짝 맞는 ] 찾기
        let depth = 1, j = i + m[0].length;
        while (j < str.length && depth > 0) {
          if (str[j] === "[") depth++;
          else if (str[j] === "]") depth--;
          j++;
        }
        const inner = str.slice(i + m[0].length, j - 1);
        flush();
        if (tag === "blank") {
          out.push(render(tag, inner, null));
        } else if (tag === "y" || tag === "b" || tag === "w") {
          const [a, b] = splitTop(inner);
          out.push(render(tag, a, b));
        } else {
          out.push(render(tag, inner, null));
        }
        i = j;
        continue;
      }
    }
    if (str.startsWith("**", i)) {
      const e = str.indexOf("**", i + 2);
      if (e > i + 1) {
        flush();
        out.push(<b key={k()}>{parse(str.slice(i + 2, e))}</b>);
        i = e + 2;
        continue;
      }
    }
    buf += str[i];
    i++;
  }
  flush();
  return out;
}

/* 지문: 줄바꿈 단위 문단. "(A) …" 로 시작하는 줄은 라벨 단락 */
export function Passage({ text, className, style }) {
  if (!text) return null;
  const lines = String(text).split("\n").map((l) => l.trim()).filter(Boolean);
  return (
    <div className={"passage " + (className || "")} style={style}>
      {lines.map((line, idx) => {
        const m = /^\((?:[A-E]|[가-마]|\d)\)\s*/.exec(line);
        if (m) {
          return (
            <div className="para" key={idx}>
              <span className="lab">{m[0].trim()}</span>
              <span>{parse(line.slice(m[0].length))}</span>
            </div>
          );
        }
        return <div key={idx} className="pline">{parse(line)}</div>;
      })}
    </div>
  );
}
