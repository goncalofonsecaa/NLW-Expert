import fastify from "fastify";
import {PrismaClient} from '@prisma/client';
import {z} from 'zod';
import { createPoll } from "./routes/create-poll";
import { getPoll } from "./routes/get-polls";
import { voteOnPoll } from "./routes/vote-on-poll";
import cookie from '@fastify/cookie';


const app = fastify();

app.register(cookie, {
    secret: "polls-app-nlw",
    hook: 'onRequest',
  })


app.register(createPoll)
app.register(getPoll)
app.register(voteOnPoll)


app.listen ( {port: 3333}).then ( () => {
    console.log('Server is running on port 3333');
});






