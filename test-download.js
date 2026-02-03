const play = require('play-dl');
const fs = require('fs');

async function testPlaydlDownload() {
  try {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    console.log('Testing play-dl download()...\n');
    
    // Try download which returns a proper Readable stream
    try {
      console.log('Getting download stream...');
      const stream = await play.download(url);
      
      console.log('✅ Got stream!');
      console.log('Stream type:', stream.constructor.name);
      console.log('Is readable:', typeof stream.read === 'function');
      console.log('Has pipe:', typeof stream.pipe === 'function');
      
      // Try to read a bit
      stream.once('data', (chunk) => {
        console.log('First chunk size:', chunk.length);
        stream.destroy();
        console.log('✅ Stream is working!');
      });
      
      stream.once('error', (err) => {
        console.log('Stream error:', err.message);
      });
      
      setTimeout(() => {
        console.log('Timeout waiting for data');
      }, 5000);
      
    } catch(e) {
      console.log('❌ Failed:', e.message);
      console.log('Stack:', e.stack.split('\n').slice(0, 3).join('\n'));
    }
    
  } catch(e) {
    console.error('Error:', e.message);
  }
}

testPlaydlDownload();
