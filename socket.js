import { Server } from "socket.io";
import { server, redis} from "./server.js";
import { createRedisConnection } from "./redis.connection.js";

const io = new Server(server);

const pub = createRedisConnection();
const sub = createRedisConnection();


//---- ratelimit helper func
const rateLimit = async (key, limit, windowSec) => {
    const current = await redis.incr(key);

    if (current === 1) {
        await redis.expire(key, windowSec);
    }

    return current <= limit;
};



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
        // console.log("SERVER:: box-clicked: ", index);


        const allowed = await rateLimit(
            `rate:${socket.id}`,
            5,     // max actions
            5       // per 5 seconds
        );

        if (!allowed) {
            console.log("Rate limit hit:", socket.id);
            socket.emit("server:rate-limit")
        }

        if (index < 0 || index > 1_000_000 || typeof checked !== "boolean") return;

        await redis.setbit("checkboxes", index, checked ? 1 : 0);

        pub.publish("box-updates", JSON.stringify({ index, checked }))

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