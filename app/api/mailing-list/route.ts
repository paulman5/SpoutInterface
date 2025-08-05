import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const MAILING_LIST_PATH = path.resolve(process.cwd(), "public", "mailing-list.json")

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 })
    }
    // Load or create the JSON file
    let emails: string[] = []
    try {
      const data = await fs.readFile(MAILING_LIST_PATH, "utf-8")
      emails = JSON.parse(data)
    } catch (e) {
      // File does not exist, will create
      emails = []
    }
    // Ensure uniqueness
    if (emails.includes(email)) {
      return NextResponse.json({ message: "Already joined!" }, { status: 200 })
    }
    emails.push(email)
    await fs.writeFile(MAILING_LIST_PATH, JSON.stringify(emails, null, 2))
    return NextResponse.json(
      { message: "Thank you for joining our mailing list!" },
      { status: 200 }
    )
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
