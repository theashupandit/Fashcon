const fs = require('fs');
const path = require('path');

async function testApi() {
  try {
    console.log("Preparing file and FormData...");
    // Create a dummy file buffer
    const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    
    // Web API FormData is native in Node 18+
    const formData = new FormData();
    // Blob needs to be wrapped in a File or sent directly
    const blob = new Blob([dummyPng], { type: 'image/png' });
    formData.append('file', blob, 'test_image.png');
    formData.append('folderName', 'test');
    formData.append('folderPath', 'products/test-slug/main');

    console.log("Sending POST request to http://localhost:3001/api/media/upload ...");
    const response = await fetch('http://localhost:3001/api/media/upload', {
      method: 'POST',
      body: formData
    });

    console.log("Response Status:", response.status);
    const bodyText = await response.text();
    console.log("Response Body:", bodyText);
    
    process.exit(0);
  } catch (error) {
    console.error("Fetch error:", error);
    process.exit(1);
  }
}

// Wait 2 seconds for server to compile / be ready, then run
setTimeout(testApi, 2000);
