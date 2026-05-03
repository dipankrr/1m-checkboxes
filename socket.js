import { Server } from "socket.io";
import { server, redis} from "./server.js";
import { createRedisConnection } from "./redis.connection.js";

const io = new Server(server);

const pub = createRedisConnection();
const sub = createRedisConnection();


io.on( "connection", (socket)=>{

    console.log("User connected:", socket.id);
    
    //---- on client connect send the state from redis
    socket.on("client:init", async ({ start = 0, limit = 1000 }) => {
        const pipeline = redis.pipeline();

        for (let i = start; i < start + limit; i++) {
            pipeline.getbit("checkboxes", i);
        }

        const results = await pipeline.exec();

        const checked = [];

        results.forEach(([err, bit], i) => {
            if (bit === 1) checked.push(start + i);
        });

        socket.emit("server:init:boxes", checked);
    });


    //---- on box click update redis > publish to channel
    socket.on("client:box:clicked", async ({index, checked})=>{
        console.log("SERVER:: box-clicked: ", index);

        await redis.setbit("checkboxes", index, checked ? 1 : 0);

        pub.publish("box-updates", JSON.stringify({ index, checked }))

        // io.emit("server:box:clicked", {index, checked})
    })
    
})




//---- subscribe 
sub.subscribe("box-updates");
sub.on("error", console.error);
sub.on("connect", () => console.log("Sub connected"));

//---- on update emit to all users
sub.on("message", (channel, message) => {

    const data = JSON.parse(message);

    if (channel === "box-updates") {
        io.emit("server:box:clicked", data);
    }
});




export default io;