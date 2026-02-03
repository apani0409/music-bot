const https = require('https');
const { createAudioResource } = require('@discordjs/voice');
const play = require('play-dl');

async function testWithHeaders() {
  try {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    console.log('Getting video info...');
    const info = await play.video_info(url);
    
    const videoAudioFormats = info.format.filter(f => 
      f.mimeType && f.mimeType.includes('video') && f.url
    );
    
    const googleUrl = videoAudioFormats[0].url;
    console.log('Got format URL\n');
    
    // Create a readable stream that adds required headers
    console.log('Creating HTTP stream with headers...');
    const stream = https.get(googleUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124'
      }
    }, (response) => {
      console.log('Response status:', response.statusCode);
      console.log('Content-type:', response.headers['content-type']);
      
      if (response.statusCode === 200) {
        console.log('\n✅ HTTP stream created successfully!');
        console.log('Creating audio resource...');
        
        try {
          // Pass the response stream directly
          const audioResource = createAudioResource(response, {
            inlineVolume: true,
          });
          console.log('✅ Audio resource created!');
          
          // Try to read first chunk
          response.once('data', (chunk) => {
            console.log('Got first data chunk:', chunk.length, 'bytes');
            response.destroy();
          });
          
        } catch(e) {
          console.log('Error creating audio resource:', e.message);
          response.destroy();
        }
      } else {
        console.log('❌ HTTP error:', response.statusCode);
      }
    });
    
    stream.on('error', (e) => {
      console.log('❌ HTTPS error:', e.message);
    });
    
    setTimeout(() => {
      console.log('Timeout');
    }, 5000);
    
  } catch(e) {
    console.error('Error:', e.message);
  }
}

testWithHeaders();
