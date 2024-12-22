import { Schema, model, models } from 'mongoose';

const TrailSchema = new Schema({
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    name: {
        type: String,
        required: [true, 'Trail name is required.'],
    },
    difficulty: {
        type: String,
        required: [true, 'Difficulty level is required.'],
        enum: ['easy', 'moderate', 'hard'],
    },
    location: {
        type: String,
        required: [true, 'Location is required.'],
    },
    trailPath: {
        type: {
            type: String,
            enum: ['LineString'],
            required: true
        },
        coordinates: {
            type: [[Number]],
            required: true
        }
    },
    description: {
        type: String,
        required: [true, 'Trail description is required.'],
    },
    tag: {
        type: String,
        required: [true, 'Tag is required.'],
    },
    bookmarkedBy: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    images: [{
        type: String, // Store Cloudinary URLs
        required: false
    }],
    completedBy: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
});

const Trail = models.Trail || model('Trail', TrailSchema);

export default Trail;