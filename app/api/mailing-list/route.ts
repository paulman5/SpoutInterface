import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 })
    }

    // Mailing list functionality temporarily disabled
    // TODO: Re-enable when email service is set up
    console.log("Mailing list signup received (disabled):", email)
    
    return NextResponse.json(
      { message: "Thank you for joining our mailing list!" },
      { status: 200 }
    )
  } catch (e) {
    console.error("Mailing list error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
