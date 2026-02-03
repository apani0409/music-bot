const play = require('play-dl');

async function debugStreamCall() {
  try {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    console.log('Getting video info...');
    const info = await play.video_info(url);
    
    console.log('\ninfo object keys:', Object.keys(info).sort());
    console.log('\ninfo.format length:', info.format.length);
    console.log('\nFirst format keys:');
    if (info.format[0]) {
      console.log(Object.keys(info.format[0]).sort());
    }
    
    // Try calling stream_from_info directly
    console.log('\n\nTrying stream_from_info with full info object...');
    try {
      const result = await play.stream_from_info(info);
      console.log('✅ Success!');
      console.log('Result keys:', Object.keys(result).sort());
      console.log('Result.stream:', result.stream?.constructor.name);
    } catch(e) {
      console.log('❌ Error:', e.message);
      console.log('Full error:', e);
    }
    
  } catch(e) {
    console.error('Error:', e.message);
  }
}

debugStreamCall();
