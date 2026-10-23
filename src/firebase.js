import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, doc, setDoc, getDocs, deleteDoc, query, orderBy, serverTimestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBqZDuKnbPiZhSQgbIB1TMHRHW6RnD0zUI",
  authDomain: "optimum-report-9fe89.firebaseapp.com",
  projectId: "optimum-report-9fe89",
  storageBucket: "optimum-report-9fe89.firebasestorage.app",
  messagingSenderId: "296411330090",
  appId: "1:296411330090:web:36ba3251686d982299b553"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const COL = "reports";

/* 리포트 저장 (id 없으면 새로 만듦) */
export async function saveReport(id, title, data) {
  const ref = id ? doc(db, COL, id) : doc(collection(db, COL));
  await setDoc(ref, {
    title,
    json: JSON.stringify(data),
    updatedAt: serverTimestamp(),
    ...(id ? {} : { createdAt: serverTimestamp() })
  }, { merge: true });
  return ref.id;
}

/* 목록 (최근 수정순) */
export async function listReports() {
  const q = query(collection(db, COL), orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const v = d.data();
    return {
      id: d.id,
      title: v.title || "(제목 없음)",
      updatedAt: v.updatedAt && v.updatedAt.toDate ? v.updatedAt.toDate() : null,
      json: v.json
    };
  });
}

export async function deleteReport(id) {
  await deleteDoc(doc(db, COL, id));
}
