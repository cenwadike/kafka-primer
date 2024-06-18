import {connectConsumer, disconnectConsumer} from './kafka';
import {createServer} from './server';

async function gracefulShutdown(app: Awaited<ReturnType<typeof createServer>>) {
  console.log('Shutting down...');

  await app.close();

  await disconnectConsumer();
  // eslint-disable-next-line n/no-process-exit
  process.exit(0);
}

async function main() {
  const app = createServer();

  await connectConsumer();

  await app.listen({
    port: 4000,
    host: '0.0.0.0',
  });

  console.log('Consumer service ready at http://localhost:4000');

  const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'] as const;

  for (let i = 0; i < signals.length; i++) {
    const signal = signals[i];
    process.on(signal, () => {
      gracefulShutdown(app);
    });
  }

  console.log('Consumer service shutting down');
}

main();
