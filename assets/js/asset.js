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

const buttonGetSignOut = document.querySelector("#button-signout");

buttonGetSignOut.addEventListener("click", async (e) => {
  const response = await Siduru.logout();
  if (!response.ok) {
    console.log(response.statusText);
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

const locations = [
  "GEDUNG A",
  "GEDUNG B",
  "GEDUNG C",
  "GEDUNG D",
  "STOKFITING SABLON",
  "GEDUNG E",
  "OFFLINE A",
  "TECHNICAL",
  "LAB",
  "OFFLINE B",
  "ENGINEERING",
  "CHEMICAL RS",
  "STOCKFITTING B",
  "STOCKFITTING A",
  "TOOLING",
  "LAMINATING",
  "WAREHOUSE",
  "GUDANG TEKNISI",
  "GUDANG MEKANIK",
];

const qrCodeSuccessCallback = async (t, r) => {
  console.log(parseFloat(t.split(",").at(-1)));
  buttonStopScan.click();
  document.querySelector('#form-assets [type="submit"]').toggleAttribute("disabled");
  Siduru.getById("assets", parseFloat(t.split(",").at(-1)))
    .then((result) => {
      document.querySelector(`#data-assets`).innerHTML = ``;
      result.json().then((payload) => {
        for (const [key, val] of Object.entries(payload.result)) {
          if (key === "nama" || key === "location" || key === "detail" || key === "id") {
            document.querySelector(`#data-assets`).insertAdjacentHTML(
              "beforeend",
              `
            <li>
              <div id="form-outline-${key}" class="form-outline mb-3">
                <input type="text" id="input-${key}" name="${key}" class="form-control" value="${val}" ${key === "id" ? "disabled" : ""}/>
                <label class="form-label" for="input-${key}">${key.toUpperCase()}</label>
              </div>
            </li>
            `
            );
          }
        }
        document.querySelectorAll(".form-outline").forEach((formOutline) => {
          new mdb.Input(formOutline).update();
        });
        const dataFilter = (value) => {
          return locations.filter((item) => {
            return item.toLowerCase().startsWith(value.toLowerCase());
          });
        };
        const basicAutocomplete = document.querySelector("#form-outline-location");
        new mdb.Autocomplete(basicAutocomplete, {
          filter: dataFilter,
        });
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

const config = { fps: 10, qrbox: { width: 100, height: 100 } };

const buttonStartScan = document.querySelector("#start-scan");

const buttonStopScan = document.querySelector("#stop-scan");

buttonStartScan.onclick = (e) => {
  html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback);
  buttonStopScan.toggleAttribute("disabled");
  buttonStartScan.toggleAttribute("disabled");
};

buttonStopScan.onclick = (e) => {
  html5QrCode.stop();
  buttonStopScan.toggleAttribute("disabled");
  buttonStartScan.toggleAttribute("disabled");
};

const formAssets = document.querySelector("#form-assets");
formAssets.onsubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(formAssets);
  const data = Object.fromEntries(formData);
  console.log(data);
  Siduru.update("assets", data, document.querySelector("#input-id").value)
    .then((response) => {
      response
        .json()
        .then((data) => {
          document.querySelector('#form-assets [type="submit"]').toggleAttribute("disabled");
          document.querySelector("ol").innerHTML = ``;
          console.log(data);
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .catch((error) => {
      console.log(error);
    });
};
