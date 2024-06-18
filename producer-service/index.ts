import {KafkaProducerFactory} from './kafka';
import {createServer} from './server';

async function gracefulShutdown(
  app: Awaited<ReturnType<typeof createServer>>,
  kafkaProducer: KafkaProducerFactory
) {
  console.log('Shutting down...');

  await app.close();
  await kafkaProducer.shutdown();

  // eslint-disable-next-line n/no-process-exit
  process.exit(0);
}

async function main() {
  const app = createServer();

  const kafkaProducer = new KafkaProducerFactory();
  kafkaProducer.start();
  kafkaProducer.sendMessage('message-created', 'new message');

  await app.listen({
    port: 4000,
    host: '0.0.0.0',
  });

  console.log('Producer service ready at http://localhost:4000');

  const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'] as const;

  for (let i = 0; i < signals.length; i++) {
    const signal = signals[i];
    process.on(signal, () => {
      gracefulShutdown(app, kafkaProducer);
    });
  }

  console.log('Producer service shutting down');
}

main();
