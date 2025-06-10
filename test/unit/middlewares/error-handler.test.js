import errorHandler from '../../../src/middlewares/error-handler.js';
import logger from '../../../src/helpers/utils/logger/logger.js';

jest.mock('../../../src/helpers/utils/logger/logger.js');

describe('errorHandler middleware', () => {
    let req, res;

    beforeEach(() => {
        req = {
            method: 'GET',
            originalUrl: '/test'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        jest.clearAllMocks();
    });

    it('should respond with default 500 and message if no status/message in error', () => {
        const err = new Error();
        errorHandler(err, req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            code: 500,
            message: 'Internal Server Error'
        }));
        expect(logger.error).toHaveBeenCalled();
    });

    it('should use error status and message if provided', () => {
        const err = { status: 404, message: 'Not Found', stack: 'stacktrace' };
        errorHandler(err, req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            code: 404,
            message: 'Not Found'
        }));
        expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('[404] Not Found'));
    });

    it('should include stack in development mode', () => {
        process.env.NODE_ENV = 'development';
        const err = { status: 400, message: 'Bad Request', stack: 'stacktrace' };
        errorHandler(err, req, res);

        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            stack: 'stacktrace'
        }));
    });

    it('should not include stack in production mode', () => {
        process.env.NODE_ENV = 'production';
        const err = { status: 400, message: 'Bad Request', stack: 'stacktrace' };
        errorHandler(err, req, res);

        expect(res.send).not.toHaveBeenCalledWith(expect.objectContaining({
            stack: 'stacktrace'
        }));
    });
});
