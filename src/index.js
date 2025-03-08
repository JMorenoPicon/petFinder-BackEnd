import app from './app.js';
import config from './config.js';
import logger from './helpers/utils/logger/logger.js';


const { port } = config;

app.listen(port, () => {
    logger.info(`Server listening in port: ${port}`);
});
