import { connectToDB } from "@utils/database";
import Trail from "@models/trail";

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
    const { name, difficulty, location, trailPath, description, tag } = await request.json();

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

        const deletedTrail = await Trail.findByIdAndDelete(params.id);
        
        if (!deletedTrail) {
            return new Response("Trail not found", { status: 404 });
        }

        return new Response("Trail deleted successfully", { status: 200 });
    } catch (error) {
        console.error("Error deleting trail:", error);
        return new Response("Failed to delete Trail", { status: 500 });
    }
};