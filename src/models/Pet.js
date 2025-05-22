import mongoose from 'mongoose';

const petSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    species: {
        type: String,
        required: true
    },
    breed: {
        type: String,
        required: true
    },
    birthDate: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String, // URL de la imagen
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'reserved', 'lost'],
        default: 'available',
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Referencia a la colección de Usuarios
        required: true
    },
    lastSeen: { // solo para status="lost"
        type: String
    },
    reservedAt: {
        type: Date, // Fecha en que se reservó
        default: null
    }
}, {
    timestamps: true // Añade automáticamente createdAt y updatedAt
});

petSchema.methods.calculateAge = function() {
    const today = new Date();
    const birthDate = new Date(this.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

petSchema.methods.checkReservationExpiration = function() {
    if (this.status === 'reserved' && this.reservedAt) {
        const reservationTime = new Date(this.reservedAt);
        const currentTime = new Date();
        const diffInHours = (currentTime - reservationTime) / (1000 * 60 * 60); // Diferencia en horas
        if (diffInHours >= 24) {
            this.status = 'available';
            this.reservedAt = null;
            this.save(); // Guardar el cambio de estado
        }
    }
};

const Pet = mongoose.model('Pet', petSchema);

export default Pet;
