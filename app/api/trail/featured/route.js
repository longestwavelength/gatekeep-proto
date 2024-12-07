import Trail from "@models/trail";
import { connectToDB } from "@utils/database";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectToDB();

    // Fetch 3 random trails
    const featuredTrails = await Trail.aggregate([{ $sample: { size: 3 } }

    ]).then(trails => 
            Trail.populate(trails, { path: 'creator' })
        );

    return NextResponse.json(featuredTrails, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch featured trails" }, 
      { status: 500 }
    );
  }
}