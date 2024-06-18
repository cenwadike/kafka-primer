import {Consumer, EachMessagePayload, Kafka} from 'kafkajs';

const topics: Array<string> = ['message-created'] as const;

function messageCreatedHandler(data: any) {
  console.log('Got a new message', JSON.stringify(data, null, 2));
}

const topicToSubscribe: Record<(typeof topics)[number], Function> = {
  'message-created': messageCreatedHandler,
};

export default class KafkaConsumerFactory {
  private kafkaConsumer: Consumer;

  public constructor() {
    this.kafkaConsumer = this.createKafkaConsumer();
  }

  public async connectConsumer() {
    await this.kafkaConsumer.connect();
    console.log('Connected to consumer');

    for (let i = 0; i < topics.length; i++) {
      await this.kafkaConsumer.subscribe({
        topic: topics[i],
        fromBeginning: false,
      });
    }

    await this.kafkaConsumer.run({
      eachMessage: async ({topic, partition, message}: EachMessagePayload) => {
        if (!message || !message.value) {
          return;
        }

        const data = JSON.parse(message.value.toString());

        const handler = topicToSubscribe[topic];

        if (handler) {
          handler(data);
        }
      },
    });
  }
  public async shutdown(): Promise<void> {
    await this.kafkaConsumer.disconnect();
  }

  private createKafkaConsumer(): Consumer {
    const kafka = new Kafka({
      clientId: 'consumer-service',
      brokers: ['localhost:9092'],
    });
    const consumer = kafka.consumer({groupId: 'consumer-service'});
    return consumer;
  }
}
