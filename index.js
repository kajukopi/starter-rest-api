require("fix-esm").register();
require("dot-env");
const express = require("express");
const app = express();
const cors = require("cors");
// app.use(express.static);
// app.use(express.json());

app.use(cors());

const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

const keyFile = {
  type: "service_account",
  project_id: "pgskaizen",
  private_key_id: "1ddaf7a7109c74b0243ea5f24fab17ab47322b79",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCdHgoEVZfBH/Bz\n+ZmvJVLWNW6ZbYO2QvvyHDkqqez/FilqvW2ChSOmJXLF9pujkwMkUBfzHG3ehN96\nVvY++kIxiBrLibavNf+BLT2M75ulnSiVmKAnlEDSA0y+pMSZbpyT8iK9MxxOLz3L\nntW23noedUu6Lb/KeSp0gvyPSkWpGoI7v2Ks9FnTRfFaqvky8HUeXfbT9F/QLQX9\nSkPhdHOsOXOaoCyrVb5c3yH2nSOdkNna87iPqxDK7hJB3PBThNMgGL7hU0cqaQ6m\nSxp1skB+otubEzjx/vtwdCMJuKfyZagHF3Paf3PiLdFRydbYJkAui317oHzlxxbm\nv+AAe6s5AgMBAAECggEAG51AeHOMuQJCkjef1cMzFHgOqMOxPxL10h84wvFbuJeu\nDtcdTK/WzKhPTFDkGPNJPZQgKXfpLY9f8dIf9ICqqqb3wqdBJvlQH2WSqFcinZCK\nJgTNvTcWz3KKBgXSkf75YR1RErzNcEZoT4XqnPnsL7dA6IeK6myyVAkDl7GfnbFG\n9wRxmL426ntnR+zXPmq/BryojG8zvpTX3EqNcgFWmihYGx6s88gG11XcQzcseu9V\nWku8sG7GatYMp2i4i/42raE1IOmmjIm6Eb9Md97Ua+DnEl0VX2ZywURYJxIkl7J8\n2cFyhyU0R0p8I2UqxBopHl6AKqovnWbOLqaSA4TgKQKBgQDScUtjxiKzvXamC9PR\nT64WgueTKiHHK8IutboYCOU/UzdnHUDkz1Iw6UoMmY7JSTLi2dXWaI5lzckF1vCu\nTSopbkTnGyJiFHhOtnIFBH9KBSxNxg6pJOZ+i3Z0JCp6GLMdda+lD/3lnjVKt8kH\nosCilJ0hanRk60bCuDYQoSfHxQKBgQC/IXdqdLgqBS2iSi58U4pvjeaqDFokrSk2\nIiNUYh2N0KLJPMHs3uorMoOLsDZ2/18JUKLeIyr2RiH7TiTmTAkD3Yv+k5m1mPk8\nw8z9DraEk8U7Z4Lfd6qR8rDGY/n0x6NCrOnfvFJAUneCtCfENlfXnopHdfG2kzNi\nNPHUv7WY5QKBgQCBNZzTawE9mPPzqclpd+Hs4n0rR7ArqTt2EJBtV3Die8bFohmJ\nI55Ud7jGmbYo8q+yx4tbNSFRcpOd6UYnzys2+wSFXYyz6duggLbrS8KYASsdqaCw\ny/5V7m1RjC8kfmvjh7HLyFDdHlGcSdG9xXk/mb4MmV9T432z6wUPGtPg/QKBgD2x\nbbw9BJz7ouk5jJuw04SChyvoZMhl5GGGz2STbvqxl3nhVK9CnM9otLFIJaxvbZuy\nHYAaVem8ZYeah6qWbGqE/oUj23+Uaw7EHMyqDRvqHsW3+bRsCfCmJ41CBBKQxg/l\nhHAld18vv0e/Iv7gk6YTlIrQdT77cKCIem6zmshJAoGBAIK6uEilczwTtPwtKJ1Q\n9zrWpW4B8/AluDY3LnQ1/McfRU8zHbKiIYl4digG7MW0USqElp7wiiwdx8xmNPZ6\nLMIRuGxy1f1xsZLUT/ftcPKmtjGkzXQeekd0f73k22oA5IhTG6ZhVO7e/bA+lBO8\n7UqJDBrysdrKJ3sb+NPfqoaP\n-----END PRIVATE KEY-----\n",
  client_email: "pgs-tpm@pgskaizen.iam.gserviceaccount.com",
  client_id: "105918956345428596403",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/pgs-tpm%40pgskaizen.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};



const serviceAccountAuth = new JWT({
  keyFile: "./keyFile.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const doc = new GoogleSpreadsheet("133G_c39tK39M0HdI1QwfjNNx0yB7h3ipM82c-Dn-9g4", serviceAccountAuth);

console.log(process.env);

app.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle["query"];
    await sheet.loadCells("A1:Z10");
    const a2 = sheet.getCellByA1("A2");
    const query = `SELECT * WHERE A LIKE '%${id}%' ORDER BY A`;
    const rumus = `=QUERY(assets!A2:I,"${query}")`;
    a2.formula = rumus;
    await sheet.saveUpdatedCells();
    const rows = await sheet.getRows();
    const data = rows.at(-1)._rawData;
    const header = rows.at(-1)._worksheet._headerValues;
    const object = {};
    for (let i = 0; i < data.length; i++) {
      object[header[i]] = data[i];
    }
    res.json({ status: true, data: object, length: rows.length });
  } catch (error) {
    res.json({ status: false, data: error });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Listening on port 3000");
});
