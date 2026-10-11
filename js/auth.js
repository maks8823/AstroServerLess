import { auth } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const email = document.getElementById("email");
const pass  = document.getElementById("password");
const msg   = document.getElementById("auth-msg");

document.getElementById("btn-login").onclick = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, pass.value);
    msg.textContent = "Успешно!";
    window.location.href = "index.html";
  } catch (e) {
    msg.textContent = e.message;
  }
};

document.getElementById("btn-register").onclick = async () => {
  try {
    await createUserWithEmailAndPassword(auth, email.value, pass.value);
    msg.textContent = "Зарегистрированы!";
    window.location.href = "index.html";
  } catch (e) {
    msg.textContent = e.message;
  }
};