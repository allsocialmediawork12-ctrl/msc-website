/*
  MSC private lead-notification server
  -----------------------------------
  Serves the static MSC site and accepts POST /api/lead.

  Required environment variables for automatic owner WhatsApp alerts:
    PORT=3000
    TWILIO_ACCOUNT_SID=...
    TWILIO_AUTH_TOKEN=...
    TWILIO_WHATSAPP_FROM=whatsapp:+14155238886   (or your approved WhatsApp sender)
    OWNER_WHATSAPP_TO=whatsapp:+91XXXXXXXXXX

  IMPORTANT: keep this file on the server. Never put the Twilio credentials or
  OWNER_WHATSAPP_TO in public JavaScript.
*/

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const MIME = {
  '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8', '.jpg':'image/jpeg', '.jpeg':'image/jpeg',
  '.png':'image/png', '.webp':'image/webp', '.svg':'image/svg+xml', '.txt':'text/plain; charset=utf-8'
};

function send(res, status, body, type='application/json') {
  res.writeHead(status, {'Content-Type': type, 'Cache-Control':'no-store'});
  res.end(type.includes('json') ? JSON.stringify(body) : body);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data='';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 100000) { reject(new Error('Payload too large')); req.destroy(); }
    });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch(e) { reject(e); } });
    req.on('error', reject);
  });
}

async function sendWhatsApp(body) {
  const sid=process.env.TWILIO_ACCOUNT_SID;
  const token=process.env.TWILIO_AUTH_TOKEN;
  const from=process.env.TWILIO_WHATSAPP_FROM;
  const to=process.env.OWNER_WHATSAPP_TO;
  if (!sid || !token || !from || !to) return {configured:false};

  const params = new URLSearchParams({
    From: from,
    To: to,
    Body: body
  });
  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method:'POST',
    headers:{'Authorization':`Basic ${auth}`,'Content-Type':'application/x-www-form-urlencoded'},
    body:params
  });
  if (!response.ok) {
    const detail=await response.text();
    throw new Error(`WhatsApp notification failed: ${detail}`);
  }
  return {configured:true};
}

function leadMessage(lead) {
  return [
    '🔔 New MSC website enquiry',
    `Source: ${lead.source || 'Website'}`,
    `Name: ${lead.name || '-'}`,
    `Phone: ${lead.phone || '-'}`,
    lead.email ? `Email: ${lead.email}` : null,
    lead.bhk ? `BHK: ${lead.bhk}` : null,
    lead.property ? `Property: ${lead.property}` : null,
    lead.city ? `City: ${lead.city}` : null,
    lead.area ? `Area: ${lead.area} sq.ft.` : null,
    lead.scope ? `Scope: ${lead.scope}` : null,
    lead.finish ? `Finish: ${lead.finish}` : null,
    lead.start ? `Start: ${lead.start}` : null,
    lead.estimate ? `Indicative estimate: ${lead.estimate}` : null,
    lead.project ? `Project type: ${lead.project}` : null,
    lead.message ? `Message: ${lead.message}` : null,
    lead.photoCount != null ? `Photos uploaded: ${lead.photoCount}` : null,
    lead.photoNames?.length ? `Photo files: ${lead.photoNames.join(', ')}` : null,
    `Received: ${new Date().toLocaleString('en-IN')}`
  ].filter(Boolean).join('\n');
}

const server=http.createServer(async (req,res)=>{
  const url=new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if(req.method==='POST' && url.pathname==='/api/lead'){
    try{
      const lead=await readJson(req);
      if(!lead.name || !lead.phone){ return send(res,400,{ok:false,error:'Name and phone are required.'}); }
      const result=await sendWhatsApp(leadMessage(lead));
      if(!result.configured) return send(res,503,{ok:false,error:'WhatsApp notification is not configured on the server yet.'});
      return send(res,200,{ok:true});
    }catch(err){
      console.error(err);
      return send(res,500,{ok:false,error:'Could not process the enquiry.'});
    }
  }

  let filePath=path.join(ROOT, url.pathname==='/'?'index.html':url.pathname);
  if(!filePath.startsWith(ROOT)) return send(res,403,{ok:false});
  try{
    const stat=fs.statSync(filePath);
    if(stat.isDirectory()) filePath=path.join(filePath,'index.html');
    const ext=path.extname(filePath).toLowerCase();
    res.writeHead(200,{'Content-Type':MIME[ext] || 'application/octet-stream'});
    fs.createReadStream(filePath).pipe(res);
  }catch(e){ send(res,404,{ok:false,error:'Not found'}); }
});

server.listen(PORT,()=>console.log(`MSC website running at http://localhost:${PORT}`));
