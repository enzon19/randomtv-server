const express = require('express');
const fs = require('fs');
const requireFromString = require('require-from-string');
const app = express();

function checkFileExists(file) {
  return fs.promises.access(file, fs.constants.F_OK)
    .then(() => false)
    .catch(() => true);
}

app.get('*', async (req, res) => {
  const basePath = __dirname + "/front";
  let filePath = basePath + req.params["0"];
  if (!filePath.match(/\..*/)) filePath += ".html";
  
  if (req.params["0"] == "/") {
    filePath = basePath + "/index.html";
  } else if (req.params["0"] == "/pickItem") {
    const app = requireFromString(fs.readFileSync("./app.js", "utf8"));
    app.pickItem(req.query, res);
    filePath = "";
  } else if (await checkFileExists(filePath)) {
    filePath = basePath + "/404.html";
  }
  
  if (filePath) res.sendFile(filePath);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log(`Error! ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}\n\n`, reason.stack || reason)
})

app.listen(0907);