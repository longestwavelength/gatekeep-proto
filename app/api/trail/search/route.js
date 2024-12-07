import Trail from "@models/trail";
import { connectToDB } from "@utils/database";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectToDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    // Create a case-insensitive search across multiple fields
    const searchResults = await Trail.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
        { tag: { $regex: query, $options: 'i' } },
        { 'creator.username': { $regex: query, $options: 'i' } }
      ]
    }).populate('creator').limit(10); // Limit to 10 results to prevent overwhelming the UI

    return NextResponse.json(searchResults, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to search trails" }, 
      { status: 500 }
    );
  }
}