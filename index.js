const fs = require("fs");
const yaml = require("js-yaml");
const ejs = require("ejs");

const readSPARQL = (dirpath) => {
  let stringData = [];

  let commentRe = /#\+.*/g;

  fs.readdirSync(dirpath).forEach((file) => {
    const fileContent = fs.readFileSync(`${dirpath}${file}`).toString();
    const grlcDecorators = yaml.load(
      fileContent
        .match(commentRe)
        .map((el) => el.replace(/#\+\s?/, ""))
        .join("\n")
    );

    stringData.push({
      filename: file.split(".")[0],
      query: fileContent,
      encodedQuery: encodeURIComponent(fileContent),
      title: grlcDecorators["summary"],
      layout: "query.ejs",
    });
  });
  return stringData;
};

const queriesArr = readSPARQL("./queries/");

queriesArr.forEach((query) => {
  ejs.renderFile("./templates/query.ejs", query, {}, (err, str) => {
    if (err) throw err;

    fs.writeFile(`./_site/${query.filename}.html`, str, (err) => {
      if (err) throw err;
    });
  });
});

module.exports = readSPARQL;
