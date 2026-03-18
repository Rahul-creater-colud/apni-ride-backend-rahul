import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
<<<<<<< HEAD

=======
>>>>>>> bf45d75a1d6da942d33451a41d52e1f129f8db75
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));
<<<<<<< HEAD

// ✅ ROOT ROUTE ADD KIYA
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.use("/api/v1", routes);
app.use(errorHandler);

export default app;
=======
app.use("/api/v1", routes);
app.use(errorHandler);

export default app;
>>>>>>> bf45d75a1d6da942d33451a41d52e1f129f8db75
