const money = n => Number(n || 0).toLocaleString("fa-IR") + " تومان";
const iconFor = p => ({drink:"🥤",food:"🍔",coffee:"☕",snack:"🍟",ps4:"🎮",ps5:"🎮",billiards:"🎱"}[p.image] || "✦");
async function loadMenu(){
  let data;
  try { const r=await fetch('/api/menu'); data=await r.json(); }
  catch(e){ document.querySelectorAll('.loading').forEach(x=>x.textContent='اتصال به اطلاعات منو برقرار نشد. سرور را اجرا کنید.'); return; }
  const prices=document.getElementById('price-list');
  prices.innerHTML=data.prices.map(item=>`<article class="price-card"><h3>${esc(item.name)}</h3><p>${esc(item.description||'')}</p>${(item.prices||[]).map(p=>`<div class="price-row"><span>${esc(p.label)}</span><strong>${Number(p.amount)>0?money(p.amount):'قیمت به‌زودی'}</strong></div>`).join('')}</article>`).join('');
  const products=document.getElementById('product-list');
  function renderProducts(cat='all'){const list=data.products.filter(p=>cat==='all'||p.category===cat);products.innerHTML=list.length?list.map(p=>`<article class="product-card"><div class="product-icon">${iconFor(p)}</div><h3>${esc(p.name)}</h3><p>${esc(p.description||'')}</p><strong>${Number(p.price)>0?money(p.price):'قیمت به‌زودی'}</strong></article>`).join(''):'<p class="loading">هنوز محصولی در این دسته ثبت نشده است.</p>'}
  renderProducts();
  document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderProducts(btn.dataset.category)}));
  document.getElementById('hours').textContent=data.settings.hours||'—';
  document.getElementById('address').textContent=data.settings.address||'—';
  document.getElementById('phone').textContent=data.settings.phone||'—';
  document.getElementById('instagram').textContent=data.settings.instagram?'@'+data.settings.instagram:'—';
}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
loadMenu();
