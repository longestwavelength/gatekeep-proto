import { connectToDB } from "@utils/database";
import Trail from "@models/trail";

export const dynamic = 'force-dynamic'

export const GET = async (request) => {
    console.log("API Route: GET request received", new Date().toISOString());
    try {
        await connectToDB();

        const trails = await Trail.find({}).populate('creator')
        console.log("API: Fetched trails", trails.length, new Date().toISOString());
        
        // Add a timestamp to the response for debugging
        const responseData = {
            timestamp: new Date().toISOString(),
            trails: trails
        };

        return new Response(JSON.stringify(responseData), { 
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        })
    } catch (error) {
        console.error("API: Error fetching trails", error, new Date().toISOString());
        return new Response(JSON.stringify({ error: "Failed to fetch the trails" }), { 
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            },
        })
    }
}

