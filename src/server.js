import express from "express";
import movieRoutes from "./routes/movieRoutes.js";

const app = express();
const PORT = 3001;


// API Routes
app.use("/movie", movieRoutes)

app.listen(PORT, () => { console.log("Server is Runing !!!!!") });




