import {Kafka} from 'kafkajs';

const brokers = ['localhost:9092'];

const kafka = new Kafka({
  clientId: 'producer-service',
  brokers,
});

const producer = kafka.producer({idempotent: true});

export async function connectProducer() {
  await producer.connect();
}

export async function disconnectProducer() {
  return await producer.disconnect();
}
const topics = ['message-created'] as const;

export async function sendMessage(
  topic: (typeof topics)[number],
  message: string
) {
  return producer.send({
    topic,
    messages: [
      {
        key: 'producer-service',
        value: message,
        headers: {source: 'producer-service'},
      },
    ],
  });
}
