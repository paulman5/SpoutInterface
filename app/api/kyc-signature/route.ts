import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userAddress, onchainIDAddress, claimData, topic, countryCode } =
      body

    // Validate required fields
    if (
      !userAddress ||
      !onchainIDAddress ||
      !claimData ||
      !topic ||
      !countryCode
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Call the external API
    const response = await fetch(
      "https://rwa-deploy-backend.onrender.com/user/kyc-signature",
      {
        method: "POST",
      headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.BACKEND_API_KEY ?? "",
      },
      body: JSON.stringify({
        userAddress,
        onchainIDAddress,
        claimData,
        topic,
          countryCode,
      }),
      }
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error("External API error:", errorData)
      return NextResponse.json(
        { error: "Failed to get KYC signature from external API" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("KYC signature API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 
