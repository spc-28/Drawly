import express from "express";
import { router } from "./routes/route";
import { HTTP_PORT } from "@repo/backend-common/config";

const app = express();

app.use(express.json());
app.use('/api/v1', router);

app.listen(HTTP_PORT, ()=> console.log(`Listening on Port ${HTTP_PORT}`));