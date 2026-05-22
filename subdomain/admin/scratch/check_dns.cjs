const dns = require('dns');

console.log("Resolving fashcon.13rzcve.mongodb.net...");
dns.resolveTxt('fashcon.13rzcve.mongodb.net', (err, txt) => {
  if (err) {
    console.error("TXT resolution error:", err);
  } else {
    console.log("TXT records:", txt);
  }
});

dns.resolveSrv('_mongodb._tcp.fashcon.13rzcve.mongodb.net', (err, srv) => {
  if (err) {
    console.error("SRV resolution error:", err);
  } else {
    console.log("SRV records:", srv);
    srv.forEach(record => {
      dns.lookup(record.name, (err, address) => {
        if (err) {
          console.error(`Lookup error for ${record.name}:`, err);
        } else {
          console.log(`IP address for ${record.name}:`, address);
        }
      });
    });
  }
});
