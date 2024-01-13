const formLogin = document.querySelector("#form-login");
formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(formLogin);
  const data = Object.fromEntries(formData);
  const response = await Siduru.login(data);
  if (!response.ok) {
    console.log(response.statusText);
    if (location.pathname !== "/") {
      location.href = "/";
    }
  }
  if (response.ok) {
    if (location.pathname === "/") return (location.href = "/dashboard");
    const result = await response.json();
    console.log(result);
    Object.entries(result).map(([key, val]) => {
      if (document.querySelector(`#${key}`)) document.querySelector(`#${key}`).textContent = val;
    });
  }
});

const formRegister = document.querySelector("#form-register");
formRegister.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(formRegister);
  const data = Object.fromEntries(formData);
  const response = await Siduru.register(data);
  const result = await response.json();
  if (response.status === 405) return console.log(result.error);
  formRegister.reset();
  if (response.status === 200) return console.log("Successfully registered.");
  // location.reload()
});
