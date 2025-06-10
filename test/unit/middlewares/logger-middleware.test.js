import { logDate } from '../../../src/middlewares/logger-middleware.js';
import logger from '../../../src/helpers/utils/logger/logger.js';

jest.mock('../../../src/helpers/utils/logger/logger.js');

describe('logDate middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = { method: 'GET', path: '/test' };
        res = {
            on: jest.fn((event, cb) => {
                if (event === 'finish') res._finishCb = cb;
            }),
            statusCode: 200
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should log the request and call next', () => {
        logDate(req, res, next);

        expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('GET /test'));
        expect(next).toHaveBeenCalled();
    });

    it('should log the status code when response finishes', () => {
        logDate(req, res, next);

        // Simula el evento 'finish'
        res._finishCb();

        expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('GET /test 200'));
    });
});
