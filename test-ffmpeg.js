const play = require('play-dl');
const { spawn } = require('child_process');

async function testFFmpeg() {
  try {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    console.log('Getting video info...');
    const info = await play.video_info(url);
    
    const videoAudioFormats = info.format.filter(f => 
      f.mimeType && f.mimeType.includes('video') && f.url
    );
    
    const bestFormat = videoAudioFormats[0];
    console.log('Testing FFmpeg with URL...');
    console.log('Format URL:', bestFormat.url.substring(0, 120) + '...\n');
    
    // Try to get the first few bytes with FFmpeg to verify it works
    const ffmpeg = spawn('ffmpeg', [
      '-v', 'error',
      '-i', bestFormat.url,
      '-t', '1',
      '-f', 's16le',
      '-ar', '48000',
      '-ac', '2',
      'pipe:1'
    ]);
    
    let errorOutput = '';
    ffmpeg.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    ffmpeg.stdout.on('data', (data) => {
      console.log(`Got ${data.length} bytes of audio data`);
    });
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log('✅ FFmpeg test successful!');
      } else {
        console.log('❌ FFmpeg failed with code:', code);
        if (errorOutput) console.log('Error:', errorOutput);
      }
    });
    
    // Timeout after 5 seconds
    setTimeout(() => {
      ffmpeg.kill();
      console.log('⏱️ FFmpeg test timed out');
    }, 5000);
    
  } catch(e) {
    console.error('Error:', e.message);
  }
}

testFFmpeg();
