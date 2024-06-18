import {Kafka, Producer, RecordMetadata} from 'kafkajs';

const topics = ['message-created'] as const;

export default class KafkaProducerFactory {
  private producer: Producer;

  constructor() {
    this.producer = this.createProducer();
  }

  public async start(): Promise<void> {
    try {
      await this.producer.connect();
    } catch (error) {
      console.log('Error connecting the producer: ', error);
    }
  }

  public async sendMessage(
    topic: (typeof topics)[number],
    message: string
  ): Promise<RecordMetadata[]> {
    return this.producer.send({
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

  public async shutdown(): Promise<void> {
    await this.producer.disconnect();
  }

  private createProducer(): Producer {
    const kafka = new Kafka({
      clientId: 'producer-client',
      brokers: ['localhost:9092'],
    });

    return kafka.producer();
  }
}
