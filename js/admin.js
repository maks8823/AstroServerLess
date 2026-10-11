import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection, getDocs, addDoc, query, where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const ADMIN_EMAIL = "maks88232002@gmail.com";
let currentUser = null;

onAuthStateChanged(auth, u => {
  currentUser = u;
  const navAuth = document.getElementById("nav-auth");
  const navAdmin = document.getElementById("nav-admin");

  if (u) {
    navAuth.textContent = `Выйти (${u.email})`;
    navAuth.href = "#";
    navAuth.onclick = () => signOut(auth).then(() => location.reload());
    if (u.email === ADMIN_EMAIL && navAdmin) {
      navAdmin.style.display = "inline";
    }
  }
});

async function loadExcursions() {
  const list = document.getElementById("exc-list");
  try {
    const snap = await getDocs(collection(db, "excursions"));
    list.innerHTML = "";

    if (snap.empty) {
      list.innerHTML = "<p>На данный момент нет активных экскурсий.</p>";
      return;
    }

    for (const docSnap of snap.docs) {
      const ex = docSnap.data();
      
      const q = query(collection(db, "bookings"), where("excursionId", "==", docSnap.id));
      const bookedSnap = await getDocs(q);
      const bookedCount = bookedSnap.size;
      const spotsLeft = ex.limit - bookedCount;

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${ex.name}</h3>
        <p style="margin: 8px 0;">${ex.description}</p>
        <p><strong>Дата:</strong> ${ex.date} | <strong>Стоимость:</strong> ${ex.price} руб.</p>
        <p><strong>Свободных мест:</strong> ${spotsLeft > 0 ? spotsLeft : 0} из ${ex.limit}</p>
        <button class="book-btn" data-id="${docSnap.id}" ${spotsLeft <= 0 ? "disabled" : ""}>
          ${spotsLeft > 0 ? "Подать заявку" : "Мест нет"}
        </button>
        <p class="status-msg" style="margin-top: 5px; color: #8ec8f8;"></p>
      `;
      list.appendChild(card);
    }
  } catch (error) {
    list.innerHTML = `<p>Ошибка при загрузке: ${error.message}</p>`;
  }
}

document.getElementById("exc-list").addEventListener("click", async (e) => {
  if (!e.target.classList.contains("book-btn")) return;
  
  if (!currentUser) {
    alert("Для записи необходимо войти в систему.");
    window.location.href = "login.html";
    return;
  }

  const btn = e.target;
  const excursionId = btn.dataset.id;
  const statusMsg = btn.nextElementSibling;

  btn.disabled = true;
  statusMsg.textContent = "Обработка запроса...";

  try {
    const dupQuery = query(
      collection(db, "bookings"),
      where("excursionId", "==", excursionId),
      where("userId", "==", currentUser.uid)
    );
    const dupSnap = await getDocs(dupQuery);

    if (!dupSnap.empty) {
      statusMsg.textContent = "Вы уже подавали заявку на эту экскурсию.";
      return;
    }

    await addDoc(collection(db, "bookings"), {
      excursionId: excursionId,
      userId: currentUser.uid,
      userName: currentUser.email,
      status: "В ожидании",
      createdAt: new Date().toISOString()
    });

    btn.textContent = "Заявка отправлена";
    statusMsg.textContent = "Статус: На рассмотрении администратором";
  } catch (err) {
    btn.disabled = false;
    statusMsg.textContent = `Ошибка: ${err.message}`;
  }
});

loadExcursions();