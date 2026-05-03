import dotenv from 'dotenv'
import {server} from "./server.js";
import io from "./socket.js";


dotenv.config({
    path: '.env'
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
   console.log("Running on 3000");
});