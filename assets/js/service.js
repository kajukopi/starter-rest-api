const sidenav = document.getElementById("sidenav");
const sidenavInstance = mdb.Sidenav.getInstance(sidenav);

let innerWidth = null;

const setMode = (e) => {
  // Check necessary for Android devices
  if (window.innerWidth === innerWidth) {
    return;
  }

  innerWidth = window.innerWidth;

  if (window.innerWidth < 660) {
    sidenavInstance.changeMode("over");
    sidenavInstance.hide();
  } else {
    sidenavInstance.changeMode("side");
    sidenavInstance.show();
  }
};

setMode();

// Event listeners
window.addEventListener("resize", setMode);

if (Storage.get("list-service-asset")) {
  loadListElement();
}
function loadListElement() {
  let listEl = ``;
  Storage.get("list-service-asset").forEach((item, i) => {
    listEl += `<li class="list-group-item d-flex justify-content-start align-items-center py-2 bg-transparent">
    ${item}
    <button class="btn-close ms-auto" data-delete-list-asset="${i}"></button>
    </li>`;
  });
  document.querySelector("#list-service-asset").innerHTML = listEl;
  loadButtonDeleteListAsset();
}

function loadButtonDeleteListAsset() {
  const buttonDelete = document.querySelectorAll("[data-delete-list-asset]");
  buttonDelete.forEach((button) => {
    button.addEventListener("click", (e) => {
      const list = Storage.get("list-service-asset");
      list.splice(e.target.dataset.deleteListAsset);
      Storage.set("list-service-asset", list);
      loadListElement();
    });
  });
}

const buttonGetSignOut = document.querySelector("#button-signout");
buttonGetSignOut.addEventListener("click", async (e) => {
  const response = await Siduru.logout();
  if (!response.ok) {
    console.log(response.statusText)
    if (breakdown.pathname !== "/") {
      breakdown.href = "/";
    }
  }
  if (response.ok) {
    if (breakdown.pathname !== "/") {
      breakdown.href = "/";
    }
  }
  const result = await response.json();
  console.log(result);
});

const html5QrCode = new Html5Qrcode("reader", { formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE] });
const qrCodeSuccessCallback = (t, r) => {
  Storage.set("list-service-asset", [parseFloat(t.split(",").at(-1))]);
  document.querySelector("#list-service-asset").innerHTML = ``;
  loadListElement();
};
const config = { fps: 10, qrbox: { width: 100, height: 100 } };

const buttonStartScan = document.querySelector("#start-scan");
const buttonStopScan = document.querySelector("#stop-scan");

buttonStartScan.onclick = (e) => {
  html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback);
  buttonStopScan.toggleAttribute("disabled");
};

buttonStopScan.onclick = (e) => {
  html5QrCode.stop();
  buttonStopScan.toggleAttribute("disabled");
};

const buttonServiceSubmit = document.querySelector("#button-service-submit");
buttonServiceSubmit.addEventListener("click", async () => {
  if (Storage.get("list-service-asset").length === 0) return false;
  if (document.querySelector("#breakdown-service-asset").value === "") return false;
  if (document.querySelector("#description-breakdown-service-asset").value === "") return false;
  const formData = new FormData();
  formData.append("ticket", "SC-" + Math.floor(Math.random() * 1e9));
  formData.append("list", Storage.get("list-service-asset"));
  formData.append("breakdown", document.querySelector("#breakdown-service-asset").value);
  formData.append("description", document.querySelector("#description-breakdown-service-asset").value);
  const response = await Siduru.post("services", Object.fromEntries(formData));
  if (!response.ok) return console.log(response.statusText);
  console.log(response.statusText);
  const result = await response.json();
  console.log(result);
  Storage.remove("list-service-asset");
  document.querySelector("#list-service-asset").innerHTML = ``;
  document.querySelector("#breakdown-service-asset").value = ``;
  document.querySelector("#description-breakdown-service-asset").value = ``;
});
