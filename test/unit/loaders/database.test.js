jest.mock('mongoose');
jest.mock('../../../src/helpers/utils/logger/logger.js');
jest.mock('../../../src/config.js', () => ({
    __esModule: true,
    default: {
        mongoUri: 'mongodb://localhost/test',
        email: { user: 'test', pass: 'test', service: 'gmail' }
    }
}));

describe('database loader', () => {
    let connectDB, mongoose, logger;

    beforeEach(() => {
        jest.resetModules();
        mongoose = require('mongoose');
        logger = require('../../../src/helpers/utils/logger/logger.js');
        connectDB = require('../../../src/loaders/database.js').default;
        jest.clearAllMocks();
    });

    it('should connect to the database with correct options', async () => {
        mongoose.connect.mockResolvedValue();
        await connectDB();
        expect(mongoose.connect).toHaveBeenCalledWith(
            'mongodb://localhost/test',
            expect.objectContaining({
                useNewUrlParser: true,
                useUnifiedTopology: true,
            })
        );
    });

    it('should log error and exit process if connection fails', async () => {
        mongoose.connect.mockRejectedValue(new Error('fail'));
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
        await connectDB();
        // Soporta tanto logger.error como logger.default.error
        const loggerError = logger.error || (logger.default && logger.default.error);
        expect(loggerError).toHaveBeenCalledWith('Error connecting to the database');
        expect(exitSpy).toHaveBeenCalledWith(1);
        exitSpy.mockRestore();
    });
});
