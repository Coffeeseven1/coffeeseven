'use strict';

const money = value => Number(value || 0).toLocaleString('fa-IR') + ' تومان';
const iconFor = product => ({ drink: '🥤', food: '🍔', coffee: '☕', snack: '🍟', ps4: '🎮', ps5: '🎮', billiards: '🎱' }[product.image] || '✦');
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

let menuData = null;
let activeCategory = 'all';

function showLoadError(message) {
  document.querySelectorAll('.loading').forEach(element => { element.textContent = message; });
}

function renderPrices() {
  const container = document.getElementById('price-list');
  if (!container || !menuData) return;
  container.innerHTML = menuData.prices.length ? menuData.prices.map(item => `
    <article class="price-card"><h3>${esc(item.name)}</h3><p>${esc(item.description || '')}</p>
    ${(item.prices || []).map(price => `<div class="price-row"><span>${esc(price.label)}</span><strong>${Number(price.amount) > 0 ? money(price.amount) : 'قیمت به‌زودی'}</strong></div>`).join('')}</article>`).join('') : '<p class="loading">هنوز تعرفه‌ای ثبت نشده است.</p>';
}

function renderProducts() {
  const container = document.getElementById('product-list');
  if (!container || !menuData) return;
  const products = menuData.products.filter(product => activeCategory === 'all' || product.category === activeCategory);
  container.innerHTML = products.length ? products.map(product => `
    <article class="product-card"><div class="product-icon">${iconFor(product)}</div><h3>${esc(product.name)}</h3><p>${esc(product.description || '')}</p><strong>${Number(product.price) > 0 ? money(product.price) : 'قیمت به‌زودی'}</strong></article>`).join('') : '<p class="loading">هنوز محصولی در این دسته ثبت نشده است.</p>';
}

function attachTabs() {
  document.querySelectorAll('.tab').forEach(button => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.category || 'all';
      document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab === button));
      renderProducts();
    });
  });
}

async function loadMenu() {
  attachTabs();
  try {
    const response = await fetch('/api/menu', { cache: 'no-store' });
    let result = {};
    try { result = await response.json(); } catch {}
    if (!response.ok) throw new Error(result.error || `خطای سرور (${response.status})`);
    if (!result || !Array.isArray(result.prices) || !Array.isArray(result.products) || !result.settings) {
      throw new Error('ساختار اطلاعات منو معتبر نیست.');
    }
    menuData = result;
    renderPrices(); renderProducts();
    document.getElementById('hours').textContent = result.settings.hours || '—';
    document.getElementById('address').textContent = result.settings.address || '—';
    document.getElementById('phone').textContent = result.settings.phone || '—';
    document.getElementById('instagram').textContent = result.settings.instagram ? '@' + result.settings.instagram : '—';
  } catch (error) {
    showLoadError('بارگذاری منو ناموفق بود: ' + error.message);
  }
}

loadMenu();
