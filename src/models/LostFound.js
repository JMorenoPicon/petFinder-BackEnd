import mongoose from 'mongoose';

const lostFoundSchema = new mongoose.Schema({
    petId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        required: true
    },
    reportType: {
        type: String,
        enum: ['lost', 'found'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    reportDate: {
        type: Date,
        default: Date.now
    },
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Usuario que hace el reporte
        required: true
    }
}, {
    timestamps: true // Añade automáticamente createdAt y updatedAt
});

const LostFound = mongoose.model('LostFound', lostFoundSchema);

export default LostFound;
