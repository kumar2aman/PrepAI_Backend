import express from "express";
import cors from "cors";
import { router } from "./router/v1/interview";
import bodyParser from "body-parser"
const app = express();

app.use(cors({
  origin:"http://localhost:3000",
  credentials:true
}));
app.use(bodyParser.json());


app.use("/api/v1", router);

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});