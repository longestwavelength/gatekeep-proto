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

    // check if user has already added trail to completed
    const isCompleted = trail.completedBy.includes(userId);

    if(isCompleted) {
      trail.completedBy = trail.completedBy.filter(
        id => id.toString() !== userId
      );
    } else {
      trail.completedBy.push(userId);
    }

    await trail.save();

    return new Response(JSON.stringify({
      message: isCompleted ? "Trail removed from Completed" : "Trail added to Completed",
      isCompleted: !isCompleted
  }), { status: 200 });

  } catch (error) {
    console.error("Error updating trail completion:", error);
    return new Response("Failed to add trail to Completed", { status: 500 });
  }
};

export const GET = async (request) => {

  try {
    await connectToDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const completedTrails = await Trail.find({ 
      completedBy: userId }).populate('creator');

      return new Response(JSON.stringify(completedTrails), { status: 200 });

  } catch (error) {
        console.error("Error fetching Completed trails:", error);
        return new Response("Failed to fetch Completed trails", { status: 500 });
    }
};