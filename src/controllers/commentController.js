import Comment from '../models/Comment.js';

export const getCommentsByPet = async (req, res) => {
    try {
        const comments = await Comment.find({ pet: req.params.petId })
            .populate('author', 'username')
            .sort({ createdAt: -1 });
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener comentarios', error });
    }
};

export const createComment = async (req, res) => {
    try {
        const { content } = req.body;
        const petId = req.params.petId;
        const author = req.user.id;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'El comentario no puede estar vacío.' });
        }

        const comment = new Comment({ pet: petId, content, author });
        await comment.save();
        await comment.populate('author', 'username');
        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el comentario', error });
    }
};

export const updateComment = async (req, res) => {
    try {
        const { content } = req.body;
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comentario no encontrado' });
        if (comment.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'No tienes permiso para editar este comentario' });
        }
        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'El comentario no puede estar vacío.' });
        }
        comment.content = content;
        await comment.save();
        await comment.populate('author', 'username');
        res.status(200).json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Error al editar el comentario', error });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comentario no encontrado' });
        if (comment.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'No tienes permiso para borrar este comentario' });
        }
        await comment.deleteOne();
        res.status(200).json({ message: 'Comentario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el comentario', error });
    }
};
