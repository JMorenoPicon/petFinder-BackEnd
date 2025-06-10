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
    city: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'reserved', 'lost', 'found'],
        default: 'available',
        required: true
    },
    foundAt: {
        type: Date,
        default: null
    },
    foundLocationLat: {
        type: Number,
        default: null
    },
    foundLocationLng: {
        type: Number,
        default: null
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastSeen: {
        type: String
    },
    reservedAt: {
        type: Date,
        default: null
    },
    locationLat: {
        type: Number,
    },
    locationLng: {
        type: Number,
    }
}, {
    timestamps: true
});

// petSchema.methods.calculateAge = function() {
//     const today = new Date();
//     const birthDate = new Date(this.birthDate);
//     let age = today.getFullYear() - birthDate.getFullYear();
//     const m = today.getMonth() - birthDate.getMonth();
//     if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
//         age--;
//     }
//     return age;
// };

// petSchema.methods.checkReservationExpiration = function() {
//     if (this.status === 'reserved' && this.reservedAt) {
//         const reservationTime = new Date(this.reservedAt);
//         const currentTime = new Date();
//         const diffInHours = (currentTime - reservationTime) / (1000 * 60 * 60); // Diferencia en horas
//         if (diffInHours >= 24) {
//             this.status = 'available';
//             this.reservedAt = null;
//             this.save(); // Guardar el cambio de estado
//         }
//     }
// };

const Pet = mongoose.model('Pet', petSchema);

export default Pet;
