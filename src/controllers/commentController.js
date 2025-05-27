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
