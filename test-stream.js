const play = require('play-dl');
const { spawn } = require('child_process');
const { createAudioResource } = require('@discordjs/voice');

async function testStream() {
  try {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    console.log('Getting video info...');
    const info = await play.video_info(url);
    
    // Get video+audio format (has URL)
    const videoAudioFormats = info.format.filter(f => 
      f.mimeType && f.mimeType.includes('video') && f.url
    );
    
    if (videoAudioFormats.length === 0) {
      throw new Error('No video+audio formats with URLs found');
    }
    
    const bestFormat = videoAudioFormats[0];
    console.log('Using format:', bestFormat.qualityLabel);
    console.log('URL:', bestFormat.url.substring(0, 100) + '...');
    
    // Try to create audio resource using createAudioResource directly
    console.log('Creating audio resource...');
    const audioResource = createAudioResource(bestFormat.url, {
      inlineVolume: true,
    });
    
    console.log('Audio resource created successfully!');
    console.log('Metadata:', audioResource.metadata);
    
  } catch(e) {
    console.error('Error:', e.message);
    if (e.code) console.error('Code:', e.code);
    if (e.errno) console.error('Errno:', e.errno);
  }
}

testStream();
