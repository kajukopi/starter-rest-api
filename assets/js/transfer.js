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

// const selectFrom = new mdb.Select(document.querySelector("#from-location-transfer-asset"));
// const selectTo = new mdb.Select(document.querySelector("#to-location-transfer-asset"));

const selectFrom = mdb.Select.getInstance(document.querySelector("#from-location-transfer-asset"));
const selectTo = mdb.Select.getInstance(document.querySelector("#to-location-transfer-asset"));

if (Storage.get("list-transfer-asset")) {
  loadListElement();
}
function loadListElement() {
  let listEl = ``;
  Storage.get("list-transfer-asset").forEach((item, i) => {
    listEl += `<li class="list-group-item d-flex justify-content-start align-items-center py-2 bg-transparent">
    ${item}
    <button class="btn-close ms-auto" data-delete-list-asset="${i}"></button>
    </li>`;
  });
  document.querySelector("#list-transfer-asset").innerHTML = listEl;
  loadButtonDeleteListAsset();
}

function loadButtonDeleteListAsset() {
  const buttonDelete = document.querySelectorAll("[data-delete-list-asset]");
  buttonDelete.forEach((button) => {
    button.addEventListener("click", (e) => {
      const list = Storage.get("list-transfer-asset");
      list.splice(e.target.dataset.deleteListAsset);
      Storage.set("list-transfer-asset", list);
      loadListElement();
    });
  });
}

const buttonGetSignOut = document.querySelector("#button-signout");
buttonGetSignOut.addEventListener("click", async (e) => {
  const response = await Siduru.logout();
  if (!response.ok) {
    console.log(response.statusText);
    if (location.pathname !== "/") {
      location.href = "/";
    }
  }
  if (response.ok) {
    if (location.pathname !== "/") {
      location.href = "/";
    }
  }
  const result = await response.json();
  console.log(result);
});

const html5QrCode = new Html5Qrcode("reader", { formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE] });
let listTransferArray = [];
const qrCodeSuccessCallback = (t, r) => {
  /* handle success */
  listTransferArray.push(parseFloat(t.split(",").at(-1)));
  const uniq = new Set(listTransferArray);
  Storage.set("list-transfer-asset", [...uniq], 1);
  document.querySelector("#list-transfer-asset").innerHTML = ``;
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

const buttonTransferSubmit = document.querySelector("#button-transfer-submit");
buttonTransferSubmit.addEventListener("click", async () => {
  if (Storage.get("list-transfer-asset").length === 0) return false;
  if (document.querySelector("#from-location-transfer-asset").value === "") return false;
  if (document.querySelector("#to-location-transfer-asset").value === "") return false;
  if (document.querySelector("#description-location-transfer-asset").value === "") return false;
  const formData = new FormData();
  formData.append("ticket", "GA-" + Math.floor(Math.random() * 1e9));
  formData.append("list", Storage.get("list-transfer-asset"));
  formData.append("from_location", document.querySelector("#from-location-transfer-asset").value);
  formData.append("to_location", document.querySelector("#to-location-transfer-asset").value);
  formData.append("description", document.querySelector("#description-location-transfer-asset").value);
  Storage.remove("list-transfer-asset");
  document.querySelector("#list-transfer-asset").innerHTML = ``;
  document.querySelector("#from-location-transfer-asset").value = ``;
  document.querySelector("#to-location-transfer-asset").value = ``;
  document.querySelector("#description-location-transfer-asset").value = ``;
  selectFrom.setValue("");
  selectTo.setValue("");
  const response = await Siduru.post("transfers", Object.fromEntries(formData));
  if (!response.ok) return console.log(response.statusText);
  const result = await response.json();
  listTransferArray = [];
});
