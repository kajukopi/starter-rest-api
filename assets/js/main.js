this.alertModal = document.getElementById("alertModal");
this.modal = new mdb.Modal(alertModal, { backdrop: "static", keyboard: false, focus: true });
alertModal.addEventListener("shown.mdb.modal", (e) => {
  let i = 0;
  const timer = setInterval(() => {
    i++;
    e.target.querySelector("#modal-content").textContent = `Connecting...${i}`;
  }, 1000);
  setTimeout(() => {
    clearInterval(timer);
    modal.hide();
  }, 10000);
});
const url = location.origin === "http://localhost:5000" ? "http://localhost" : "https://tpm.teamkece.com";
// const url = "https://tpm.teamkece.com"
this.Siduru = {
  login: async (payload) => {
    modal.show();
    try {
      const response = await fetch(url + "/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      modal.hide();
      return response;
    } catch (error) {
      modal.hide();
      return error;
    }
  },
  register: async (payload) => {
    modal.show();
    try {
      const response = await fetch(url + "/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      modal.hide();
      return response;
    } catch (error) {
      modal.hide();
      return error;
    }
  },
  logout: async () => {
    modal.show();
    try {
      console.log(document.cookie);
      const response = await fetch(url + "/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      modal.hide();
      return response;
    } catch (error) {
      modal.hide();
      return error;
    }
  },
  post: async (collection, payload) => {
    modal.show();
    try {
      const response = await fetch(url + `/api/${collection}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      modal.hide();
      return response;
    } catch (error) {
      modal.hide();
      return error;
    }
  },
  update: async (collection, payload, id) => {
    modal.show();
    try {
      const response = await fetch(url + `/api/${collection}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      modal.hide();
      return response;
    } catch (error) {
      modal.hide();
      return error;
    }
  },
  delete: async (collection, id) => {
    modal.show();
    try {
      const response = await fetch(url + `/api/${collection}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      modal.hide();
      return response;
    } catch (error) {
      modal.hide();
      return error;
    }
  },
  getById: async (collection, id) => {
    modal.show();
    try {
      const response = await fetch(url + `/api/${collection}/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      modal.hide();
      return response;
    } catch (error) {
      modal.hide();
      return error;
    }
  },
  get: async (collection) => {
    modal.show();
    try {
      const response = await fetch(url + `/api/${collection}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      modal.hide();
      return response;
    } catch (error) {
      modal.hide();
      return error;
    }
  },
};

(async () => {
  const response = await fetch(url + "/status", { method: "GET", credentials: "include" });
  if (!response.ok) {
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
})();

(async () => {
  const arrInboxId = document.querySelectorAll("[data-inbox-id]");
  const response = await fetch(url + "/status/inbox", { method: "GET", credentials: "include" });
  if (!response.ok) {
    if (location.pathname !== "/") {
      location.href = "/";
    }
  }
  if (response.ok) {
    if (location.pathname === "/") return (location.href = "/dashboard");
    const result = await response.json();
    loadNotification(result);
    if (arrInboxId)
      arrInboxId.forEach((e) => {
        e.addEventListener("click", async (e) => {
          const response = await fetch(url + `/status/inbox/${e.target.dataset.inboxId}`, {
            method: "GET",
            credentials: "include",
          });
          if (!response.ok) {
            if (location.pathname !== "/") {
              location.href = "/";
            }
          }
          if (response.ok) {
            if (location.pathname === "/") return (location.href = "/dashboard");
            const result = await response.json();
            loadNotification(result);
          }
        });
      });
  }
  function loadNotification(result) {
    const inboxContent = document.querySelector("#inbox-content");
    const inboxCount = document.querySelector("#inbox-count");
    const arrInboxId = document.querySelectorAll("[data-inbox-id]");
    let inboxEl = ``;
    let inboxElCount = 0;
    if (result.inbox) {
      Object.entries(result.inbox).map(([key, item]) => {
        if (new Date(item.date).toLocaleDateString() === new Date().toLocaleDateString()) {
          inboxEl += `
          <li>
            <a class="dropdown-item" href="#" data-inbox-id="${key}">
              <span class="pe-none fw-bold">${item.title}</span>
              <span class="pe-none text-muted fw-light">${item.body}</span>
              <div class="pe-none text-muted fw-light small">${new Date(item.date).toLocaleDateString("id-ID")}</div>
            </a>
          </li>`;
          inboxElCount++;
        }
      });
      if (inboxContent) inboxContent.innerHTML = inboxEl;
      if (inboxCount) inboxCount.textContent = result.inbox.length > 0 ? inboxElCount : "";
      ["badge", "rounded-pill", "badge-notification", "bg-danger"].forEach((item) => {
        if (inboxCount) if (!inboxCount.classList.contains(item)) inboxCount.classList.add(item);
      });
      if (arrInboxId)
        arrInboxId.forEach((e) => {
          e.addEventListener("click", async (e) => {
            const response = await fetch(url + `/status/inbox/${e.target.dataset.inboxId}`, {
              method: "GET",
              credentials: "include",
            });
            if (!response.ok) {
            }
            if (response.ok) {
            }
          });
        });
    }
  }
})();
