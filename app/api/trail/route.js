import { connectToDB } from "@utils/database";
import Trail from "@models/trail";

export const GET = async (request) => {
    try {
        await connectToDB();

        const trails = await Trail.find({}).populate('creator')

        return new Response(JSON.stringify(trails), { status: 200 })
    } catch (error) {
        return new Response("Failed to fetch the trails", { status: 500 })
    }
}