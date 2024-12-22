import { connectToDB } from "@utils/database";
import Trail from "@models/trail";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//GET (read)

export const GET = async (request, { params }) => {
    try {
        await connectToDB()
        const trail = await Trail.findById(params.id).populate('creator')
        if(!trail) return new Response('Trail Not Found', { status: 404 })

        return new Response(JSON.stringify(trail), {status: 200})
    } catch (error) {
        return new Response("Failed to fetch all trails at this time", { status: 500 })
    }
}

//PATCH (update)
export const PATCH = async (request, { params }) => {
    const { name, difficulty, location, trailPath, description, tag, images } = await request.json();

    try {
        await connectToDB();

        // Find the existing trail by ID
        const existingTrail = await Trail.findById(params.id);

        if (!existingTrail) {
            return new Response("Trail not found", { status: 404 });
        }

        // Update the trail with new data
        existingTrail.name = name;
        existingTrail.difficulty = difficulty;
        existingTrail.location = location;
        existingTrail.trailPath = trailPath;
        existingTrail.description = description;
        existingTrail.tag = tag;
        existingTrail.images = images;

        await existingTrail.save();

        return new Response("Successfully updated the Trail", { status: 200 });
    } catch (error) {
        return new Response("Error Updating Trail", { status: 500 });
    }
};

//DELETE

export const DELETE = async (request, { params }) => {
    try {
        await connectToDB();

        // Find the trail first to get the image URLs
        const trail = await Trail.findById(params.id);
        
        if (!trail) {
            return new Response("Trail not found", { status: 404 });
        }

        // Delete images from Cloudinary if they exist
        if (trail.images && trail.images.length > 0) {
            for (const imageUrl of trail.images) {
                // Extract public_id from the URL
                const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0];
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (cloudinaryError) {
                    console.error("Error deleting image from Cloudinary:", cloudinaryError);
                }
            }
        }

        // Delete the trail from database
        await Trail.findByIdAndDelete(params.id);

        return new Response("Trail and associated images deleted successfully", { status: 200 });
    } catch (error) {
        console.error("Error deleting trail:", error);
        return new Response("Failed to delete Trail", { status: 500 });
    }
};