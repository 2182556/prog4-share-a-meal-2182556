const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const userRouter = require("./src/routes/user.routes");

app.use(bodyParser.json());

app.all("*", (req, res, next) => {
  const method = req.method;
  console.log(`Method ${method} called`);
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Share a meal application",
  });
});

app.use(userRouter);

app.all("*", (req, res) => {
  res.status(404).json({
    status: 404,
    result: "End-point not found",
  });
});

app.use((err, req, res, next) => {
  res.status(err.status).json(err);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

module.exports = app;
