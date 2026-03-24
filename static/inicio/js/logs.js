const form = document.querySelector(".form");
const usernameInput = document.querySelector('input[name="username"]');
const passwordInput = document.querySelector('input[type="password"]');
const errorMsg = document.getElementById("errorMsg");
const passwordField = passwordInput.closest(".field");
const signupBtn = document.getElementById("signupBtn");
const overlay = document.getElementById("page-transition");

// Validação da senha
function validarSenha(senha) {
  const minLength = senha.length >= 6;
  const hasUppercase = /[A-Z]/.test(senha);
  const hasSpecial = /[^A-Za-z0-9]/.test(senha);

  return minLength && hasUppercase && hasSpecial;
}

// Validação em tempo real
passwordInput.addEventListener("input", () => {
  const senha = passwordInput.value;

  if (!senha) {
    passwordField.classList.remove("error", "success");
    errorMsg.classList.remove("show");
    return;
  }

  if (validarSenha(senha)) {
    passwordField.classList.add("success");
    passwordField.classList.remove("error");
    errorMsg.classList.remove("show");
  } else {
    passwordField.classList.add("error");
    passwordField.classList.remove("success");
    errorMsg.classList.add("show");
  }
});

// CSRF helper
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.slice(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Sign Up / Login funcional
signupBtn.addEventListener("click", async () => {
  const username = usernameInput.value.trim();
  const senha = passwordInput.value;

  if (!username || !validarSenha(senha)) {
    errorMsg.classList.add("show");
    passwordField.classList.add("error");
    form.style.transform = "scale(0.97)";
    setTimeout(() => form.style.transform = "scale(1)", 150);
    return;
  }

  overlay.classList.add("active");

  try {
    const res = await fetch("/inicio/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken")
      },
      credentials: "same-origin",
      body: JSON.stringify({ username, password: senha })
    });

    const data = await res.json();

    if (!res.ok) {
      errorMsg.textContent = data.erro || "Erro no login";
      errorMsg.classList.add("show");
      passwordField.classList.add("error");
      overlay.classList.remove("active");
      return;
    }

    // Login ok → redireciona pro home
    setTimeout(() => {
      window.location.href = "/inicio/home/";
    }, 600);

  } catch (err) {
    console.error("Erro:", err);
    errorMsg.textContent = "Erro de conexão";
    errorMsg.classList.add("show");
    overlay.classList.remove("active");
  }
});
