/* MSC Mansion Space Creative Studio — live CMS + lead notification server */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const UPLOADS_DIR = path.join(ROOT, 'uploads');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, {recursive:true});
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, {recursive:true});

const DATA_FILE = path.join(DATA_DIR, 'site.json');
const MIME = {
  '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.webp':'image/webp', '.svg':'image/svg+xml',
  '.mp4':'video/mp4', '.webm':'video/webm', '.mov':'video/quicktime', '.txt':'text/plain; charset=utf-8', '.json':'application/json; charset=utf-8'
};

const DEFAULT_CONTENT = {
  brandName: 'MSC', brandSubtitle: 'Mansion Space Creative Studio',
  nav: {services:'Services', projects:'Projects', about:'About', process:'Process', contact:'Contact', estimate:'Get Estimate Quotation', consultation:'Book a Consultation'},
  hero: {eyebrow:'MAISON • SPACE • CREATIVE', heading:'Spaces that feel like you.', copy:'Thoughtful interiors, refined materials and timeless details — designed around the way you live.', primary:'Get Estimate Quotation', secondary:'Explore our work'},
  about: {label:'01 — THE STUDIO', kicker:'MANSION SPACE CREATIVE', heading:'We design the feeling behind the space.', p1:'MSC Mansion Space Creative Studio is an interior design studio creating sophisticated homes, workplaces and hospitality spaces with a strong sense of identity.', p2:'From the first sketch to the final styling, we bring together architecture, materials, lighting and furniture to make every corner intentional.', cta:'Talk to our designers'},
  services: {label:'02 — WHAT WE DO', heading:'One studio. Every detail.', intro:'From a single room to a complete turnkey project, our services are built to make the design journey simple and beautifully considered.', items:[
    {number:'01',title:'Full Home Interiors',description:'Complete design direction for living rooms, bedrooms, kitchens, wardrobes and every connecting space.'},
    {number:'02',title:'Modular Kitchens',description:'Elegant, practical kitchens planned around your cooking style, storage needs and aesthetic.'},
    {number:'03',title:'Custom Wardrobes',description:'Made-to-measure wardrobes, storage and TV units with precise proportions and premium finishes.'},
    {number:'04',title:'False Ceiling & Lighting',description:'Layered ceilings, profile lights and feature lighting designed to make every room feel finished.'},
    {number:'05',title:'Complete Renovation',description:'Transform an existing space with a fresh palette, lighting, finishes, furniture and artful styling.'},
    {number:'06',title:'Commercial Interiors',description:'Workspaces, studios and commercial environments designed for brand presence, comfort and performance.'}
  ]},
  statement:{quote:'Good design is not about filling a room. It is about knowing what to leave out.',small:'THE MSC APPROACH'},
  projects:{label:'03 — SELECTED WORK',heading:'Designed with intention.'},
  why:{label:'04 — WHY MSC',heading:'A studio approach with a clear point of view.',lead:'We combine creative thinking with practical execution so the final space feels considered, not complicated.',features:[
    {number:'01',title:'Personal direction',description:'Every project starts with your lifestyle, taste and aspirations.'},
    {number:'02',title:'Material intelligence',description:'Textures, grains, stone, metal and light are selected as one composition.'},
    {number:'03',title:'End-to-end execution',description:'A considered process from concept and drawings through installation and styling.'}
  ]},
  process:{label:'05 — HOW IT WORKS',heading:'A clear path to your new space.',intro:'Our process keeps the creative experience exciting while every practical detail stays organised.',steps:[
    {number:'01',title:'Discover',description:'We understand your lifestyle, requirements, budget and design direction.'},
    {number:'02',title:'Design',description:'Concepts, layouts, materials, colours and 3D visualisations bring the idea to life.'},
    {number:'03',title:'Refine',description:'We finalise details, specifications and a clear project scope together.'},
    {number:'04',title:'Create',description:'Our execution team turns the approved design into a finished space.'}
  ]},
  estimate:{label:'06 — ESTIMATE QUOTATION',heading:'Get your interior estimate in 4 steps.',copy:'Tell us about your home, choose your scope, add your approximate area and upload room or floor-plan photos. MSC will generate an indicative starting estimate.',rate:1000, highlights:['Select BHK / property','Choose your interiors','Add area & location','Upload photos & get estimate']},
  contact:{label:'07 — LET\'S CREATE',heading:'Have a space in mind?',copy:'Tell us a little about your project. Our studio will get back to you to discuss the next step.'},
  laminate:{label:'MATERIAL LIBRARY',heading:'Laminate Finishes',intro:'Browse our current laminate finish collection by name. Tap a finish to view it full size.'},
  footer:{tagline:'MAISON • SPACE • CREATIVE',closing:'Designed for spaces with soul.'}
};

const SAMPLE_PROJECTS = [
 {id:'sample1',title:'The Walnut Residence',location:'Bengaluru · 3 BHK',category:'residential',description:'Warm, layered interiors with rich timber and refined lighting.',image:'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85',videoUrl:''},
 {id:'sample2',title:'Ivory House',location:'Hyderabad · Villa',category:'residential',description:'Soft neutral architecture with timeless material contrast.',image:'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=85',videoUrl:''},
 {id:'sample3',title:'Studio 27',location:'Hyderabad · Workspace',category:'commercial',description:'A polished work environment balancing function with character.',image:'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=85',videoUrl:''},
 {id:'sample4',title:'Monument Kitchen',location:'Hyderabad · Custom Kitchen',category:'residential',description:'Contemporary cabinetry, considered storage and premium finishes.',image:'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1800&q=85',videoUrl:''}
];

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}
function makePassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return {salt, hash:hashPassword(password,salt)};
}
function verifyPassword(password, record) {
  try {
    const a=Buffer.from(hashPassword(password,record.salt),'hex');
    const b=Buffer.from(record.hash,'hex');
    return a.length===b.length && crypto.timingSafeEqual(a,b);
  } catch { return false; }
}
function defaultData(){
  const p=makePassword(process.env.ADMIN_PASSWORD || 'MSC-ADMIN-2026');
  return {version:6, admin:{name:process.env.ADMIN_NAME || 'MSC Admin', ...p}, content:DEFAULT_CONTENT, projects:SAMPLE_PROJECTS, laminates:[], leads:[], socials:{instagramUrl:'',facebookUrl:'',youtubeUrl:'',pinterestUrl:''}};
}
function readData(){
  try { if(!fs.existsSync(DATA_FILE)){const d=defaultData();fs.writeFileSync(DATA_FILE,JSON.stringify(d,null,2));return d;} return JSON.parse(fs.readFileSync(DATA_FILE,'utf8')); }
  catch(e){ console.error('Data read failed',e); return defaultData(); }
}
function writeData(d){ fs.writeFileSync(DATA_FILE,JSON.stringify(d,null,2),'utf8'); }
let data=readData();
function mergeDefaults(target, defaults){
  if(!target || typeof target!=='object') return JSON.parse(JSON.stringify(defaults));
  const out=Array.isArray(defaults)?[]:{};
  for(const k of Object.keys(defaults)) out[k]=mergeDefaults(target[k],defaults[k]);
  for(const k of Object.keys(target)) if(!(k in out)) out[k]=target[k];
  return out;
}
data.content=mergeDefaults(data.content,DEFAULT_CONTENT);
data.projects=Array.isArray(data.projects)?data.projects:SAMPLE_PROJECTS;
data.laminates=Array.isArray(data.laminates)?data.laminates:[];
data.leads=Array.isArray(data.leads)?data.leads:[];
data.socials=data.socials||{instagramUrl:'',facebookUrl:'',youtubeUrl:'',pinterestUrl:''};
writeData(data);

const sessions=new Map();
function sessionCookie(req){ const c=req.headers.cookie||''; const m=c.match(/(?:^|;\s*)msc_admin_session=([^;]+)/); return m?decodeURIComponent(m[1]):''; }
function isAuthed(req){ const token=sessionCookie(req); return !!token && sessions.has(token); }
function requireAuth(req,res){ if(isAuthed(req)) return true; send(res,401,{ok:false,error:'Admin authentication required.'}); return false; }
function setSession(res){ const token=crypto.randomBytes(32).toString('hex'); sessions.set(token,Date.now()); const secure = process.env.NODE_ENV==='production' ? '; Secure' : ''; res.setHeader('Set-Cookie',`msc_admin_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400${secure}`); }
function clearSession(req,res){ const token=sessionCookie(req); if(token) sessions.delete(token); res.setHeader('Set-Cookie','msc_admin_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'); }

function send(res,status,body,type='application/json'){ res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store'}); res.end(type.includes('json')?JSON.stringify(body):body); }
function readJson(req,maxBytes=150000){ return new Promise((resolve,reject)=>{let data='';req.on('data',c=>{data+=c;if(data.length>maxBytes){reject(new Error('Payload too large'));req.destroy();}});req.on('end',()=>{try{resolve(JSON.parse(data||'{}'));}catch(e){reject(e);}});req.on('error',reject);}); }
function safeFileName(name){ const ext=path.extname(name||'').toLowerCase(); const base=path.basename(name||'media',ext).replace(/[^a-z0-9_-]+/gi,'-').replace(/^-+|-+$/g,'').slice(0,60)||'media'; return `${Date.now()}-${Math.random().toString(36).slice(2,9)}-${base}${ext}`; }
function isAllowedMedia(name,mime){ const ext=path.extname(name||'').toLowerCase(); return ['.mp4','.webm','.mov','.jpg','.jpeg','.png','.webp'].includes(ext) && /^(video|image)\//.test(mime||''); }

async function sendWhatsApp(body){
  const sid=process.env.TWILIO_ACCOUNT_SID, token=process.env.TWILIO_AUTH_TOKEN, from=process.env.TWILIO_WHATSAPP_FROM;
  const defaults=['whatsapp:+917093328871','whatsapp:+919347498256'];
  const recipients=(process.env.OWNER_WHATSAPP_TO || defaults.join(',')).split(',').map(v=>v.trim()).filter(Boolean).map(v=>v.startsWith('whatsapp:')?v:`whatsapp:+${v.replace(/^\+/,'')}`);
  if(!sid||!token||!from||!recipients.length) return {configured:false,sentTo:0,failedTo:[]};
  const auth=Buffer.from(`${sid}:${token}`).toString('base64');
  const settled=await Promise.allSettled(recipients.map(async to=>{const params=new URLSearchParams({From:from,To:to,Body:body});const r=await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,{method:'POST',headers:{Authorization:`Basic ${auth}`,'Content-Type':'application/x-www-form-urlencoded'},body:params});if(!r.ok) throw new Error(await r.text());return to;}));
  const sentTo=settled.filter(x=>x.status==='fulfilled').length;
  const failedTo=settled.filter(x=>x.status==='rejected').map((x,i)=>recipients[i]);
  if(failedTo.length) console.error('WhatsApp notification failures:', settled.filter(x=>x.status==='rejected').map(x=>x.reason?.message||String(x.reason)));
  return {configured:true,sentTo,failedTo};
}
function leadMessage(lead){return ['🔔 New MSC website enquiry',`Source: ${lead.source||'Website'}`,`Name: ${lead.name||'-'}`,`Phone: ${lead.phone||'-'}`,lead.email?`Email: ${lead.email}`:null,lead.bhk?`BHK: ${lead.bhk}`:null,lead.property?`Property: ${lead.property}`:null,lead.city?`City: ${lead.city}`:null,lead.area?`Area: ${lead.area} sq.ft.`:null,lead.scope?`Scope: ${lead.scope}`:null,lead.finish?`Finish: ${lead.finish}`:null,lead.start?`Start: ${lead.start}`:null,lead.estimate?`Estimate: ${lead.estimate}`:null,lead.project?`Project type: ${lead.project}`:null,lead.message?`Message: ${lead.message}`:null,lead.photoCount!=null?`Photos uploaded: ${lead.photoCount}`:null,`Received: ${new Date().toLocaleString('en-IN')}`].filter(Boolean).join('\n');}

const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,`http://${req.headers.host||'localhost'}`);
  // Auth
  if(req.method==='POST' && url.pathname==='/api/admin/login'){
    try{const b=await readJson(req,20000);if(!verifyPassword(String(b.password||''),data.admin)) return send(res,401,{ok:false,error:'Incorrect password.'});setSession(res);return send(res,200,{ok:true,name:data.admin.name});}catch(e){return send(res,400,{ok:false,error:'Invalid login request.'});}
  }
  if(req.method==='POST' && url.pathname==='/api/admin/logout'){clearSession(req,res);return send(res,200,{ok:true});}
  if(req.method==='GET' && url.pathname==='/api/admin/me') return send(res,200,{ok:isAuthed(req),name:data.admin.name});

  // Public content
  if(req.method==='GET' && url.pathname==='/api/content') return send(res,200,{ok:true,content:data.content,socials:data.socials});
  if(req.method==='GET' && url.pathname==='/api/projects') return send(res,200,{ok:true,projects:data.projects});
  if(req.method==='GET' && url.pathname==='/api/laminates') return send(res,200,{ok:true,laminates:data.laminates});

  // Admin settings/content
  if(req.method==='POST' && url.pathname==='/api/content'){ if(!requireAuth(req,res)) return; try{const b=await readJson(req,200000);data.content=mergeDefaults(b.content||data.content,DEFAULT_CONTENT);data.socials=b.socials||data.socials;writeData(data);return send(res,200,{ok:true});}catch(e){return send(res,400,{ok:false,error:'Could not save website content.'});}}
  if(req.method==='POST' && url.pathname==='/api/admin/settings'){ if(!requireAuth(req,res)) return; try{const b=await readJson(req,30000);if(b.name) data.admin.name=String(b.name).trim().slice(0,80);if(b.newPassword){if(String(b.newPassword).length<8)return send(res,400,{ok:false,error:'Password must be at least 8 characters.'});const p=makePassword(String(b.newPassword));data.admin.salt=p.salt;data.admin.hash=p.hash;}writeData(data);return send(res,200,{ok:true,name:data.admin.name});}catch(e){return send(res,400,{ok:false,error:'Could not save admin settings.'});}}

  // Project CRUD
  if(req.method==='POST' && url.pathname==='/api/projects'){if(!requireAuth(req,res)) return;try{const b=await readJson(req,100000);if(!b.title||!b.image)return send(res,400,{ok:false,error:'Project title and image are required.'});const p={id:b.id||crypto.randomUUID(),title:String(b.title),location:String(b.location||''),category:String(b.category||'residential'),description:String(b.description||''),image:String(b.image),videoUrl:String(b.videoUrl||'')};data.projects.unshift(p);writeData(data);return send(res,200,{ok:true,project:p});}catch(e){return send(res,400,{ok:false,error:'Could not add project.'});}}
  if(/^\/api\/projects\//.test(url.pathname) && req.method==='PUT'){if(!requireAuth(req,res)) return;try{const id=decodeURIComponent(url.pathname.split('/').pop());const idx=data.projects.findIndex(p=>p.id===id);if(idx<0)return send(res,404,{ok:false,error:'Project not found.'});const b=await readJson(req,100000);data.projects[idx]={...data.projects[idx],...b,id};writeData(data);return send(res,200,{ok:true,project:data.projects[idx]});}catch(e){return send(res,400,{ok:false,error:'Could not update project.'});}}
  if(/^\/api\/projects\//.test(url.pathname) && req.method==='DELETE'){if(!requireAuth(req,res)) return;const id=decodeURIComponent(url.pathname.split('/').pop());const idx=data.projects.findIndex(p=>p.id===id);if(idx<0)return send(res,404,{ok:false,error:'Project not found.'});const p=data.projects[idx];data.projects.splice(idx,1);writeData(data);if(p.image&&p.image.startsWith('/uploads/')) try{fs.unlinkSync(path.join(UPLOADS_DIR,path.basename(p.image)))}catch{} if(p.videoUrl&&p.videoUrl.startsWith('/uploads/')) try{fs.unlinkSync(path.join(UPLOADS_DIR,path.basename(p.videoUrl)))}catch{} return send(res,200,{ok:true});}

  // Laminate CRUD
  if(req.method==='POST' && url.pathname==='/api/laminates'){if(!requireAuth(req,res)) return;try{const b=await readJson(req,50000);if(!b.name||!b.image)return send(res,400,{ok:false,error:'Laminate name and image are required.'});const item={id:crypto.randomUUID(),name:String(b.name).slice(0,120),image:String(b.image)};data.laminates.unshift(item);writeData(data);return send(res,200,{ok:true,laminate:item});}catch(e){return send(res,400,{ok:false,error:'Could not add laminate finish.'});}}
  if(/^\/api\/laminates\//.test(url.pathname) && req.method==='PUT'){if(!requireAuth(req,res)) return;try{const id=decodeURIComponent(url.pathname.split('/').pop());const idx=data.laminates.findIndex(p=>p.id===id);if(idx<0)return send(res,404,{ok:false,error:'Laminate not found.'});const b=await readJson(req,50000);data.laminates[idx]={...data.laminates[idx],name:String(b.name||data.laminates[idx].name).slice(0,120),image:String(b.image||data.laminates[idx].image),id};writeData(data);return send(res,200,{ok:true,laminate:data.laminates[idx]});}catch(e){return send(res,400,{ok:false,error:'Could not update laminate.'});}}
  if(/^\/api\/laminates\//.test(url.pathname) && req.method==='DELETE'){if(!requireAuth(req,res)) return;const id=decodeURIComponent(url.pathname.split('/').pop());const idx=data.laminates.findIndex(p=>p.id===id);if(idx<0)return send(res,404,{ok:false,error:'Laminate not found.'});const item=data.laminates[idx];data.laminates.splice(idx,1);writeData(data);if(item.image&&item.image.startsWith('/uploads/'))try{fs.unlinkSync(path.join(UPLOADS_DIR,path.basename(item.image)))}catch{} return send(res,200,{ok:true});}

  // Protected media upload/delete
  if(req.method==='POST' && url.pathname==='/api/media'){if(!requireAuth(req,res)) return;try{const b=await readJson(req,35*1024*1024);if(!b.filename||!b.data||!b.mime)return send(res,400,{ok:false,error:'Media filename, mime and data are required.'});if(!isAllowedMedia(b.filename,b.mime))return send(res,400,{ok:false,error:'Only JPG, PNG, WEBP, MP4, WEBM and MOV are supported.'});const match=String(b.data).match(/^data:([^;]+);base64,(.+)$/s);if(!match||match[1]!==b.mime)return send(res,400,{ok:false,error:'Invalid media payload.'});const buffer=Buffer.from(match[2],'base64');if(buffer.length>25*1024*1024)return send(res,413,{ok:false,error:'Media is too large. Maximum is 25 MB.'});const filename=safeFileName(b.filename);fs.writeFileSync(path.join(UPLOADS_DIR,filename),buffer);return send(res,200,{ok:true,url:`/uploads/${filename}`,filename});}catch(e){console.error(e);return send(res,500,{ok:false,error:'Could not upload media.'});}}
  if(req.method==='DELETE' && url.pathname==='/api/media'){if(!requireAuth(req,res)) return;const raw=url.searchParams.get('file')||'';const filename=path.basename(raw);if(!filename||filename!==raw)return send(res,400,{ok:false,error:'Invalid media file.'});try{if(fs.existsSync(path.join(UPLOADS_DIR,filename)))fs.unlinkSync(path.join(UPLOADS_DIR,filename));return send(res,200,{ok:true});}catch(e){return send(res,500,{ok:false,error:'Could not delete media.'});}}

  // Public lead notifications + persistent lead inbox
  if(req.method==='POST' && url.pathname==='/api/lead'){try{
    const lead=await readJson(req,200000);
    if(!lead.name||!lead.phone)return send(res,400,{ok:false,error:'Name and phone are required.'});
    const record={...lead,id:crypto.randomUUID(),status:'New',createdAt:new Date().toISOString()};
    data.leads.unshift(record);
    writeData(data);
    let result={configured:false,sentTo:0,failedTo:[]};
    try{ result=await sendWhatsApp(leadMessage(record)); }catch(err){ console.error('WhatsApp send failed:',err); }
    record.notification={configured:result.configured,sentTo:result.sentTo,failedTo:result.failedTo||[],updatedAt:new Date().toISOString()};
    writeData(data);
    return send(res,200,{ok:true,saved:true,notified:result.sentTo>0,notificationConfigured:result.configured,sentTo:result.sentTo,leadId:record.id});
  }catch(e){console.error(e);return send(res,500,{ok:false,error:'Could not save the enquiry.'});}}

  if(req.method==='GET' && url.pathname==='/api/leads'){if(!requireAuth(req,res)) return;return send(res,200,{ok:true,leads:data.leads||[]});}
  if(/^\/api\/leads\//.test(url.pathname) && req.method==='PUT'){if(!requireAuth(req,res)) return;try{const id=decodeURIComponent(url.pathname.split('/').pop());const idx=data.leads.findIndex(x=>x.id===id);if(idx<0)return send(res,404,{ok:false,error:'Lead not found.'});const b=await readJson(req,20000);data.leads[idx]={...data.leads[idx],status:String(b.status||data.leads[idx].status||'New')};writeData(data);return send(res,200,{ok:true,lead:data.leads[idx]});}catch(e){return send(res,400,{ok:false,error:'Could not update lead.'});}}
  if(/^\/api\/leads\//.test(url.pathname) && req.method==='DELETE'){if(!requireAuth(req,res)) return;const id=decodeURIComponent(url.pathname.split('/').pop());const idx=data.leads.findIndex(x=>x.id===id);if(idx<0)return send(res,404,{ok:false,error:'Lead not found.'});data.leads.splice(idx,1);writeData(data);return send(res,200,{ok:true});}

  let filePath=path.join(ROOT,url.pathname==='/'?'index.html':url.pathname);
  if(!filePath.startsWith(ROOT))return send(res,403,{ok:false});
  try{const stat=fs.statSync(filePath);if(stat.isDirectory())filePath=path.join(filePath,'index.html');const ext=path.extname(filePath).toLowerCase();res.writeHead(200,{'Content-Type':MIME[ext]||'application/octet-stream'});fs.createReadStream(filePath).pipe(res);}catch(e){send(res,404,{ok:false,error:'Not found'});}
});
server.listen(PORT,()=>console.log(`MSC website running at http://localhost:${PORT}`));
