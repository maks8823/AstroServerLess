import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection, addDoc, getDocs, doc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const ADMIN_EMAIL = "maks88232002@gmail.com";

onAuthStateChanged(auth, user => {
  if (!user || user.email !== ADMIN_EMAIL) {
    alert("Доступ ограничен. Только для администраторов.");
    window.location.href = "index.html";
  } else {
    loadBookings();
  }
});

// Добавление экскурсии
document.getElementById("btn-add-ex").onclick = async () => {
  const name = document.getElementById("ex-name").value;
  const desc = document.getElementById("ex-desc").value;
  const date = document.getElementById("ex-date").value;
  const price = +document.getElementById("ex-price").value;
  const limit = +document.getElementById("ex-limit").value;

  if (!name || !limit) {
    alert("Заполните название и лимит мест");
    return;
  }

  await addDoc(collection(db, "excursions"), {
    name,
    description: desc,
    date,
    price,
    limit
  });

  alert("Экскурсия создана!");
  location.reload();
};

// Добавление новости
document.getElementById("btn-add-news").onclick = async () => {
  const title = document.getElementById("news-title").value;
  const text = document.getElementById("news-text").value;

  if (!title || !text) {
    alert("Заполните заголовок и текст новости");
    return;
  }

  await addDoc(collection(db, "news"), {
    title,
    text,
    date: new Date().toLocaleDateString("ru-RU")
  });

  alert("Новость опубликована!");
  location.reload();
};

// Загрузка заявок
async function loadBookings() {
  const tbody = document.getElementById("bookings-body");
  tbody.innerHTML = "<tr><td colspan='4'>Загрузка...</td></tr>";

  const snap = await getDocs(collection(db, "bookings"));
  tbody.innerHTML = "";

  if (snap.empty) {
    tbody.innerHTML = "<tr><td colspan='4'>Заявок пока нет.</td></tr>";
    return;
  }

  const exSnap = await getDocs(collection(db, "excursions"));
  const exMap = {};
  exSnap.forEach(d => { exMap[d.id] = d.data().name; });

  snap.forEach(d => {
    const b = d.data();
    const exName = exMap[b.excursionId] || "Удалённая экскурсия";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${exName}</td>
      <td>${b.userName}</td>
      <td><b>${b.status}</b></td>
      <td>
        <button class="btn-sm btn-confirm" onclick="updateStatus('${d.id}', 'Подтверждено')">Принять</button>
        <button class="btn-sm btn-cancel" onclick="updateStatus('${d.id}', 'Отклонено')">Отклонить</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.updateStatus = async (id, newStatus) => {
  await updateDoc(doc(db, "bookings", id), { status: newStatus });
  loadBookings();
};