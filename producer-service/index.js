"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const kafka_1 = require("./kafka");
const server_1 = require("./server");
function gracefulShutdown(app) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Shutting down...');
        yield app.close();
        yield (0, kafka_1.disconnectProducer)();
        // eslint-disable-next-line n/no-process-exit
        process.exit(0);
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = (0, server_1.createServer)();
        yield (0, kafka_1.connectProducer)();
        yield app.listen({
            port: 4000,
            host: '0.0.0.0',
        });
        console.log('Notification service ready at http://localhost:4000');
        const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
        for (let i = 0; i < signals.length; i++) {
            const signal = signals[i];
            process.on(signal, () => {
                gracefulShutdown(app);
            });
        }
        console.log('Consumer service shutting down');
    });
}
main();
