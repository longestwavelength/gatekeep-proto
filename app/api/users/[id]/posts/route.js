import { connectToDB } from "@utils/database";
import Trail from "@models/trail";

export async function GET(request, { params }) {
    try {
        await connectToDB();

        const trails = await Trail.find({
            creator: params.id
        }).populate('creator')

        return new Response(JSON.stringify(trails), { status: 200 })
    } catch (error) {
        return new Response("Failed to fetch all trails", { status: 500 })
    }
}