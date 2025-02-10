import Post from '../models/Post.js';

// Crear un nuevo post en el foro
export const createPost = async (req, res) => {
    try {
        const { title, content, author } = req.body;

        // Crear el nuevo post
        const newPost = new Post({
            title,
            content,
            author
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el post', error });
    }
};

// Obtener todos los posts
export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'username');
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los posts', error });
    }
};

// Obtener un post por ID
export const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'username');
        if (!post) return res.status(404).json({ message: 'Post no encontrado' });
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el post', error });
    }
};

// Actualizar un post
export const updatePost = async (req, res) => {
    try {
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPost) return res.status(404).json({ message: 'Post no encontrado' });
        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el post', error });
    }
};

// Eliminar un post
export const deletePost = async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (!deletedPost) return res.status(404).json({ message: 'Post no encontrado' });
        res.status(200).json({ message: 'Post eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el post', error });
    }
};
