import { z } from 'zod';
import {randomUUID} from "node:crypto"
import { prisma } from "../../lib/prisma";
import { redis } from "../../lib/redis";
import { FastifyInstance } from 'fastify';

export async function voteOnPoll(app: FastifyInstance) {
  app.post('/polls/:pollId/votes', async (request, reply) => {
    const voteOnPollBody = z.object({
        pollOptionId: z.string().uuid()
    });

    const VoteOnPollParams = z.object({
        pollId: z.string().uuid()
    });

    const { pollOptionId } = voteOnPollBody.parse(request.body);
    const { pollId } = VoteOnPollParams.parse(request.params);

    let { sessionId } = request.cookies

    if ( sessionId ) {
        const userPreviousVoteOnPoll = await prisma.vote.findFirst({     
            where: {
                sessionId,
                pollId
            }
        });

        if ( userPreviousVoteOnPoll  && userPreviousVoteOnPoll.pollOptionId != pollOptionId) {

            await prisma.vote.delete({
                where: {
                    id: userPreviousVoteOnPoll.id
                }
            });

            await redis.zincrby(pollId, -1, userPreviousVoteOnPoll.pollOptionId);
                   
        } else if (userPreviousVoteOnPoll) {
            return reply.code(409).send({
                message: 'User already voted on this poll'
            });
        }
    }

    if ( !sessionId ) {
     sessionId = randomUUID();

    reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        signed: true,
        httpOnly: true,
    })
}

    await prisma.vote.create({
        data: {
            pollOptionId,
            sessionId,
            pollId
        }
    });

    await redis.zincrby(pollId, 1, pollOptionId);

    return reply.code(201).send();

    });
  };




