(async () => {
  const url = new URL(location.href);
  const params = new URLSearchParams(url.search);
  const collection = params.get("col");
  const id = params.get("id");

  if (collection && id) {
    document.querySelector(".card-title").textContent = "Detail " + collection.toUpperCase();
    const response = await Siduru.getById(collection, id);
    const result = await response.json();
    document.querySelector("#table-detail").innerHTML = "";
    for (let [key, val] of Object.entries(result.result)) {
      switch (key) {
        case "id":
          break;
        case "date":
          break;
        case "nik":
          break;
        case "email":
          break;
        case "name":
          break;
        case "_nik":
          document.querySelector("#table-detail").insertAdjacentHTML(
            "afterbegin",
            `
            <tr>
                <th>${key.toUpperCase().replace(/_/g, " ")}</th>
                <td>${val.toString().toUpperCase()}</td>
            </tr>`
          );
          break;
        case "_email":
          document.querySelector("#table-detail").insertAdjacentHTML(
            "afterbegin",
            `
            <tr>
                <th>${key.toUpperCase().replace(/_/g, " ")}</th>
                <td>${val.toString().toUpperCase()}</td>
            </tr>`
          );
          break;
        case "_name":
          document.querySelector("#table-detail").insertAdjacentHTML(
            "afterbegin",
            `
            <tr>
                <th>${key.toUpperCase().replace(/_/g, " ")}</th>
                <td>${val.toString().toUpperCase()}</td>
            </tr>`
          );
          break;
        case "to_location":
          document.querySelector("#table-detail").insertAdjacentHTML(
            "afterbegin",
            `
            <tr>
                <th>${key.toUpperCase().replace(/_/g, " ")}</th>
                <td>${val.toString().toUpperCase()}</td>
            </tr>`
          );
          break;
        case "from_location":
          document.querySelector("#table-detail").insertAdjacentHTML(
            "afterbegin",
            `
            <tr>
                <th>${key.toUpperCase().replace(/_/g, " ")}</th>
                <td>${val.toString().toUpperCase()}</td>
            </tr>`
          );
          break;
        case "assets":
          break;
        case "list":
          val = generateListLink(val);
          document.querySelector("#table-detail").insertAdjacentHTML(
            "afterbegin",
            `
            <tr>
                <th>${key.toUpperCase()}</th>
                <td>${val.toString().toUpperCase()}</td>
            </tr>`
          );
          break;
        case "update":
          document.querySelector("#table-detail").insertAdjacentHTML(
            "afterbegin",
            `
            <tr>
                <th>${key.toUpperCase().replace(/_/g, " ")}</th>
                <td>${new Date(val).toLocaleString("id-ID")}</td>
            </tr>`
          );
          break;
        case "_date":
          document.querySelector("#table-detail").insertAdjacentHTML(
            "afterbegin",
            `
            <tr>
                <th>${key.toUpperCase().replace(/_/g, " ")}</th>
                <td>${new Date(val).toLocaleString("id-ID")}</td>
            </tr>`
          );
          break;

        default:
          document.querySelector("#table-detail").insertAdjacentHTML(
            "afterbegin",
            `
            <tr>
                <th>${key.toUpperCase()}</th>
                <td>${val.toString().toUpperCase()}</td>
            </tr>`
          );
          break;
      }
    }
    document.querySelectorAll("[data-id]").forEach((a) => {
      a.addEventListener("click", async (e) => {
        e.preventDefault();
        const response = await Siduru.getById("assets", e.target.dataset.id);
        if (!response.ok) return console.log(response.statusText);
        const result = await response.json();
        let detailList = ``;
        for (const [key, val] of Object.entries(result.result)) {
          if (key === "id" || key === "nama" || key === "location" || key === "detail")
            detailList += `${key.toUpperCase()}: ${val.toString().toUpperCase()}<br>`;
        }
        console.log(detailList);
      });
    });
  }
  function generateListLink(payload) {
    const array = payload.split(",");
    let value = ``;
    array.forEach((item) => {
      value += `<a href="#" data-id="${item}">${item}</a>\n`;
    });
    return value;
  }
})();
