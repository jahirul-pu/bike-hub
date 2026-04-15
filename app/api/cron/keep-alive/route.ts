import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  
  // Basic security check using an environment variable
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Perform a simple query to keep the connection active
    // This counts as activity for Supabase
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({ 
      success: true, 
      message: "Database pinged successfully",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Keep-alive error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to ping database" 
    }, { status: 500 });
  }
}
