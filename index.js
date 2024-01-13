require("fix-esm").register();

require("dot-env");

const express = require("express");

const app = express();

const { engine } = require("express-handlebars");

app.use(express.urlencoded({ extended: true }));

app.engine(".hbs", engine({ extname: ".hbs" }));

app.set("view engine", ".hbs");

app.set("views", "./views");

app.enable("view cache");

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use(express.static("assets"));

const cors = require("cors");

// app.use(express.static);
// app.use(express.json());

app.use(cors());

const tasks = [
  { id: 1, task: "Buy groceries" },
  { id: 2, task: "Go to the gym" },
];

const { GoogleSpreadsheet } = require("google-spreadsheet");

const { JWT } = require("google-auth-library");

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID, serviceAccountAuth);

// app.get("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     await doc.loadInfo();
//     const sheet = doc.sheetsByTitle["query"];
//     await sheet.loadCells("A1:Z10");
//     const a2 = sheet.getCellByA1("A2");
//     const query = `SELECT * WHERE A LIKE '${id}%' ORDER BY A`;
//     const rumus = `=QUERY(assets!A2:I,"${query}")`;
//     a2.formula = rumus;
//     await sheet.saveUpdatedCells();
//     const rows = await sheet.getRows();
//     const data = rows.at(-1)._rawData;
//     const header = rows.at(-1)._worksheet._headerValues;
//     const object = {};
//     for (let i = 0; i < data.length; i++) {
//       object[header[i]] = data[i];
//     }
//     res.json({ status: true, data: object, length: rows.length });
//   } catch (error) {
//     console.log(error);
//     res.json({ status: false, data: error });
//   }
// });

// Routes

app.get("/", async (req, res) => {
  await doc.loadInfo();
  try {
    // read rows
    const sheet = doc.sheetsByTitle["assets"];
    const rows = await sheet.getRows({ limit: 0, offset: 0 });
    const tbody = [];
    const thead = rows[0]._worksheet.headerValues;
    rows.filter((item, index) => {
      const obj = {};
      for (let i = 0; i < thead.length; i++) {
        obj["id"] = index + 1;
        obj[thead[i]] = item._rawData[i];
      }
      tbody.push(obj);
    });
    res.render("index", {
      tasks,
      thead,
      tbody,
    });
  } catch (error) {
    res.render("index", { tasks });
    console.log(error.response.data.error);
  }
});

app.get("/add", (req, res) => {
  res.render("add");
});

app.post("/add", async (req, res) => {
  await doc.loadInfo();
  try {
    const sheet = doc.sheetsByTitle["assets"];
    const reqBody = await sheet.addRow(req.body);
    res.redirect("/");
  } catch (error) {
    res.redirect("/");
  }
});

app.get("/edit/:id", async (req, res) => {
  await doc.loadInfo();
  try {
    const id = parseInt(req.params.id);
    const sheet = doc.sheetsByTitle["assets"];
    const rows = await sheet.getRows({ limit: 1, offset: parseFloat(id) - 1 });
    const tbody = [];
    const thead = rows[0]._worksheet.headerValues;
    rows.filter((item, index) => {
      const obj = {};
      for (let i = 0; i < thead.length; i++) {
        obj["id"] = index + 1;
        obj[thead[i]] = item._rawData[i];
      }
      tbody.push(obj);
    });
    res.render("edit", { tbody:tbody[0] });
  } catch (error) {
    res.redirect("/");
  };
});

app.post("/edit/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const sheet = doc.sheetsByTitle["assets"];
    const rows = await sheet.getRows({ limit: 1, offset: parseFloat(id)+1 });
    rows[0].set('email') = 'sergey@abc.xyz'; // update a value
    await rows[0].save();
    res.redirect("/");
  } catch (error) {
    res.redirect("/");
  }
});

app.get("/delete/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex((task) => task.id === id);
  if (index !== -1) {
    tasks.splice(index, 1);
  }
  res.redirect("/");
});

const port = process.env.port || 3000;
app.listen(port, () => {
  console.log("Listening on port 3000");
});
