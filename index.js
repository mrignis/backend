// index.js
import { initMongoConnection } from './db/initMongoConnection.js';
import { setupServer } from './app.js';

const bootstrap = async () => {
    try {
        await initMongoConnection();
        setupServer();
    } catch (error) {
        console.error(`Error during app bootstrap: ${error.message}`);
    }
};

bootstrap();
