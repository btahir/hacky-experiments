import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json(
      { error: 'Filename parameter is required' },
      { status: 400 }
    );
  }

  // Since we're now using FAL storage URLs directly, we can redirect
  // to the URL that was passed in the filename parameter
  const falUrl = filename;

  if (!falUrl.startsWith('http')) {
    return NextResponse.json(
      { error: 'Invalid URL provided' },
      { status: 400 }
    );
  }

  try {
    // Redirect to the FAL storage URL
    return NextResponse.redirect(falUrl);
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'File not found or download failed' },
      { status: 404 }
    );
  }
}
