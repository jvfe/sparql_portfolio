const fs = require("fs");
const yaml = require("js-yaml");
const ejs = require("ejs");
const config = yaml.load(fs.readFileSync("_config.yml"));

const readSPARQL = (dirPath) => {
  let stringData = [];

  const commentRe = /#\+.*/g;

  fs.readdirSync(dirPath).forEach((file) => {
    const fileContent = fs.readFileSync(`${dirPath}${file}`).toString();
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
    });
  });
  return stringData;
};

const renderAll = (config) => {
  const queriesArr = readSPARQL(config["queries_directory"]);
  const allData = {
    queryFiles: queriesArr,
    ...config,
  };

  queriesArr.forEach((query) => {
    ejs.renderFile(allData["query_template"], query, {}, (err, str) => {
      if (err) throw err;

      fs.writeFile(`./_site/queries/${query.filename}.html`, str, (err) => {
        if (err) throw err;
      });
    });
  });

  ejs.renderFile(allData["index_template"], allData, {}, (err, str) => {
    if (err) throw err;

    fs.writeFile("./_site/index.html", str, (err) => {
      if (err) throw err;
    });
  });
};

renderAll(config);
