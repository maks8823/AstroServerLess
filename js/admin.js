import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection, addDoc, getDocs, doc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const ADMIN_EMAIL = "maks88232002@gmail.com";

// Проверка прав ДО активации элементов
onAuthStateChanged(auth, user => {
  const loadingBlock = document.getElementById("auth-loading");
  const adminContent = document.getElementById("admin-content");

  if (!user || user.email !== ADMIN_EMAIL) {
    alert("Доступ запрещён! Страница только для администратора.");
    window.location.href = "index.html";
    return;
  }

  // Если это подтверждённый админ — открываем интерфейс и активируем кнопки
  loadingBlock.style.display = "none";
  adminContent.style.display = "block";

  // Настройка кнопки выходу в навигации
  const navAuth = document.getElementById("nav-auth");
  if (navAuth) {
    navAuth.textContent = `Выйти (${user.email})`;
    navAuth.href = "#";
    navAuth.onclick = () => signOut(auth).then(() => location.href = "index.html");
  }

  // Запускаем работу админки
  initAdminActions();
});

function initAdminPanelActions() {
  loadBookings();

  // Добавление новости
  document.getElementById("btn-add-news").onclick = async () => {
    const title = document.getElementById("news-title").value;
    const text = document.getElementById("news-text").value;
    const fileInput = document.getElementById("news-img");

    if (!title || !text) {
      alert("Заполните заголовок и текст новости");
      return;
    }

    const btn = document.getElementById("btn-add-news");
    btn.disabled = true;
    btn.textContent = "Публикация...";

    let imageUrl = "";

    try {
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        if (file.size > 1200 * 1024) {
          alert("Файл слишком большой! Выберите фото до 1 МБ.");
          btn.disabled = false;
          btn.textContent = "Опубликовать";
          return;
        }
        imageUrl = await fileToBase64(file);
      }

      await addDoc(collection(db, "news"), {
        title,
        text,
        imageUrl,
        date: new Date().toLocaleDateString("ru-RU")
      });

      alert("Новость опубликована!");
      location.reload();
    } catch (err) {
      alert("Ошибка публикации: " + err.message);
      btn.disabled = false;
      btn.textContent = "Опубликовать";
    }
  };

  // Создание экскурсии
  document.getElementById("btn-add-ex").onclick = async () => {
    const name = document.getElementById("ex-name").value;
    const desc = document.getElementById("ex-desc").value;
    const date = document.getElementById("ex-date").value;
    const price = +document.getElementById("ex-price").value;
    const limit = +document.getElementById("ex-limit").value;

    if (!name || !limit) {
      alert("Укажите название и лимит мест");
      return;
    }

    await addDoc(collection(db, "excursions"), { name, description: desc, date, price, limit });
    alert("Экскурсия создана!");
    location.reload();
  };
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

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
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${exMap[b.excursionId] || "—"}</td>
      <td>${b.userName}</td>
      <td><b>${b.status}</b></td>
      <td>
        <button class="btn-sm btn-confirm" data-id="${d.id}" data-st="Подтверждено">Принять</button>
        <button class="btn-sm btn-cancel" data-id="${d.id}" data-st="Отклонено">Отклонить</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

document.getElementById("bookings-body").addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-id]");
  if (!btn) return;
  await updateDoc(doc(db, "bookings", btn.dataset.id), { status: btn.dataset.st });
  loadBookings();
});

function initAdminActions() {
  initAdminPanelActions();
}