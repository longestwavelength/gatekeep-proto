import { connectToDB } from "@utils/database";
import Trail from "@models/trail";

export const POST = async (request) => {
    try {
        await connectToDB();
        
        const { trailId, userId } = await request.json();

        // Find the trail
        const trail = await Trail.findById(trailId);

        if (!trail) {
            return new Response("Trail not found", { status: 404 });
        }

        // Check if user has already bookmarked
        const isBookmarked = trail.bookmarkedBy.includes(userId);

        if (isBookmarked) {
            // If already bookmarked, remove the bookmark
            trail.bookmarkedBy = trail.bookmarkedBy.filter(
                id => id.toString() !== userId
            );
        } else {
            // Add bookmark
            trail.bookmarkedBy.push(userId);
        }

        await trail.save();

        return new Response(JSON.stringify({
            message: isBookmarked ? "Bookmark removed" : "Trail bookmarked",
            isBookmarked: !isBookmarked
        }), { status: 200 });

    } catch (error) {
        console.error("Error bookmarking trail:", error);
        return new Response("Failed to bookmark trail", { status: 500 });
    }
};

// GET route to fetch bookmarked trails
export const GET = async (request) => {
    try {
        await connectToDB();
        
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        // Find trails bookmarked by the user
        const bookmarkedTrails = await Trail.find({ 
            bookmarkedBy: userId 
        }).populate('creator');

        return new Response(JSON.stringify(bookmarkedTrails), { status: 200 });

    } catch (error) {
        console.error("Error fetching bookmarked trails:", error);
        return new Response("Failed to fetch bookmarked trails", { status: 500 });
    }
};