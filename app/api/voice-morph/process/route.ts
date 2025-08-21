import { NextRequest, NextResponse } from 'next/server';
import { voiceMorphRatelimit } from '@/lib/redis';
import { fal } from '@fal-ai/client';

// Configure FAL client
fal.config({
  credentials: process.env.FAL_API_KEY || ""
});


export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const identifier = "voice-morph-global";
    const { success, limit, reset, remaining } = await voiceMorphRatelimit.limit(identifier);

    if (!success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          details: `Daily limit reached. Try again tomorrow.`,
          limit,
          remaining: 0,
          reset
        },
        { status: 429 }
      );
    }

    const FAL_API_KEY = process.env.FAL_API_KEY;
    if (!FAL_API_KEY) {
      return NextResponse.json(
        { error: "Missing FAL_API_KEY in environment" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const audioFile = formData.get('audio') as File;

    if (!videoFile || !audioFile) {
      return NextResponse.json(
        { error: 'Both video and audio files are required' },
        { status: 400 }
      );
    }

    // Validate file types
    if (!videoFile.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'Invalid video file type' },
        { status: 400 }
      );
    }

    if (!audioFile.type.startsWith('audio/')) {
      return NextResponse.json(
        { error: 'Invalid audio file type' },
        { status: 400 }
      );
    }

    // Step 1: Upload files to FAL storage
    console.log('Uploading files to FAL storage...');

    const [videoUrl, audioUrl] = await Promise.all([
      fal.storage.upload(videoFile),
      fal.storage.upload(audioFile)
    ]);

    console.log('Files uploaded successfully:', { videoUrl, audioUrl });

    // Step 4: Call ChatterboxHD API
    console.log('Calling ChatterboxHD API...');

    const startTime = Date.now();

    // Prepare the input for ChatterboxHD - use uploaded audio as target voice
    const chatterboxInput: any = {
      source_audio_url: videoUrl,
      target_voice_audio_url: audioUrl,
    };

    const chatterboxRes = await fetch("https://fal.run/resemble-ai/chatterboxhd/speech-to-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${FAL_API_KEY}`,
      },
      body: JSON.stringify(chatterboxInput),
    });

    if (!chatterboxRes.ok) {
      const text = await chatterboxRes.text().catch(() => "");
      return NextResponse.json(
        { error: `ChatterboxHD error: ${chatterboxRes.status} ${text}` },
        { status: 502 }
      );
    }

    const chatterboxData = await chatterboxRes.json();
    const processedAudioUrl = chatterboxData.audio.url;
    console.log('ChatterboxHD completed:', processedAudioUrl);

    // Step 5: Merge processed audio with original video using FAL FFmpeg API
    console.log('Merging processed audio with video...');

    const mergeRes = await fetch("https://fal.run/fal-ai/ffmpeg-api/merge-audio-video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${FAL_API_KEY}`,
      },
      body: JSON.stringify({
        video_url: videoUrl,
        audio_url: processedAudioUrl,
        start_offset: 0
      }),
    });

    if (!mergeRes.ok) {
      const text = await mergeRes.text().catch(() => "");
      return NextResponse.json(
        { error: `FAL FFmpeg merge error: ${mergeRes.status} ${text}` },
        { status: 502 }
      );
    }

    const mergeData = await mergeRes.json();
    const processingTime = Date.now() - startTime;

    console.log('Voice morphing completed successfully');

    return NextResponse.json({
      videoUrl: mergeData.video.url,
      audioUrl: processedAudioUrl,
      processingTime: processingTime,
      message: 'Voice morphing completed successfully!'
    }, {
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString()
      }
    });

  } catch (error) {
    console.error('Voice morph processing error:', error);
    return NextResponse.json(
      { error: `Internal server error during processing: ${error}` },
      { status: 500 }
    );
  }
}

// Add a download endpoint for processed files
export async function GET() {
  return NextResponse.json(
    { message: 'Voice Morph API is running' },
    { status: 200 }
  );
}
