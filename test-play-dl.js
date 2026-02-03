const play = require('play-dl');

async function test() {
  try {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    console.log('Testing play.video_info()...');
    const info = await play.video_info(url);
    
    console.log('\nTitle:', info.video_details.title);
    console.log('Total formats:', info.format.length);
    
    // Check all format types
    const audioOnly = info.format.filter(f => f.mimeType && f.mimeType.includes('audio'));
    const videoAudio = info.format.filter(f => f.mimeType && f.mimeType.includes('video'));
    console.log('Audio-only formats:', audioOnly.length);
    console.log('Video+Audio formats:', videoAudio.length);
    
    // Check which ones have URLs
    const withUrls = info.format.filter(f => f.url);
    console.log('Formats with URLs:', withUrls.length);
    
    if (audioOnly.length > 0) {
      console.log('\nFirst audio-only format:');
      const f = audioOnly[0];
      console.log('- audioQuality:', f.audioQuality);
      console.log('- mimeType:', f.mimeType);
      console.log('- has url:', !!f.url);
      if (f.url) {
        console.log('- url preview:', f.url.substring(0, 120) + '...');
      }
    }
    
    if (videoAudio.length > 0) {
      console.log('\nFirst video+audio format:');
      const f = videoAudio[0];
      console.log('- qualityLabel:', f.qualityLabel);
      console.log('- mimeType:', f.mimeType);
      console.log('- has url:', !!f.url);
      if (f.url) {
        console.log('- url preview:', f.url.substring(0, 120) + '...');
      }
    }
  } catch(e) {
    console.error('Error:', e.message);
    console.error('Stack:', e.stack);
  }
}

test();
