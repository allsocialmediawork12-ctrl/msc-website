const loader = document.getElementById('loader');
const header = document.getElementById('siteHeader');
const menuToggle = document.getElementById('menuToggle');
const nav = document.querySelector('.desktop-nav');
const backTop = document.getElementById('backTop');
const toast = document.getElementById('toast');
const year = document.getElementById('year');

window.addEventListener('load', () => setTimeout(() => loader.classList.add('hide'), 450));
year.textContent = new Date().getFullYear();

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > 40;
  header.classList.toggle('scrolled', scrolled);
  backTop.classList.toggle('show', window.scrollY > 500);
});

menuToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  document.body.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', open);
});

document.querySelectorAll('.desktop-nav a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  document.body.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

const filters = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.project-card');
filters.forEach(filter => filter.addEventListener('click', () => {
  filters.forEach(btn => btn.classList.remove('active'));
  filter.classList.add('active');
  const selected = filter.dataset.filter;
  cards.forEach(card => card.style.display = selected === 'all' || card.dataset.category === selected ? '' : 'none');
}));

// Consultation form. The form posts to the private /api/lead endpoint when the site is deployed with the MSC backend.
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', async event => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const name = data.get('name')?.trim() || 'there';
  const sent = await submitLead('contact');
  toast.textContent = sent
    ? `Thank you, ${name}. MSC has received your request.`
    : `Thank you, ${name}. Your request is saved, but the private notification system is not connected yet.`;
  toast.classList.add('show');
  contactForm.reset();
  setTimeout(() => toast.classList.remove('show'), 4200);
});

// MSC estimate quotation wizard.
const modal = document.getElementById('estimateModal');
const closeEstimate = document.getElementById('estimateClose');
const steps = [...document.querySelectorAll('.estimate-step')];
const nextBtn = document.getElementById('estimateNext');
const backBtn = document.getElementById('estimateBack');
const stepCount = document.getElementById('stepCount');
const progressDots = [...document.querySelectorAll('.progress-dot')];
const estimateAmount = document.getElementById('estimateAmount');
const estimateSummary = document.getElementById('estimateSummary');
const estimateResultCard = document.getElementById('estimateResultCard');
const whatsappBtn = document.getElementById('estimateWhatsApp');
const estimateNav = document.getElementById('estimateNav');
const estimateNote = document.getElementById('estimateNote');
const estimateThankyou = document.getElementById('estimateThankyou');
const thankyouAmount = document.getElementById('thankyouAmount');
const thankyouCopy = document.getElementById('thankyouCopy');
const thankyouDetails = document.getElementById('thankyouDetails');
const thankyouDetailsToggle = document.getElementById('thankyouDetailsToggle');
const thankyouClose = document.getElementById('thankyouClose');
const imageInput = document.getElementById('estimateImages');
const previewGrid = document.getElementById('imagePreviewGrid');
const selected = { bhk: '', scope: 'Full Home Interior', finish: 'Premium', city: '', area: '', property: 'Apartment', start: 'Ready to start', name: '', phone: '' };
let currentStep = 1;
let uploadedFiles = [];

// Replace this with the studio's real WhatsApp number in international format, without + or spaces.
const MSC_WHATSAPP_NUMBER = ''; // Keep blank on the public site. Use the secure backend notification setup for owner WhatsApp alerts.

function openEstimate() {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  currentStep = 1;
  updateWizard();
}
function closeEstimateModal() {
  estimateThankyou?.classList.remove('show');
  estimateThankyou?.setAttribute('aria-hidden', 'true');
  estimateResultCard.style.display = '';
  estimateNav.style.display = '';
  estimateNote.style.display = '';
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.querySelectorAll('[data-open-estimate]').forEach(btn => btn.addEventListener('click', event => {
  event.preventDefault();
  openEstimate();
}));
closeEstimate.addEventListener('click', closeEstimateModal);
modal.addEventListener('click', event => { if (event.target === modal) closeEstimateModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && modal.classList.contains('open')) closeEstimateModal(); });

document.querySelectorAll('.choice-card').forEach(card => card.addEventListener('click', () => {
  const field = card.dataset.field;
  if (!field) return;
  document.querySelectorAll(`.choice-card[data-field="${field}"]`).forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  selected[field] = card.dataset.value;
  if (field === 'bhk') {
    const areaDefaults = {'1 BHK':550,'2 BHK':900,'3 BHK':1300,'4 BHK':1700,'5 BHK+':2200};
    document.getElementById('estimateArea').placeholder = areaDefaults[selected.bhk].toLocaleString('en-IN');
  }
}));

document.getElementById('finishSelect').addEventListener('change', e => selected.finish = e.target.value);
document.getElementById('estimateCity').addEventListener('input', e => selected.city = e.target.value.trim());
document.getElementById('estimateArea').addEventListener('input', e => selected.area = e.target.value);
document.getElementById('estimateProperty').addEventListener('change', e => selected.property = e.target.value);
document.getElementById('estimateStart').addEventListener('change', e => selected.start = e.target.value);
document.getElementById('estimateName').addEventListener('input', e => selected.name = e.target.value.trim());
document.getElementById('estimatePhone').addEventListener('input', e => selected.phone = e.target.value.trim());

imageInput.addEventListener('change', () => {
  const incoming = [...imageInput.files];
  uploadedFiles = [...uploadedFiles, ...incoming].slice(0, 10);
  renderPreviews();
  imageInput.value = '';
});
function renderPreviews() {
  previewGrid.innerHTML = '';
  uploadedFiles.forEach((file, index) => {
    const item = document.createElement('div');
    item.className = 'preview-item';
    const img = document.createElement('img');
    img.alt = `Uploaded project photo ${index + 1}`;
    const remove = document.createElement('button');
    remove.className = 'preview-remove';
    remove.type = 'button';
    remove.textContent = '×';
    remove.addEventListener('click', () => { uploadedFiles.splice(index, 1); renderPreviews(); });
    item.append(img, remove);
    previewGrid.appendChild(item);
    const reader = new FileReader();
    reader.onload = e => { img.src = e.target.result; };
    reader.readAsDataURL(file);
  });
}

function validateStep(step) {
  if (step === 1 && !selected.bhk) return 'Please select your BHK type.';
  if (step === 2 && !selected.scope) return 'Please select what you would like to design.';
  if (step === 3) {
    selected.city = document.getElementById('estimateCity').value.trim();
    selected.area = document.getElementById('estimateArea').value;
    if (!selected.city) return 'Please enter your city.';
    if (!selected.area || Number(selected.area) < 100) return 'Please enter an approximate area of at least 100 sq.ft.';
  }
  if (step === 4) {
    selected.name = document.getElementById('estimateName').value.trim();
    selected.phone = document.getElementById('estimatePhone').value.trim();
    if (!selected.name) return 'Please enter your name.';
    if (!selected.phone) return 'Please enter your phone or WhatsApp number.';
  }
  return '';
}

function calculateEstimate() {
  const area = Number(selected.area || 0);
  const RATE_PER_SQFT = Number(window.MSC_RATE_PER_SQFT || 1000);
  const base = area * RATE_PER_SQFT;
  estimateAmount.textContent = `₹${Math.round(base).toLocaleString('en-IN')}`;
  estimateSummary.textContent = `${selected.bhk || selected.property} · ${Number(area).toLocaleString('en-IN')} sq.ft. × ₹1,000/sq.ft. · ${selected.city || 'your city'}`;
  estimateResultCard.classList.add('ready');
}

function updateWizard() {
  steps.forEach(step => step.classList.toggle('active', Number(step.dataset.step) === currentStep));
  stepCount.textContent = `${currentStep} / 4`;
  progressDots.forEach((dot, i) => { dot.classList.toggle('active', i === currentStep - 1); dot.classList.toggle('done', i < currentStep - 1); });
  backBtn.disabled = currentStep === 1;
  nextBtn.innerHTML = currentStep === 4 ? 'Get Estimate <span>↗</span>' : 'Next <span>→</span>';
  whatsappBtn.classList.toggle('show', currentStep === 4 && estimateResultCard.classList.contains('ready'));
  if (currentStep === 4 && selected.area) calculateEstimate();
}

nextBtn.addEventListener('click', async () => {
  const error = validateStep(currentStep);
  if (error) {
    toast.textContent = error;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
    return;
  }
  if (currentStep < 4) {
    currentStep++;
    updateWizard();
    return;
  }
  calculateEstimate();
  await showEstimateThankyou();
});

async function showEstimateThankyou() {
  nextBtn.disabled = true;
  nextBtn.innerHTML = 'Submitting…';
  const sent = await submitLead('estimate');
  thankyouAmount.textContent = estimateAmount.textContent;
  thankyouCopy.textContent = sent
    ? `Thank you, ${selected.name || 'there'}. We’ve received your requirements and our MSC team will contact you shortly.`
    : `Thank you, ${selected.name || 'there'}. Your estimate is ready. We’ve saved your requirements and our team can follow up once the notification connection is active.`;
  thankyouDetails.innerHTML = [
    ['Name', selected.name || '—'],
    ['Phone / WhatsApp', selected.phone || '—'],
    ['City', selected.city || '—'],
    ['Property', selected.property || '—'],
    ['BHK', selected.bhk || '—'],
    ['Area', selected.area ? `${Number(selected.area).toLocaleString('en-IN')} sq.ft.` : '—'],
    ['Scope', selected.scope || '—'],
    ['Finish', selected.finish || '—'],
    ['Start', selected.start || '—']
  ].map(([label, value]) => `<div><span>${label}</span><strong>${String(value).replace(/[<>]/g,'')}</strong></div>`).join('');
  estimateNav.style.display = 'none';
  estimateNote.style.display = 'none';
  whatsappBtn.classList.remove('show');
  document.querySelectorAll('.estimate-step').forEach(step => step.classList.remove('active'));
  estimateResultCard.style.display = 'none';
  estimateThankyou.classList.add('show');
  estimateThankyou.setAttribute('aria-hidden', 'false');
  nextBtn.disabled = false;
  nextBtn.innerHTML = 'Get Estimate <span>↗</span>';
}

thankyouDetailsToggle.addEventListener('click', () => {
  const expanded = thankyouDetailsToggle.getAttribute('aria-expanded') === 'true';
  thankyouDetailsToggle.setAttribute('aria-expanded', String(!expanded));
  thankyouDetails.hidden = expanded;
  thankyouDetailsToggle.innerHTML = expanded ? 'View detailed summary <span>⌄</span>' : 'Hide detailed summary <span>⌃</span>';
});

thankyouClose.addEventListener('click', () => {
  estimateThankyou.classList.remove('show');
  estimateThankyou.setAttribute('aria-hidden', 'true');
  estimateResultCard.style.display = '';
  estimateNav.style.display = '';
  estimateNote.style.display = '';
  currentStep = 1;
  selected.bhk = '';
  uploadedFiles = [];
  previewGrid.innerHTML = '';
  document.querySelectorAll('.choice-card').forEach(card => card.classList.remove('selected'));
  document.getElementById('estimateCity').value = '';
  document.getElementById('estimateArea').value = '';
  document.getElementById('estimateName').value = '';
  document.getElementById('estimatePhone').value = '';
  updateWizard();
});

backBtn.addEventListener('click', () => {
  if (currentStep > 1) { currentStep--; updateWizard(); }
});

async function submitLead(source='estimate') {
  const payload = source === 'estimate' ? {
    source: 'Get Estimate Quotation',
    name: selected.name,
    phone: selected.phone,
    bhk: selected.bhk,
    property: selected.property,
    city: selected.city,
    area: selected.area,
    scope: selected.scope,
    finish: selected.finish,
    start: selected.start,
    estimate: estimateAmount.textContent,
    photoCount: uploadedFiles.length,
    photoNames: uploadedFiles.map(f => f.name)
  } : Object.fromEntries(new FormData(document.getElementById('contactForm')).entries());

  try {
    const response = await fetch('/api/lead', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Lead endpoint unavailable');
    return true;
  } catch (error) {
    console.warn('MSC lead notification is not connected yet.', error);
    return false;
  }
}

whatsappBtn.addEventListener('click', async () => {
  calculateEstimate();
  whatsappBtn.disabled = true;
  whatsappBtn.textContent = 'Sending your request…';
  const sent = await submitLead('estimate');
  whatsappBtn.disabled = false;
  whatsappBtn.innerHTML = 'Send estimate request <span>↗</span>';
  toast.textContent = sent
    ? 'Request submitted. MSC has been notified.'
    : 'Your estimate is ready. The secure notification system still needs to be connected.';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
});


// Subtle reveal animation.
const revealItems = document.querySelectorAll('.service-card, .project-card, .process-step, .feature-list > div, .estimate-highlights div');
const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); }
}), { threshold: .12 });
revealItems.forEach(item => { item.style.opacity = '0'; item.style.transform = 'translateY(22px)'; item.style.transition = 'opacity .7s ease, transform .7s ease'; observer.observe(item); });
const revealStyle = document.createElement('style');
revealStyle.textContent = '.revealed{opacity:1!important;transform:translateY(0)!important}';
document.head.appendChild(revealStyle);

// Owner panel social links. Public visitors only see social URLs; the owner WhatsApp number is never inserted here.
(function applyMSCSocialLinks(){
  try {
    const social=JSON.parse(localStorage.getItem('mscOwnerSocialV1')||'null');
    if(!social) return;
    const map={instagramUrl:'socialInstagram',facebookUrl:'socialFacebook',youtubeUrl:'socialYoutube',pinterestUrl:'socialPinterest'};
    Object.entries(map).forEach(([key,id])=>{
      const el=document.getElementById(id);
      if(el && social[key]){ el.href=social[key]; el.classList.remove('hidden-social'); }
    });
  } catch(e){ console.warn('MSC social settings could not be applied',e); }
})();

// Owner panel content overrides. Edits made in admin.html are applied on the same browser.
(function applyMSCAdminChanges(){
  try {
    const text = JSON.parse(localStorage.getItem('mscOwnerTextV1') || 'null');
    if(text){
      const heroEyebrow=document.querySelector('.hero .eyebrow'); if(heroEyebrow) heroEyebrow.textContent=text.heroEyebrow || heroEyebrow.textContent;
      const heroHeading=document.querySelector('.hero h1'); if(heroHeading && text.heroHeading){ const parts=text.heroHeading.split(/\s+/); const last=parts.pop(); heroHeading.innerHTML=parts.join(' ') + (parts.length?' ':'') + '<br><em>'+last.replace(/[<>]/g,'')+'</em>'; }
      const heroCopy=document.querySelector('.hero-copy'); if(heroCopy) heroCopy.textContent=text.heroCopy || heroCopy.textContent;
      const introPs=document.querySelectorAll('.intro-copy p'); if(introPs[0]) introPs[0].textContent=text.aboutP1 || introPs[0].textContent; if(introPs[1]) introPs[1].textContent=text.aboutP2 || introPs[1].textContent;
    }
    const projects = JSON.parse(localStorage.getItem('mscOwnerProjectsV1') || 'null');
    if(projects && Array.isArray(projects)){
      const grid=document.querySelector('.project-grid');
      if(grid){
        grid.innerHTML=projects.map(p=>{ const media=p.videoUrl ? `<div class=\"project-video-wrap\"><video src=\"${p.videoUrl}\" controls muted playsinline preload=\"metadata\"></video><span class=\"video-badge\">MSC FILM</span></div>` : `<img src=\"${p.image}\" alt=\"${String(p.title).replace(/\"/g,'&quot;')}\" loading=\"lazy\">`; return `<article class=\"project-card ${p.id===projects[0]?.id?'tall':''}\" data-category=\"${String(p.category).replace(/[^a-z]/gi,'')}\">${media}<div class=\"project-info\"><span>${p.category==='commercial'?'Commercial':p.category==='hospitality'?'Hospitality':'Residential'}</span><h3>${String(p.title).replace(/[<>]/g,'')}</h3><p>${String(p.location).replace(/[<>]/g,'')}</p>${p.description?`<small>${String(p.description).replace(/[<>]/g,'')}</small>`:''}</div></article>`; }).join('');
        const newCards=grid.querySelectorAll('.project-card');
        document.querySelectorAll('.filter').forEach(filter=>filter.onclick=()=>{document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));filter.classList.add('active');newCards.forEach(c=>c.style.display=filter.dataset.filter==='all'||c.dataset.filter===filter.dataset.filter?'':'none');});
      }
    }
  } catch(e){ console.warn('MSC owner changes could not be applied',e); }
})();


// Live MSC CMS: content, projects and laminate finishes are loaded from the server so every visitor sees admin changes.
(async function loadMSCLiveCMS(){
  const esc = (v='') => String(v).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const setText=(sel,val)=>{const el=document.querySelector(sel); if(el && val!=null) el.textContent=val;};
  const setHTML=(sel,val)=>{const el=document.querySelector(sel); if(el && val!=null) el.innerHTML=val;};
  const setHref=(sel,href)=>{const el=document.querySelector(sel); if(el && href) el.href=href;};
  try{
    const [contentRes, projectRes, laminateRes] = await Promise.all([
      fetch('/api/content',{cache:'no-store'}), fetch('/api/projects',{cache:'no-store'}), fetch('/api/laminates',{cache:'no-store'})
    ]);
    const contentData=await contentRes.json(); const projectData=await projectRes.json(); const laminateData=await laminateRes.json();
    const c=contentData.content||{};
    window.MSC_RATE_PER_SQFT=Number(c.estimate?.rate||1000);

    // Header / navigation
    const brandImg=document.querySelector('.brand img'); if(brandImg) brandImg.alt=(c.brandName||'MSC')+' '+(c.brandSubtitle||'');
    setText('.brand-text strong',c.brandName); setText('.brand-text small',c.brandSubtitle);
    const navVals=[c.nav?.services,c.nav?.projects,c.nav?.about,c.nav?.process,c.nav?.contact];
    document.querySelectorAll('.desktop-nav a').forEach((a,i)=>{if(navVals[i]) a.textContent=navVals[i];});
    setText('.header-quote',c.nav?.estimate+' ↗'); setText('.header-cta',c.nav?.consultation+' ↗');

    // Hero
    setText('.hero .eyebrow',c.hero?.eyebrow); setText('.hero .hero-copy',c.hero?.copy); setText('.hero .btn-gold',c.hero?.primary+' ↗'); setText('.hero .text-link',c.hero?.secondary+' ↓');
    const heroHeading=document.querySelector('.hero h1'); if(heroHeading && c.hero?.heading){ const words=String(c.hero.heading).trim().split(/\s+/); const last=esc(words.pop()||''); heroHeading.innerHTML=esc(words.join(' '))+(words.length?' ':'')+'<br><em>'+last+'</em>'; }

    // About
    setText('#about .section-label',c.about?.label); setText('#about .eyebrow',c.about?.kicker); setText('#about .intro-copy p:nth-of-type(1)',c.about?.p1); setText('#about .intro-copy p:nth-of-type(2)',c.about?.p2); setText('#about .intro-copy .text-link',c.about?.cta+' ↗');
    const aboutHeading=document.querySelector('#about h2'); if(aboutHeading&&c.about?.heading){const words=String(c.about.heading).split(/\s+/);const last=esc(words.pop()||'');aboutHeading.innerHTML=esc(words.join(' '))+' <br> '+last;}

    // Services
    setText('#services .section-label',c.services?.label); setText('#services .section-head h2',c.services?.heading); setText('#services .section-head > p',c.services?.intro);
    const serviceGrid=document.querySelector('#services .service-grid');
    if(serviceGrid && Array.isArray(c.services?.items)){
      serviceGrid.innerHTML=c.services.items.map((it,i)=>`<article class="service-card ${i===0?'featured':''}"><div class="service-number">${esc(it.number||String(i+1).padStart(2,'0'))}</div><h3>${esc(it.title||'Service')}</h3><p>${esc(it.description||'')}</p><a href="#contact">Explore service <span>↗</span></a></article>`).join('');
    }

    // Statement / Projects / Why / Process
    setText('.statement p',c.statement?.quote); setText('.statement small',c.statement?.small); setText('#projects .section-label',c.projects?.label);
    const ph=document.querySelector('#projects .section-head h2'); if(ph&&c.projects?.heading){const words=String(c.projects.heading).split(/\s+/);const last=esc(words.pop()||'');ph.innerHTML=esc(words.join(' '))+'<br><em>'+last+'</em>';}
    setText('.why .section-label',c.why?.label); const wh=document.querySelector('.why h2'); if(wh&&c.why?.heading){const words=String(c.why.heading).split(/\s+/); const last=esc(words.pop()||''); wh.innerHTML=esc(words.join(' '))+' <em>'+last+'</em>';}
    setText('.why .lead',c.why?.lead);
    const featureList=document.querySelector('.feature-list'); if(featureList&&Array.isArray(c.why?.features)) featureList.innerHTML=c.why.features.map((f,i)=>`<div><span>${esc(f.number||String(i+1).padStart(2,'0'))}</span><strong>${esc(f.title||'')}</strong><p>${esc(f.description||'')}</p></div>`).join('');
    setText('#process .section-label',c.process?.label); const procH=document.querySelector('#process .section-head h2'); if(procH&&c.process?.heading){const words=String(c.process.heading).split(/\s+/);const last=esc(words.pop()||'');procH.innerHTML=esc(words.join(' '))+'<br><em>'+last+'</em>';} setText('#process .section-head > p',c.process?.intro);
    const processGrid=document.querySelector('.process-grid'); if(processGrid&&Array.isArray(c.process?.steps)) processGrid.innerHTML=c.process.steps.map((st,i)=>`<div class="process-step"><span>${esc(st.number||String(i+1).padStart(2,'0'))}</span><h3>${esc(st.title||'')}</h3><p>${esc(st.description||'')}</p></div>`).join('');

    // Estimate / contact / footer
    setText('#estimate .section-label',c.estimate?.label); const eh=document.querySelector('#estimate .estimate-teaser h2'); if(eh&&c.estimate?.heading){const words=String(c.estimate.heading).split(/\s+/);const last=esc(words.pop()||'');eh.innerHTML=esc(words.join(' '))+'<br><em>'+last+'</em>';} setText('#estimate .estimate-teaser p',c.estimate?.copy);
    const high=document.querySelector('.estimate-highlights'); if(high&&Array.isArray(c.estimate?.highlights)) high.innerHTML=c.estimate.highlights.map((h,i)=>`<div><strong>${String(i+1).padStart(2,'0')}</strong><span>${esc(h)}</span></div>`).join('');
    setText('#estimateNote',`Estimate basis: ₹${Number(c.estimate?.rate||1000).toLocaleString('en-IN')} per sq.ft. Final pricing can vary after site measurement and detailed scope confirmation.`);
    setText('#contact .section-label',c.contact?.label); const ch=document.querySelector('#contact h2'); if(ch&&c.contact?.heading){const words=String(c.contact.heading).split(/\s+/);const last=esc(words.pop()||'');ch.innerHTML=esc(words.join(' '))+' <em>'+last+'</em>'; } setText('#contact .consultation-inner > div > p',c.contact?.copy);
    setText('.footer-brand p',c.footer?.tagline); setText('.footer-bottom span:last-child',c.footer?.closing);

    // Projects
    const grid=document.querySelector('.project-grid'); const projects=projectData.projects||[];
    if(grid){grid.innerHTML=projects.map((p,i)=>{const media=p.videoUrl?`<div class="project-video-wrap"><video src="${esc(p.videoUrl)}" controls muted playsinline preload="metadata"></video><span class="video-badge">MSC FILM</span></div>`:`<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">`;return `<article class="project-card ${i===0?'tall':''}" data-category="${esc(p.category||'residential')}">${media}<div class="project-info"><span>${esc(p.category==='commercial'?'Commercial':p.category==='hospitality'?'Hospitality':'Residential')}</span><h3>${esc(p.title)}</h3><p>${esc(p.location)}</p>${p.description?`<small>${esc(p.description)}</small>`:''}</div></article>`;}).join('');}
    const currentFilters=[...document.querySelectorAll('.filter')]; const freshCards=[...document.querySelectorAll('.project-card')]; currentFilters.forEach(filter=>filter.onclick=()=>{currentFilters.forEach(b=>b.classList.remove('active'));filter.classList.add('active');freshCards.forEach(card=>card.style.display=filter.dataset.filter==='all'||card.dataset.filter===filter.dataset.filter?'':'none');});

    // Laminates
    setText('#laminateLabel',c.laminate?.label); const lh=document.querySelector('#laminateHeading'); if(lh&&c.laminate?.heading){const words=String(c.laminate.heading).split(/\s+/);const last=esc(words.pop()||'');lh.innerHTML=esc(words.join(' '))+' <em>'+last+'</em>';}
    setText('#laminateIntro',c.laminate?.intro);
    const lgrid=document.getElementById('laminateGridPublic'), lempty=document.getElementById('laminateEmpty'); const laminates=laminateData.laminates||[];
    if(lgrid) lgrid.innerHTML=laminates.map(x=>`<figure class="laminate-public-card"><img src="${esc(x.image)}" alt="${esc(x.name)}" loading="lazy"><figcaption>${esc(x.name)}</figcaption></figure>`).join(''); if(lempty) lempty.style.display=laminates.length?'none':'block';

    // Update estimate rate after CMS settings are loaded.
    const note=document.getElementById('estimateNote'); if(note) note.textContent=`Estimate basis: ₹${Number(c.estimate?.rate||1000).toLocaleString('en-IN')} per sq.ft. Final pricing can vary after site measurement and detailed scope confirmation.`;

    // Reveal newly rendered content.
    document.querySelectorAll('.service-card,.project-card,.process-step,.feature-list > div,.estimate-highlights div,.laminate-public-card').forEach(el=>{el.style.opacity='1';el.style.transform='none';});
  }catch(e){ console.warn('MSC live CMS could not load; using the baked-in website content.',e); }
})();
