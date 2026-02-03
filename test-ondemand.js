const play = require('play-dl');
const https = require('https');
const { PassThrough } = require('stream');
const { createAudioResource } = require('@discordjs/voice');

async function testOnDemandStream() {
  try {
    console.log('Testing on-demand URL fetching...\n');
    
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    
    // Create a PassThrough stream that will fetch the real URL on first read
    const passThrough = new PassThrough();
    let hasStarted = false;
    
    const startStreaming = async () => {
      if (hasStarted) return;
      hasStarted = true;
      
      try {
        console.log('Fetching video info on first read...');
        const info = await play.video_info(url);
        const format = info.format.find(f => 
          f.mimeType && f.mimeType.includes('video') && f.url
        );
        
        const videoUrl = format.url;
        console.log('Got fresh video URL, connecting to stream...\n');
        
        // Now connect to the real stream
        https.get(videoUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        }, (response) => {
          console.log('Connected, status:', response.statusCode);
          if (response.statusCode === 200) {
            response.pipe(passThrough);
          } else {
            passThrough.destroy(new Error('HTTP ' + response.statusCode));
          }
        }).on('error', (err) => {
          passThrough.destroy(err);
        });
        
      } catch(err) {
        passThrough.destroy(err);
      }
    };
    
    // Trigger on-demand loading when first data is requested
    passThrough.once('resume', startStreaming);
    
    console.log('Creating audio resource from on-demand stream...');
    const audioResource = createAudioResource(passThrough, {
      inlineVolume: true,
    });
    
    console.log('✅ Audio resource created\n');
    
    // Trigger the stream
    passThrough.read();
    
    // Wait for data
    passThrough.on('data', (chunk) => {
      console.log('Got data chunk:', chunk.length, 'bytes');
      passThrough.destroy();
    });
    
    passThrough.on('error', (err) => {
      console.log('Stream error:', err.message);
    });
    
    setTimeout(() => {
      console.log('Timeout');
      passThrough.destroy();
    }, 10000);
    
  } catch(e) {
    console.error('Error:', e.message);
    console.error('Stack:', e.stack.split('\n').slice(0, 5).join('\n'));
  }
}

testOnDemandStream();
