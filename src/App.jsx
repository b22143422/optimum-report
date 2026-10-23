import React, { useEffect, useState } from "react";
import Cover from "./Cover.jsx";
import Explain from "./Explain.jsx";
import { parseDataText } from "./parseData.js";
import { saveReport, listReports, deleteReport } from "./firebase.js";
import { SAMPLE_TEXT } from "./sample.js";

const TABS = [
  { id: "report", label: "리포트" },
  { id: "list", label: "목록" },
  { id: "score", label: "점수기록" }
];

function fmtDate(d) {
  if (!d) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function App() {
  const [tab, setTab] = useState("report");
  const [text, setText] = useState("");
  const [data, setData] = useState(null);
  const [docId, setDocId] = useState(null);
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState([]);
  const [coverPages, setCoverPages] = useState(1);
  const [showInput, setShowInput] = useState(true);
  const [busy, setBusy] = useState("");
  const [list, setList] = useState(null);

  const apply = (t) => {
    try {
      const d = parseDataText(t);
      setData(d);
      setError("");
      setShowInput(false);
    } catch (e) {
      setError(e.message);
    }
  };

  const onSave = async () => {
    if (!data) return;
    const title = data.title || data.examHeader || "제목 없음";
    setBusy("저장 중…");
    try {
      const id = await saveReport(docId, title, data);
      setDocId(id);
      setBusy("저장 완료");
      setTimeout(() => setBusy(""), 1500);
    } catch (e) {
      setBusy("");
      alert("저장 실패: " + e.message);
    }
  };

  const loadList = async () => {
    setList(null);
    try { setList(await listReports()); }
    catch (e) { setList([]); alert("목록 불러오기 실패: " + e.message); }
  };
  useEffect(() => { if (tab === "list") loadList(); }, [tab]);

  const openItem = (it) => {
    try {
      const d = JSON.parse(it.json);
      setData(d); setDocId(it.id); setText(it.json); setError(""); setShowInput(false); setTab("report");
    } catch (e) { alert("불러오기 실패: " + e.message); }
  };
  const removeItem = async (it) => {
    if (!window.confirm(`삭제할까요?\n${it.title}`)) return;
    await deleteReport(it.id);
    if (docId === it.id) setDocId(null);
    loadList();
  };

  return (
    <div className="app">
      <nav className="topbar no-print">
        <div className="brand"><img src="/logo.png" alt="" /><span>내신분석 리포트</span></div>
        <div className="tabs">
          {TABS.map((t) => (
            <button key={t.id} className={"tab" + (tab === t.id ? " on" : "")} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>
      </nav>

      {tab === "report" && (
        <>
          <div className="panel no-print">
            <div className="panel-row">
              <button className="btn" onClick={() => setShowInput((v) => !v)}>{showInput ? "입력창 접기" : "입력창 열기"}</button>
              <button className="btn" onClick={() => { setText(SAMPLE_TEXT); apply(SAMPLE_TEXT); setDocId(null); }}>샘플 불러오기</button>
              <span className="spacer" />
              {data && <button className="btn" onClick={onSave}>{docId ? "수정 저장" : "목록에 저장"}</button>}
              {data && <button className="btn primary" onClick={() => window.print()}>인쇄 / PDF</button>}
              {busy && <span className="busy">{busy}</span>}
            </div>
            {showInput && (
              <>
                <textarea
                  className="input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="채팅에서 뽑은 data.js 내용을 통째로 붙여넣고 [미리보기 적용]을 누르세요."
                  spellCheck={false}
                />
                <div className="panel-row">
                  <button className="btn primary" onClick={() => { apply(text); setDocId(null); }}>미리보기 적용</button>
                  {error && <span className="err">⚠ {error}</span>}
                </div>
              </>
            )}
            {warnings.length > 0 && (
              <ul className="warn">{warnings.map((w, i) => <li key={i}>⚠ {w}</li>)}</ul>
            )}
          </div>

          {data && (
            <div className="report-wrap">
              <Cover data={data} onPages={setCoverPages} />
              <Explain data={data} startPage={coverPages + 1} onWarnings={setWarnings} />
            </div>
          )}
          {!data && <p className="empty no-print">리포트 데이터를 붙여넣거나 목록에서 불러오세요.</p>}
        </>
      )}

      {tab === "list" && (
        <div className="panel">
          <div className="panel-row">
            <h2 className="ptitle">저장된 리포트</h2>
            <span className="spacer" />
            <button className="btn" onClick={loadList}>새로고침</button>
          </div>
          {list === null && <p className="empty">불러오는 중…</p>}
          {list && list.length === 0 && <p className="empty">저장된 리포트가 없습니다.</p>}
          {list && list.length > 0 && (
            <table className="ltable">
              <thead><tr><th>제목</th><th>수정일</th><th></th></tr></thead>
              <tbody>
                {list.map((it) => (
                  <tr key={it.id}>
                    <td>{it.title}</td>
                    <td>{fmtDate(it.updatedAt)}</td>
                    <td className="acts">
                      <button className="btn sm primary" onClick={() => openItem(it)}>불러오기</button>
                      <button className="btn sm" onClick={() => removeItem(it)}>삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "score" && (
        <div className="panel">
          <h2 className="ptitle">점수기록</h2>
          <p className="empty">준비 중 — 학교별 학생 명단 입력 → 문항별 O/X 체크 → 오답률 계산 → 리포트 1면 반영 (3차 작업)</p>
        </div>
      )}
    </div>
  );
}
