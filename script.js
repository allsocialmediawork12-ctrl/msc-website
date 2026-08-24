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
  const rateMap = { Essential: 1600, Premium: 2200, Luxury: 3000 };
  let rate = rateMap[selected.finish] || 2200;
  let scopeFactor = selected.scope === 'Kitchen + Wardrobes' ? .55 : selected.scope === 'Living + Bedrooms' ? .68 : selected.scope === 'Commercial Interior' ? 1.1 : 1;
  const base = area * rate * scopeFactor;
  const low = Math.round(base * .9 / 50000) * 50000;
  const high = Math.round(base * 1.12 / 50000) * 50000;
  estimateAmount.textContent = `₹${(low/100000).toFixed(1)}L – ₹${(high/100000).toFixed(1)}L`;
  estimateSummary.textContent = `${selected.bhk || selected.property} · ${Number(area).toLocaleString('en-IN')} sq.ft. · ${selected.finish} finish · ${selected.city || 'your city'}`;
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

nextBtn.addEventListener('click', () => {
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
  whatsappBtn.classList.add('show');
  toast.textContent = 'Your indicative estimate is ready.';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
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
        grid.innerHTML=projects.map(p=>`<article class="project-card ${p.id===projects[0]?.id?'tall':''}" data-category="${String(p.category).replace(/[^a-z]/gi,'')}"><img src="${p.image}" alt="${String(p.title).replace(/"/g,'&quot;')}" loading="lazy"><div class="project-info"><span>${p.category==='commercial'?'Commercial':'Residential'}</span><h3>${String(p.title).replace(/[<>]/g,'')}</h3><p>${String(p.location).replace(/[<>]/g,'')}</p></div></article>`).join('');
        const newCards=grid.querySelectorAll('.project-card');
        document.querySelectorAll('.filter').forEach(filter=>filter.onclick=()=>{document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));filter.classList.add('active');newCards.forEach(c=>c.style.display=filter.dataset.filter==='all'||c.dataset.filter===filter.dataset.filter?'':'none');});
      }
    }
  } catch(e){ console.warn('MSC owner changes could not be applied',e); }
})();
