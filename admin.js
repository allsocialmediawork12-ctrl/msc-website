const ADMIN_PASSWORD = 'MSC-ADMIN-2026'; // Change this before publishing.
const TEXT_KEY = 'mscOwnerTextV1';
const PROJECT_KEY = 'mscOwnerProjectsV1';
const SOCIAL_KEY = 'mscOwnerSocialV1';

const $ = id => document.getElementById(id);
const loginScreen = $('loginScreen');
const panel = $('panel');
const loginStatus = $('loginStatus');

function showPanel(){ loginScreen.classList.add('hidden'); panel.classList.remove('hidden'); loadText(); loadProjects(); loadSocials(); }
$('loginBtn').addEventListener('click', () => {
  if ($('adminPassword').value === ADMIN_PASSWORD) { sessionStorage.setItem('mscOwnerUnlocked','1'); showPanel(); }
  else { loginStatus.classList.add('show'); }
});
$('adminPassword').addEventListener('keydown', e => { if(e.key === 'Enter') $('loginBtn').click(); });
$('logoutBtn').addEventListener('click', () => { sessionStorage.removeItem('mscOwnerUnlocked'); location.reload(); });
if(sessionStorage.getItem('mscOwnerUnlocked') === '1') showPanel();

const defaults = {
  heroEyebrow:'MAISON • SPACE • CREATIVE',
  heroHeading:'Spaces that feel like you.',
  heroCopy:'Thoughtful interiors, refined materials and timeless details — designed around the way you live.',
  aboutP1:'MSC Mansion Space Creative Studio is an interior design studio creating sophisticated homes, workplaces and hospitality spaces with a strong sense of identity.',
  aboutP2:'From the first sketch to the final styling, we bring together architecture, materials, lighting and furniture to make every corner intentional.'
};
function loadText(){
  const data = {...defaults, ...(JSON.parse(localStorage.getItem(TEXT_KEY) || '{}'))};
  Object.entries(data).forEach(([k,v]) => $(k).value=v);
}
$('saveText').addEventListener('click', () => {
  const data = {};
  ['heroEyebrow','heroHeading','heroCopy','aboutP1','aboutP2'].forEach(k => data[k]=$(k).value.trim());
  localStorage.setItem(TEXT_KEY, JSON.stringify(data)); alert('Website text saved. Open the website in this same browser to preview it.');
});
$('resetText').addEventListener('click', () => { localStorage.removeItem(TEXT_KEY); loadText(); });

const sampleProjects = [
 {id:'sample1',title:'The Walnut Residence',location:'Bengaluru · 3 BHK',category:'residential',image:'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85'},
 {id:'sample2',title:'Ivory House',location:'Hyderabad · Villa',category:'residential',image:'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=85'},
 {id:'sample3',title:'Studio 27',location:'Hyderabad · Workspace',category:'commercial',image:'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=85'},
 {id:'sample4',title:'Monument Kitchen',location:'Hyderabad · Custom Kitchen',category:'residential',image:'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1800&q=85'}
];
let projects = [];
function loadProjects(){ projects = JSON.parse(localStorage.getItem(PROJECT_KEY) || 'null') || sampleProjects.map(p=>({...p})); renderProjects(); }
function renderProjects(){
  const list=$('projectList'); list.innerHTML='';
  projects.forEach((p,i)=>{
    const row=document.createElement('div'); row.className='admin-project';
    row.innerHTML=`<img src="${p.image}" alt=""><div class="meta"><strong>Project ${i+1}</strong><input data-k="title" value="${escapeHtml(p.title)}" placeholder="Project title"><input data-k="location" value="${escapeHtml(p.location)}" placeholder="City · Type"><select data-k="category"><option value="residential" ${p.category==='residential'?'selected':''}>Residential</option><option value="commercial" ${p.category==='commercial'?'selected':''}>Commercial</option></select></div><div class="admin-actions"><label class="admin-btn light">Replace image<input class="replace-image" type="file" accept="image/*" hidden></label><button class="admin-btn danger delete-project">Delete</button></div>`;
    row.querySelectorAll('[data-k]').forEach(el=>el.addEventListener('input',()=>p[el.dataset.k]=el.value));
    row.querySelector('.delete-project').addEventListener('click',()=>{ projects.splice(i,1); renderProjects(); });
    row.querySelector('.replace-image').addEventListener('change',e=>{ const f=e.target.files[0]; if(f){ const r=new FileReader(); r.onload=ev=>{p.image=ev.target.result; renderProjects();}; r.readAsDataURL(f); } });
    list.appendChild(row);
  });
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
$('projectUpload').addEventListener('change',e=>{
  [...e.target.files].forEach(file=>{ const r=new FileReader(); r.onload=ev=>{projects.push({id:crypto.randomUUID(),title:file.name.replace(/\.[^.]+$/,''),location:'MSC Project',category:'residential',image:ev.target.result}); renderProjects();}; r.readAsDataURL(file); }); e.target.value='';
});
$('saveProjects').addEventListener('click',()=>{ localStorage.setItem(PROJECT_KEY,JSON.stringify(projects)); alert('Project changes saved. Open the website in this same browser to preview them.'); });
$('clearProjects').addEventListener('click',()=>{ localStorage.removeItem(PROJECT_KEY); loadProjects(); });

const socialDefaults = { instagramUrl:'', facebookUrl:'', youtubeUrl:'', pinterestUrl:'', ownerWhatsApp:'', leadMethod:'backend' };
function loadSocials(){
  const data={...socialDefaults,...JSON.parse(localStorage.getItem(SOCIAL_KEY)||'{}')};
  Object.entries(data).forEach(([k,v])=>{ if($(k)) $(k).value=v; });
}
$('saveSocials').addEventListener('click',()=>{
  const data={};
  ['instagramUrl','facebookUrl','youtubeUrl','pinterestUrl','ownerWhatsApp','leadMethod'].forEach(k=>data[k]=$(k).value.trim());
  localStorage.setItem(SOCIAL_KEY,JSON.stringify(data));
  alert('Social & lead settings saved.');
});
$('resetSocials').addEventListener('click',()=>{ localStorage.removeItem(SOCIAL_KEY); loadSocials(); });
