import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasGoogleAPI: !!(process.env.GOOGLE_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID),
    hasBingAPI: !!process.env.BING_SEARCH_API_KEY,
    hasYouTubeAPI: !!(process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY),
  })
}