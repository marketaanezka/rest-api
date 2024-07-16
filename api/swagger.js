const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Books API",
      version: "1.0.0",
      description: "A simple Express Books API"
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
      {
        url: "https://rest-rfai2dx14-marketaanezkas-projects.vercel.app/",
      }
    ],
  },
  apis: ["./api/app.js"], // files containing annotations as above
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};
