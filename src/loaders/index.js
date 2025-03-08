import expressLoader from './express.js';
import databaseLoader from './database.js';

function init(server) {
    expressLoader(server); // Cargar la configuración de Express
    databaseLoader();      // Cargar la conexión a la base de datos
}

export default { init };
