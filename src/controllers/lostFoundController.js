import LostFound from '../models/LostFound.js';

// Crear un reporte de mascota perdida o encontrada
export const createReport = async (req, res) => {
    try {
        const { petId, reportType, description, location, reporter } = req.body;
        const newReport = new LostFound({ petId, reportType, description, location, reporter });
        await newReport.save();
        res.status(201).json(newReport);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el reporte', error });
    }
};

// Obtener todos los reportes
export const getReports = async (req, res) => {
    try {
        const reports = await LostFound.find();
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los reportes', error });
    }
};
