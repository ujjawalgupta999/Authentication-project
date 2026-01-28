import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    const port = process.env.PORT || 8000;

    app.on("error", (error) => {
      console.error("error express app is made porperly ", error);
      throw error;
    });

    app.listen(port, () => {
      console.log("app is listening on the port :", port);
    });
  })
  .catch((err) => {
    console.log("mongo db connection failure", err);
  });
