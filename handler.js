"use strict";

module.exports.getArxivInformation = (event, context, callback) => {
  const axios = require("axios");
  const xml2js = require("xml2js");
  const parser = new xml2js.Parser({
    mergeAttrs: true,
    trim: true,
    normalize: true,
  });

  let articleIds = null;

  if (event.queryStringParameters) {
    if (event.queryStringParameters.articleIds) {
      articleIds = event.queryStringParameters.articleIds;
    }
  }

  let response;
  if (articleIds) {
    axios
      .get(`http://export.arxiv.org/api/query?id_list=${articleIds}`)
      .then(res => {
        const XMLResult = res.data;
        parser.parseString(XMLResult, (err, result) => {
          if (err) {
            response = {
              statusCode: 500,
              body: JSON.stringify({ message: "Had error on parsing XML" }),
              headers: {
                "Access-Control-Allow-Origin": "*",
              },
            };
            return callback(null, response);
          } else {
            if (result.feed && result.feed.entry) {
              response = {
                statusCode: 200,
                headers: {
                  "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({
                  article: result.feed.entry[0],
                }),
              };
              return callback(null, response);
            }
          }
        });
      })
      .catch(err => {
        response = {
          statusCode: 400,
          body: JSON.stringify({ message: "Not Found in ArXiv" }),
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        };
        return callback(null, response);
      });
  } else {
    response = {
      statusCode: 404,
      body: JSON.stringify({ message: "Not Found" }),
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
    return callback(null, response);
  }
};
