import { connectToDB } from "@utils/database";
import Trail from "@models/trail";

export const POST = async (req) => {
    const { userId, name, difficulty, location, trailPath, description, tag } = await req.json();

    try {

        if (!trailPath || !trailPath.type || !trailPath.coordinates) {
            return new Response(
                JSON.stringify({ error: "Trail path is required and must include type and coordinates" }), 
                { status: 400 }
            );
        }

        await connectToDB();
        
        const newTrail = new Trail({
            creator: userId,
            name,
            difficulty,
            location,
            trailPath: {
                type: trailPath.type,
                coordinates: trailPath.coordinates
            },
            description,
            tag
        });
        
        await newTrail.save();

        return new Response(JSON.stringify(newTrail), { status: 201 })
    } catch (error) {
        console.error('Trail creation error:', error);
        
        return new Response(
            JSON.stringify({
                error: error.message || "Failed to create a new trail"
            }), 
            { status: 500 }
        );
    }
}