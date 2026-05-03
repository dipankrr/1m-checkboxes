import express from "express"
import path from "path"
import { fileURLToPath } from "url";

const app = express()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));


app.get("/api/health", (req, res) =>{
    return res.send("okay")
})


export default app