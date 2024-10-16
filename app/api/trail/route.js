import { connectToDB } from "@utils/database";
import Trail from "@models/trail";

export const GET = async (request) => {
    try {
        await connectToDB();

        // Add a cache-busting query parameter
        const { searchParams } = new URL(request.url);
        const timestamp = searchParams.get('t');

        // Fetch trails and sort by creation date in descending order
        const trails = await Trail.find({})
            .sort({ createdAt: -1 })
            .populate('creator');

        // Add a custom header to indicate when the data was fetched
        const headers = new Headers();
        headers.append('X-Data-Timestamp', new Date().toISOString());

        return new Response(JSON.stringify(trails), { 
            status: 200, 
            headers 
        });
    } catch (error) {
        console.error("Error fetching trails:", error);
        return new Response("Failed to fetch the trails", { status: 500 });
    }
}