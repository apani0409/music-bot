const play = require('play-dl');

async function testFreshTokens() {
  try {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    
    console.log('Getting video info first time...');
    const info1 = await play.video_info(url);
    const format1 = info1.format.find(f => f.mimeType && f.mimeType.includes('video') && f.url);
    console.log('Token 1 expires:', new Date(parseInt(format1.url.match(/expire=(\d+)/)[1]) * 1000).toLocaleTimeString());
    console.log('URL 1:', format1.url.substring(0, 100) + '...\n');
    
    // Wait 2 seconds
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('Getting video info second time...');
    const info2 = await play.video_info(url);
    const format2 = info2.format.find(f => f.mimeType && f.mimeType.includes('video') && f.url);
    console.log('Token 2 expires:', new Date(parseInt(format2.url.match(/expire=(\d+)/)[1]) * 1000).toLocaleTimeString());
    console.log('URL 2:', format2.url.substring(0, 100) + '...\n');
    
    // Check if URLs are different
    if (format1.url === format2.url) {
      console.log('⚠️ Tokens are IDENTICAL (same cached URL)');
    } else {
      console.log('✅ Tokens are DIFFERENT (fresh retrieval)');
    }
    
  } catch(e) {
    console.error('Error:', e.message);
  }
}

testFreshTokens();
