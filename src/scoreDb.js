/* 점수기록 저장소 (Firestore)
   students : 학생 { name, school, grade, branch, memo }
   exams    : 시험 회차 { school, grade, year, semester, round, subject, reportId, items[{key,kind,pts,type}], objMax, subjMax }
   scores   : 점수 (문서 id = 시험id__학생id) { examId, studentId, mode, obj, subj, total, objWrong[], subjEarned{} } */
import { db } from "./firebase.js";
import {
  collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, where, writeBatch, serverTimestamp
} from "firebase/firestore";

const ko = (a, b) => String(a || "").localeCompare(String(b || ""), "ko");

/* ───── 학생 ───── */
export async function listStudents() {
  const s = await getDocs(collection(db, "students"));
  return s.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => ko(a.school, b.school) || (Number(a.grade) || 0) - (Number(b.grade) || 0) || ko(a.name, b.name));
}

export async function saveStudent(id, v) {
  const ref = id ? doc(db, "students", id) : doc(collection(db, "students"));
  await setDoc(ref, { ...v, updatedAt: serverTimestamp(), ...(id ? {} : { createdAt: serverTimestamp() }) }, { merge: true });
  return ref.id;
}

export async function addStudentsBulk(list) {
  const batch = writeBatch(db);
  list.forEach((v) => {
    batch.set(doc(collection(db, "students")), { ...v, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  });
  await batch.commit();
}

export async function deleteStudent(id) {
  const sc = await getDocs(query(collection(db, "scores"), where("studentId", "==", id)));
  const batch = writeBatch(db);
  sc.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, "students", id));
  await batch.commit();
}

/* ───── 시험 회차 ───── */
export async function listExams() {
  const s = await getDocs(collection(db, "exams"));
  return s.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) =>
      (Number(b.year) || 0) - (Number(a.year) || 0) ||
      (Number(b.semester) || 0) - (Number(a.semester) || 0) ||
      (Number(b.round) || 0) - (Number(a.round) || 0) ||
      ko(a.school, b.school) || (Number(a.grade) || 0) - (Number(b.grade) || 0));
}

export async function saveExam(id, v) {
  const ref = id ? doc(db, "exams", id) : doc(collection(db, "exams"));
  await setDoc(ref, { ...v, updatedAt: serverTimestamp(), ...(id ? {} : { createdAt: serverTimestamp() }) }, { merge: true });
  return ref.id;
}

export async function deleteExam(id) {
  const sc = await getDocs(query(collection(db, "scores"), where("examId", "==", id)));
  const batch = writeBatch(db);
  sc.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, "exams", id));
  await batch.commit();
}

/* ───── 점수 ───── */
export const scoreId = (examId, studentId) => `${examId}__${studentId}`;

export async function listScoresByExam(examId) {
  const s = await getDocs(query(collection(db, "scores"), where("examId", "==", examId)));
  return s.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function listScoresByStudent(studentId) {
  const s = await getDocs(query(collection(db, "scores"), where("studentId", "==", studentId)));
  return s.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function listAllScores() {
  const s = await getDocs(collection(db, "scores"));
  return s.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function saveScore(examId, studentId, v) {
  await setDoc(doc(db, "scores", scoreId(examId, studentId)), {
    examId, studentId, ...v, updatedAt: serverTimestamp()
  });
}

export async function deleteScore(examId, studentId) {
  await deleteDoc(doc(db, "scores", scoreId(examId, studentId)));
}

/* ───── 리포트 연동 ───── */
export async function getReportData(reportId) {
  const snap = await getDoc(doc(db, "reports", reportId));
  if (!snap.exists()) return null;
  const v = snap.data();
  return { title: v.title, data: JSON.parse(v.json) };
}

/* 리포트 data에 errorRate·stats를 넣어 저장하고, 갱신된 data를 돌려줌 */
export async function applyStatsToReport(reportId, errorRate, stats) {
  const r = await getReportData(reportId);
  if (!r) throw new Error("연결된 리포트를 찾을 수 없습니다.");
  const data = { ...r.data, errorRate, stats };
  await setDoc(doc(db, "reports", reportId), { json: JSON.stringify(data), updatedAt: serverTimestamp() }, { merge: true });
  return data;
}
