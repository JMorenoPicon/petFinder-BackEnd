import { getCommentsByPet, createComment, updateComment, deleteComment } from '../../../src/controllers/commentController.js';
import Comment from '../../../src/models/Comment.js';

jest.mock('../../../src/models/Comment.js');

describe('Comment Controller - getCommentsByPet', () => {
    let req, res;

    beforeEach(() => {
        req = { params: { petId: 'petId' } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        jest.clearAllMocks();
    });

    it('should return comments for a pet', async () => {
        const comments = [{ content: 'Nice pet!' }];
        const sortMock = jest.fn().mockResolvedValue(comments);
        const populateMock = jest.fn().mockReturnValue({ sort: sortMock });
        Comment.find.mockReturnValue({ populate: populateMock });

        await getCommentsByPet(req, res);

        expect(Comment.find).toHaveBeenCalledWith({ pet: 'petId' });
        expect(populateMock).toHaveBeenCalledWith('author', 'username');
        expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(comments);
    });

    it('should handle errors and return 500', async () => {
        Comment.find.mockImplementation(() => { throw new Error('fail'); });

        await getCommentsByPet(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Error al obtener comentarios'
        }));
    });
});

describe('Comment Controller - createComment', () => {
    let req, res, mockComment;

    beforeEach(() => {
        req = {
            params: { petId: 'petId' },
            body: { content: 'Nice pet!' },
            user: { id: 'userId' }
        };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        mockComment = {
            save: jest.fn().mockResolvedValue(),
            populate: jest.fn().mockResolvedValue(),
        };
        jest.clearAllMocks();
    });

    it('should return 400 if content is empty', async () => {
        req.body.content = '   ';
        await createComment(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'El comentario no puede estar vacío.' });
    });

    it('should create and return the new comment', async () => {
        Comment.mockImplementation(() => mockComment);

        await createComment(req, res);

        expect(Comment).toHaveBeenCalledWith({ pet: 'petId', content: 'Nice pet!', author: 'userId' });
        expect(mockComment.save).toHaveBeenCalled();
        expect(mockComment.populate).toHaveBeenCalledWith('author', 'username');
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockComment);
    });

    it('should handle errors and return 500', async () => {
        Comment.mockImplementation(() => { throw new Error('fail'); });

        await createComment(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Error al crear el comentario'
        }));
    });
});

describe('Comment Controller - updateComment', () => {
    let req, res, mockComment;

    beforeEach(() => {
        req = {
            params: { commentId: 'commentId' },
            body: { content: 'Updated comment' },
            user: { id: 'userId' }
        };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        mockComment = {
            author: { toString: () => 'userId' },
            save: jest.fn().mockResolvedValue(),
            populate: jest.fn().mockResolvedValue(),
            content: 'Old comment'
        };
        jest.clearAllMocks();
    });

    it('should return 404 if comment not found', async () => {
        Comment.findById.mockResolvedValue(null);

        await updateComment(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Comentario no encontrado' });
    });

    it('should return 403 if user is not the author', async () => {
        Comment.findById.mockResolvedValue({ author: { toString: () => 'otherUser' } });

        await updateComment(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'No tienes permiso para editar este comentario' });
    });

    it('should return 400 if content is empty', async () => {
        Comment.findById.mockResolvedValue(mockComment);
        req.body.content = '   ';

        await updateComment(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'El comentario no puede estar vacío.' });
    });

    it('should update and return the comment', async () => {
        Comment.findById.mockResolvedValue(mockComment);

        await updateComment(req, res);

        expect(mockComment.content).toBe('Updated comment');
        expect(mockComment.save).toHaveBeenCalled();
        expect(mockComment.populate).toHaveBeenCalledWith('author', 'username');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockComment);
    });

    it('should handle errors and return 500', async () => {
        Comment.findById.mockRejectedValue(new Error('fail'));

        await updateComment(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Error al editar el comentario'
        }));
    });
});

describe('Comment Controller - deleteComment', () => {
    let req, res, mockComment;

    beforeEach(() => {
        req = {
            params: { commentId: 'commentId' },
            user: { id: 'userId' }
        };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        mockComment = {
            author: { toString: () => 'userId' },
            deleteOne: jest.fn().mockResolvedValue()
        };
        jest.clearAllMocks();
    });

    it('should return 404 if comment not found', async () => {
        Comment.findById.mockResolvedValue(null);

        await deleteComment(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Comentario no encontrado' });
    });

    it('should return 403 if user is not the author', async () => {
        Comment.findById.mockResolvedValue({ author: { toString: () => 'otherUser' } });

        await deleteComment(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'No tienes permiso para borrar este comentario' });
    });

    it('should delete the comment and return success message', async () => {
        Comment.findById.mockResolvedValue(mockComment);

        await deleteComment(req, res);

        expect(mockComment.deleteOne).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'Comentario eliminado correctamente' });
    });

    it('should handle errors and return 500', async () => {
        Comment.findById.mockRejectedValue(new Error('fail'));

        await deleteComment(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Error al eliminar el comentario'
        }));
    });
});
