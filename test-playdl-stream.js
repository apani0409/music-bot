const play = require('play-dl');

async function testPlaydlStream() {
  try {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    console.log('Testing play-dl stream() with various options...\n');
    
    // Try different stream approaches
    
    // Approach 1: Direct stream() with no options
    try {
      console.log('Trying: play.stream(url)');
      const stream1 = await play.stream(url);
      console.log('✅ Success! stream type:', stream1.stream?.constructor.name);
    } catch(e) {
      console.log('❌ Failed:', e.message.substring(0, 100));
    }
    
    // Approach 2: stream with discord option
    try {
      console.log('\nTrying: play.stream(url, { discordPlayerCompatibility: true })');
      const stream2 = await play.stream(url, { discordPlayerCompatibility: true });
      console.log('✅ Success! stream type:', stream2.stream?.constructor.name);
    } catch(e) {
      console.log('❌ Failed:', e.message.substring(0, 100));
    }
    
    // Approach 3: Check stream_from_info
    try {
      console.log('\nTrying: play.stream_from_info(video_info)');
      const info = await play.video_info(url);
      const stream3 = await play.stream_from_info(info);
      console.log('✅ Success! stream type:', stream3.stream?.constructor.name);
    } catch(e) {
      console.log('❌ Failed:', e.message.substring(0, 100));
    }
    
  } catch(e) {
    console.error('Error:', e.message);
  }
}

testPlaydlStream();
