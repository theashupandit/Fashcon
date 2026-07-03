async function test() {
  try {
    for (const scope of ['storefront', 'admin']) {
      const res = await fetch(`http://localhost:3001/api/sitemap?allUrls=true&scope=${scope}`);
      console.log(`--- Scope: ${scope} ---`);
      console.log('Status Code:', res.status);
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        console.log('Success:', json.success);
        console.log('Links Count:', json.links?.length);
        console.log('First 3 links:', json.links?.slice(0, 3));
      } catch (e) {
        console.log('Body is not JSON. Body snippet:', text.slice(0, 500));
      }
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

test();
