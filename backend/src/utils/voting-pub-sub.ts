
type Message = { PollOptionId: string, votes: number}
type Subscriber = (message: Message) => void 

class VotingPubSub {
    private channels: Record <string, Subscriber [] > = {}

    subscribe (pollId: string, subscriber: Subscriber) {
        if (!this.channels[pollId]) {
            this.channels[pollId] = []
        }

        this.channels[pollId].push(subscriber)
    }

    publish (poolId: string, message: Message) {
        if (!this.channels[poolId]) {
            return 
        }

        for (const subscriber of this.channels[poolId]) {
            subscriber(message)
        }

    }

}

export const voting = new VotingPubSub () 