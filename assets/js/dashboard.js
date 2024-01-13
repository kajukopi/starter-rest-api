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

(async () => {
  const url = location.origin === "http://localhost:5000" ? "http://localhost" : "https://tpm.teamkece.com";
  const response = await fetch(url + "/dashboard", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const result = await response.json();
  result.getState.forEach((item) => {
    const element = document.querySelector(`[data-dashboard-name="${item.name}"]`);
    if (element) element.textContent = item.size;
  });
})();

const columns = [
  { label: "#", field: "id" },
  { label: "NIK", field: "nik" },
  { label: "Update", field: "update" },
];

const option = { loading: false, pagination: false, sm: true };
const asyncTable = new mdb.Datatable(document.getElementById("datatable"), { columns }, option);

const formSearch = document.querySelector("#form-search");
formSearch.onsubmit = async (e) => {
  e.preventDefault();
  asyncTable.update(null, { ...option, loading: true });
  document.querySelector("#input-search").classList.toggle("pe-none");
  const formData = new FormData(formSearch);
  const data = Object.fromEntries(formData);
  console.log(data);
  const url = location.origin === "http://localhost:5000" ? "http://localhost" : "https://tpm.teamkece.com";
  const response = await fetch(url + "/dashboard/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });
  const result = await response.json();
  asyncTable.update(
    {
      rows: result.query.map((item) => {
        return { ...item, update: new Date(item.update).toLocaleDateString("id-ID") };
      }),
    },
    option
  );
  document.querySelector("#input-search").classList.toggle("pe-none");
};

class TPM {
  constructor(path) {
    this.url = location.origin === "http://localhost:5000" ? "http://localhost" : "https://tpm.teamkece.com";
    this.link = new URL(url + "/" + path);
  }
  get(collection) {
    this.link.searchParams.set("collection", collection);
    return this;
  }
  filter(filterFunction) {
    this.link.searchParams.set("filter", filterFunction);
    return this;
  }

  sortBy(field) {
    this.link.searchParams.set("sortBy", field);
    return this;
  }

  take(number) {
    this.link.searchParams.set("take", number);
    return this;
  }

  month(monthValue) {
    this.link.searchParams.set("month", parseFloat(monthValue) - 1);
    return this;
  }

  range(dateStart, dateFinish) {
    this.link.searchParams.set("dateStart", dateStart);
    this.link.searchParams.set("dateFinish", dateFinish);
    return this;
  }

  updateRange(updateStart, updateFinish) {
    this.link.searchParams.set("updateStart", updateStart);
    this.link.searchParams.set("updateFinish", updateFinish);
    return this;
  }

  lastWeek() {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const currentDayOfWeek = currentDate.getDay();
    const daysToAddToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const daysToAddToFriday = 5 - currentDayOfWeek;
    const mondayDate = new Date(currentDate);
    mondayDate.setDate(currentDate.getDate() + daysToAddToMonday);
    const fridayDate = new Date(currentDate);
    fridayDate.setDate(currentDate.getDate() + daysToAddToFriday);
    const lastMondayDate = new Date(mondayDate.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString();
    const lastFridayDate = new Date(fridayDate.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString();
    console.log(lastFridayDate.split("T")[0]);
    console.log(lastMondayDate.split("T")[0]);
    this.link.searchParams.set("updateStart", lastMondayDate.split("T")[0]);
    this.link.searchParams.set("updateFinish", lastFridayDate.split("T")[0]);
    return this;
  }

  thisWeek() {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const currentDayOfWeek = currentDate.getDay();
    const daysToAddToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const daysToAddToFriday = 5 - currentDayOfWeek;
    const mondayDate = new Date(currentDate);
    mondayDate.setDate(currentDate.getDate() + daysToAddToMonday);
    const fridayDate = new Date(currentDate);
    fridayDate.setDate(currentDate.getDate() + daysToAddToFriday);
    const thisMondayDate = new Date(mondayDate.getTime()).toISOString();
    const thisFridayDate = new Date(fridayDate.getTime()).toISOString();
    this.link.searchParams.set("updateStart", thisMondayDate.split("T")[0]);
    this.link.searchParams.set("updateFinish", thisFridayDate.split("T")[0]);
    return this;
  }

  value() {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(this.link.href, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const result = await response.json();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }
}
const query = new TPM("dashboard/query");

const a = getDatesForWeekExcludingWeekends(true).at(0);
const b = getDatesForWeekExcludingWeekends(true).at(-1);

const c = getDatesForWeekExcludingWeekends(false).at(0);
const d = getDatesForWeekExcludingWeekends(false).at(-1);

const mondayThisWeek = new Date(new Date(a).getTime());
const fridayThisWeek = new Date(new Date(b).getTime() + 24 * 60 * 60 * 1000 - 1);

const mondaylastWeek = new Date(new Date(c).getTime());
const fridayLastWeek = new Date(new Date(d).getTime() + 24 * 60 * 60 * 1000 - 1);

query
  .get("services")
  .sortBy("id")
  .range(mondayThisWeek, fridayThisWeek)
  .value()
  .then((payload) => {
    const data = [0, 0, 0, 0, 0];
    payload.data.map((item) => {
      data[getDatesForWeekExcludingWeekends(true).indexOf(new Date(item.date).toISOString().split("T")[0])]++;
    });
    // Data
    const dataChartFunnelExample = {
      type: "bar",
      data: {
        labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        datasets: [
          {
            data: data,
            barPercentage: 1.24,
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
            ],
            borderColor: [
              "rgba(255,99,132,1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
    };

    // Options
    const optionsChartFunnelExample = {
      dataLabelsPlugin: true,
      options: {
        indexAxis: "y",
        scales: {
          x: {
            grid: {
              offsetGridLines: true,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          datalabels: {
            formatter: (value, ctx) => {
              let sum = 0;
              let dataArr = dataChartFunnelExample.data.datasets[0].data;
              dataArr.map((data) => {
                sum += data;
              });
              let percentage = ((value * 100) / sum).toFixed(2) + "%";
              return percentage;
            },
            color: "#4f4f4f",
            labels: {
              title: {
                font: {
                  size: "13",
                },
                anchor: "end",
                align: "right",
              },
            },
          },
        },
      },
    };

    new mdb.Chart(document.getElementById("services-chart"), dataChartFunnelExample, optionsChartFunnelExample);
  });

query
  .get("services")
  .sortBy("id")
  .range(mondaylastWeek, fridayLastWeek)
  .value()
  .then((payload) => {
    const data = [0, 0, 0, 0, 0];
    payload.data.map((item) => {
      data[getDatesForWeekExcludingWeekends(false).indexOf(new Date(item.date).toISOString().split("T")[0])]++;
    });
    // Data
    const dataChartDataLabelsExample = {
      type: "pie",
      data: {
        labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        datasets: [
          {
            label: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            data: data,
            backgroundColor: [
              "rgba(63, 81, 181, 0.5)",
              "rgba(77, 182, 172, 0.5)",
              "rgba(66, 133, 244, 0.5)",
              "rgba(156, 39, 176, 0.5)",
              "rgba(233, 30, 99, 0.5)",
            ],
          },
        ],
      },
    };

    // Options
    const optionsChartDataLabelsExample = {
      dataLabelsPlugin: true,
      options: {
        plugins: {
          datalabels: {
            formatter: (value, ctx) => {
              let sum = 0;
              // Assign the data to the variable and format it according to your needs
              let dataArr = dataChartDataLabelsExample.data.datasets[0].data;
              dataArr.map((data) => {
                sum += data;
              });
              let percentage = ((value * 100) / sum).toFixed(2) + "%";
              return percentage;
            },
            color: "white",
            labels: {
              title: {
                font: {
                  size: "14",
                },
              },
            },
          },
        },
      },
    };

    new mdb.Chart(document.getElementById("chart-data-mdb-labels-example"), dataChartDataLabelsExample, optionsChartDataLabelsExample);
  });

function getDatesForWeekExcludingWeekends(boolean) {
  const currentDate = new Date();
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Start from Monday
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 4); // End on Friday
  const validDates = [];
  for (let date = new Date(startOfWeek); date <= endOfWeek; date.setDate(date.getDate() + 1)) {
    const dayIndex = date.getDay();
    if (dayIndex !== 0 && dayIndex !== 6) {
      validDates.push(new Date(boolean === false ? new Date(date).getTime() - 7 * 24 * 60 * 60 * 1000 : date).toISOString().split("T")[0]);
    }
  }
  return validDates;
}

const formQueryEverythings = document.querySelector("#form-query-everythings");
formQueryEverythings.onsubmit = (e) => {
  e.preventDefault();
  const url = location.origin === "http://localhost:5000" ? "http://localhost" : "https://tpm.teamkece.com";
  const link = new URL(url + "/dashboard/query");
  if (document.querySelector("#input-checkbox-collection").checked)
    link.searchParams.set("collection", document.querySelector("#input-textbox-collection").value);
  if (document.querySelector("#input-checkbox-filter").checked)
    link.searchParams.set("filter", document.querySelector("#input-textbox-filter").value);
  if (document.querySelector("#input-checkbox-sortBy").checked)
    link.searchParams.set("sortBy", document.querySelector("#input-textbox-sortBy").value);
  if (document.querySelector("#input-checkbox-take").checked)
    link.searchParams.set("take", document.querySelector("#input-textbox-take").value);
  if (document.querySelector("#input-checkbox-month").checked)
    link.searchParams.set("month", parseFloat(document.querySelector("#input-textbox-month").value.split("-")[1]) - 1);
  if (document.querySelector("#dateStart").value) link.searchParams.set("dateStart", document.querySelector("#dateStart").value);
  if (document.querySelector("#dateFinish").value) link.searchParams.set("dateFinish", document.querySelector("#dateFinish").value);
  if (document.querySelector("#updateStart").value) link.searchParams.set("updateStart", document.querySelector("#updateStart").value);
  if (document.querySelector("#updateFinish").value) link.searchParams.set("updateFinish", document.querySelector("#updateFinish").value);
  (async () => {
    const response = await fetch(link.href, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const result = await response.json();
    console.log(result.data.length);
  })();
};

const detailModal = new mdb.Modal(document.getElementById("detailModal"), { keyboard: false, backdrop: "static", focus: true });

const cardZoom = document.querySelectorAll(".card-zoom");
cardZoom.forEach((card) => {
  card.addEventListener("click", (e) => {
    e.preventDefault();
    const col = e.target.parentNode.parentNode;
    if (col.querySelector("[data-dashboard-name]").dataset.dashboardName === "users") return false;
    detailModal.show();
    document.querySelector("#detailModalLabel").textContent = col
      .querySelector("[data-dashboard-name]")
      .dataset.dashboardName.toUpperCase();
    getColPage({ col: col.querySelector("[data-dashboard-name]").dataset.dashboardName });
  });
});

const buttonPrev = document.querySelector("[data-pagination-prev]");
const buttonPage = document.querySelector("[data-pagination-page]");
const buttonNext = document.querySelector("[data-pagination-next]");

buttonNext.addEventListener("click", (e) => {
  e.preventDefault();
  const number = parseFloat(buttonPage.dataset.paginationPage) + 1;
  getColPage({
    col: document.querySelector("#detailModalLabel").textContent.toLowerCase(),
    number,
  });
});

buttonPrev.addEventListener("click", (e) => {
  e.preventDefault();
  const number = parseFloat(buttonPage.dataset.paginationPage) - 1;
  getColPage({
    col: document.querySelector("#detailModalLabel").textContent.toLowerCase(),
    number,
  });
});

async function getColPage({ col, size, number }) {
  const url = location.origin === "http://localhost:5000" ? "http://localhost" : "https://tpm.teamkece.com";
  const link = new URL(url + "/api/" + col);
  if (size) link.searchParams.set("pageSize", size);
  if (number) link.searchParams.set("pageNumber", number);
  const response = await fetch(link.href, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const result = await response.json();
  const tableDetail = document.querySelector("#table-detail");
  tableDetail.innerHTML = ``;
  let header = ``;

  for (let i = 0; i < 4; i++) {
    header += `<th scope="col">${Object.keys(result.result[0])[i].toUpperCase()}</th>`;
  }

  let body = ``;

  result.result.forEach((item) => {
    let bodyDetail = ``;
    for (let i = 0; i < 4; i++) {
      bodyDetail += `
      <th scope="row">${Object.values(item)[i]}</th>
      `;
    }
    body += `
    <tr>
      ${bodyDetail}
    </tr>
    `;
  });

  tableDetail.innerHTML = `
  <thead>
    <tr>
      ${header}
    </tr>
  </thead>
  <tbody>
    ${body}
  </tbody>`;
  buttonPage.textContent = number || 1;
  buttonPage.dataset.paginationPage = number || 1;
}
