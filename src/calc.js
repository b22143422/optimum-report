/* 점수·오답률 계산 (화면·저장 공통) */

export const r1 = (x) => Math.round(x * 10) / 10;
export const num = (x) => {
  const n = Number(String(x ?? "").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

/* 리포트 data → 시험 문항 목록. 서술형 키는 "서1"처럼 앞에 '서'를 붙임 */
export function itemsFromReport(data) {
  const obj = (data.objective || []).map((r) => ({
    key: String(r.no), kind: "obj", pts: num(r.pts), type: r.type || "", source: r.source || ""
  }));
  const subj = (data.subjective || []).map((r) => ({
    key: "서" + String(r.no).replace(/^서/, ""), kind: "subj", pts: num(r.pts), type: r.type || "", source: r.source || ""
  }));
  return [...obj, ...subj];
}

/* 리포트 제목 → 회차 정보 추정 ("2026 대청고 1학년 2학기 1차 공통영어2 지필평가 출제 분석") */
export function metaFromTitle(title) {
  const t = String(title || "");
  const m = {
    year: (t.match(/(20\d{2})/) || [])[1] || "",
    school: (t.match(/(\S+고)\s*\d\s*학년/) || t.match(/(\S+고)(?=\s|\d)/) || [])[1] || "",
    grade: (t.match(/(\d)\s*학년/) || [])[1] || "",
    semester: (t.match(/(\d)\s*학기/) || [])[1] || "",
    round: (t.match(/(\d)\s*차/) || [])[1] || "",
    subject: ""
  };
  const sm = t.match(/\d\s*차\s+(\S+)/);
  if (sm && !/지필|출제|분석/.test(sm[1])) m.subject = sm[1];
  return m;
}

export function examMax(exam) {
  if (exam.items && exam.items.length) {
    const o = exam.items.filter((i) => i.kind === "obj").reduce((s, i) => s + num(i.pts), 0);
    const s = exam.items.filter((i) => i.kind === "subj").reduce((s2, i) => s2 + num(i.pts), 0);
    return { obj: r1(o), subj: r1(s), total: r1(o + s) };
  }
  const o = num(exam.objMax), s = num(exam.subjMax);
  return { obj: r1(o), subj: r1(s), total: r1(o + s) || 100 };
}

export const examLabel = (e) =>
  `${e.year || ""} ${e.school || ""}${e.grade ? e.grade : ""} ${e.semester ? e.semester + "학기" : ""} ${e.round ? e.round + "차" : ""} ${e.subject || ""}`.replace(/\s+/g, " ").trim();

/* 입력값 → 저장할 점수 레코드 (obj·subj·total 계산 포함)
   mode: "items"(문항별 체크) | "split"(객관식·서술형 점수) | "total"(총점만) */
export function buildScore(exam, mode, input) {
  if (mode === "items") {
    const objWrong = input.objWrong || [];
    const subjEarned = {};
    let obj = 0, subj = 0;
    (exam.items || []).forEach((it) => {
      if (it.kind === "obj") {
        if (!objWrong.includes(it.key)) obj += num(it.pts);
      } else {
        const v = input.subjEarned && input.subjEarned[it.key] != null && input.subjEarned[it.key] !== ""
          ? Math.max(0, Math.min(num(it.pts), num(input.subjEarned[it.key])))
          : num(it.pts);
        subjEarned[it.key] = v;
        subj += v;
      }
    });
    return { mode, objWrong, subjEarned, obj: r1(obj), subj: r1(subj), total: r1(obj + subj) };
  }
  if (mode === "split") {
    const obj = r1(num(input.obj)), subj = r1(num(input.subj));
    return { mode, obj, subj, total: r1(obj + subj) };
  }
  return { mode: "total", total: r1(num(input.total)) };
}

const avg = (arr) => (arr.length ? r1(arr.reduce((s, x) => s + x, 0) / arr.length) : null);

/* 시험 1회차 통계 */
export function examStats(exam, scores) {
  const totals = scores.filter((s) => s.total != null).map((s) => num(s.total));
  const objs = scores.filter((s) => s.mode !== "total" && s.obj != null).map((s) => num(s.obj));
  const subjs = scores.filter((s) => s.mode !== "total" && s.subj != null).map((s) => num(s.subj));
  const detailed = scores.filter((s) => s.mode === "items");
  const nItems = detailed.length;
  const rows = (exam.items || []).map((it) => {
    let wrong = 0, earnedSum = 0;
    detailed.forEach((s) => {
      if (it.kind === "obj") {
        if ((s.objWrong || []).includes(it.key)) wrong++;
      } else {
        const e = s.subjEarned && s.subjEarned[it.key] != null ? num(s.subjEarned[it.key]) : num(it.pts);
        earnedSum += e;
        if (e < num(it.pts)) wrong++;
      }
    });
    return {
      ...it,
      wrong,
      rate: nItems ? Math.round((wrong / nItems) * 100) : null,
      earnRate: it.kind === "subj" && nItems && num(it.pts) ? Math.round((earnedSum / (nItems * num(it.pts))) * 100) : null
    };
  });
  const errorRate = {};
  if (nItems) rows.forEach((r) => { errorRate[r.key] = r.rate; });
  return {
    n: totals.length,
    nItems,
    avg: avg(totals),
    objAvg: avg(objs),
    subjAvg: avg(subjs),
    max: totals.length ? Math.max(...totals) : null,
    min: totals.length ? Math.min(...totals) : null,
    rows,
    errorRate
  };
}

/* 한 시험에서 특정 점수의 원내 석차 */
export function rankOf(total, scores) {
  const t = num(total);
  return 1 + scores.filter((s) => s.total != null && num(s.total) > t).length;
}
