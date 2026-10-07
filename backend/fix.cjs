const fs = require('fs');
const files = [
  'src/billing/billing.service.ts',
  'src/inventory/inventory.service.ts',
  'src/pos/pos.service.ts',
  'src/realtime/realtime.module.ts',
  'src/realtime/websocket/realtime/websocket.gateway.ts',
  'src/stays/stays.service.ts',
  'src/super-admin/super-admin.service.ts'
];
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/\\`/g, '`');
  c = c.replace(/\\\$\{/g, '${');
  c = c.replace(/Realtime\\websocketGateway/g, 'RealtimeWebsocketGateway');
  fs.writeFileSync(f, c);
  console.log('Fixed', f);
});
