import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

// ✅ ROOT ROUTE
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.use("/api/v1", routes);
app.use(errorHandler);

export default app;