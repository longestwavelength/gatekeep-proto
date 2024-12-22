import { connectToDB } from "@utils/database";
import Trail from "@models/trail";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const DELETE = async (request, { params }) => {
    try {
        const { imageUrl } = await request.json();
        await connectToDB();

        // Find the trail
        const trail = await Trail.findById(params.id);
        if (!trail) {
            return new Response("Trail not found", { status: 404 });
        }

        // Remove image from Cloudinary
        const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy(publicId);

        // Update trail's images array
        trail.images = trail.images.filter(img => img !== imageUrl);
        await trail.save();

        return new Response("Image deleted successfully", { status: 200 });
    } catch (error) {
        console.error("Error deleting image:", error);
        return new Response("Failed to delete image", { status: 500 });
    }
};
