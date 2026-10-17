'use strict';

const $ = id => document.getElementById(id);
let token = sessionStorage.getItem('game7_admin_token') || '';
let data = null;

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

async function api(url, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  let response;
  try {
    response = await fetch(url, { ...options, headers, cache: 'no-store' });
  } catch {
    throw new Error('ارتباط با سرور برقرار نشد. اتصال اینترنت و انتشار Cloudflare را بررسی کنید.');
  }
  let result = {};
  try { result = await response.json(); } catch {}
  if (!response.ok) {
    if (response.status === 401 && url !== '/api/admin/login') {
      token = '';
      sessionStorage.removeItem('game7_admin_token');
      $('editor').hidden = true;
      $('login-box').hidden = false;
    }
    throw new Error(result.error || `خطای سرور (${response.status})`);
  }
  return result;
}

function normalizeData(value) {
  if (!value || !Array.isArray(value.prices) || !Array.isArray(value.products) ||
      !Array.isArray(value.offers) || !value.settings || typeof value.settings !== 'object') {
    throw new Error('ساختار اطلاعات منو معتبر نیست. اگر این خطا ادامه داشت، مهاجرت دیتابیس D1 را اجرا کنید.');
  }
  return value;
}

async function loadEditor() {
  const result = await api('/api/admin/data');
  data = normalizeData(result);
  $('login-box').hidden = true;
  $('editor').hidden = false;
  render();
  $('save-status').textContent = 'اطلاعات از پایگاه داده بارگذاری شد.';
}

$('login-form').addEventListener('submit', async event => {
  event.preventDefault();
  const submit = $('login-form').querySelector('button[type="submit"],button:not([type])');
  submit.disabled = true;
  $('login-error').textContent = '';
  try {
    const result = await api('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password: $('password').value })
    });
    if (!result.token) throw new Error('سرور توکن ورود ارسال نکرد.');
    token = result.token;
    sessionStorage.setItem('game7_admin_token', token);
    await loadEditor();
    $('password').value = '';
  } catch (error) {
    token = '';
    sessionStorage.removeItem('game7_admin_token');
    $('login-error').textContent = error.message;
  } finally {
    submit.disabled = false;
  }
});

function render() {
  const settings = data.settings || {};
  ['name', 'phone', 'address', 'hours', 'instagram'].forEach(key => {
    $('s-' + key).value = settings[key] || '';
  });
  renderPrices(); renderProducts(); renderOffers();
}

function renderPrices() {
  $('prices-editor').innerHTML = data.prices.map((price, i) => `
    <div class="entry">
      <div class="entry-head"><strong>${esc(price.name)}</strong><button type="button" class="delete" data-delete-price="${i}">حذف</button></div>
      <div class="entry-fields">
        <label>نام تعرفه<input data-p="${i}" data-key="name" value="${esc(price.name)}"></label>
        <label>توضیحات<input data-p="${i}" data-key="description" value="${esc(price.description)}"></label>
        <label>دسته<select data-p="${i}" data-key="category"><option value="gaming" ${price.category === 'gaming' ? 'selected' : ''}>بازی</option><option value="billiards" ${price.category === 'billiards' ? 'selected' : ''}>بیلیارد</option></select></label>
      </div>
      <div class="subprices">${(price.prices || []).map((item, j) => `<label>${esc(item.label)} (تومان)<input type="number" min="0" data-p="${i}" data-price="${j}" value="${Number(item.amount) || 0}"></label>`).join('')}</div>
    </div>`).join('');
}

function renderProducts() {
  $('products-editor').innerHTML = data.products.map((product, i) => `
    <div class="entry">
      <div class="entry-head"><strong>${esc(product.name)}</strong><button type="button" class="delete" data-delete-product="${i}">حذف</button></div>
      <div class="entry-fields">
        <label>نام محصول<input data-prod="${i}" data-key="name" value="${esc(product.name)}"></label>
        <label>دسته<select data-prod="${i}" data-key="category"><option value="drinks" ${product.category === 'drinks' ? 'selected' : ''}>نوشیدنی</option><option value="food" ${product.category === 'food' ? 'selected' : ''}>خوراکی</option></select></label>
        <label>قیمت (تومان)<input type="number" min="0" data-prod="${i}" data-key="price" value="${Number(product.price) || 0}"></label>
        <label>توضیحات<input data-prod="${i}" data-key="description" value="${esc(product.description || '')}"></label>
        <label>آیکون<select data-prod="${i}" data-key="image"><option value="drink" ${product.image === 'drink' ? 'selected' : ''}>نوشیدنی</option><option value="food" ${product.image === 'food' ? 'selected' : ''}>خوراکی</option><option value="coffee" ${product.image === 'coffee' ? 'selected' : ''}>قهوه</option><option value="snack" ${product.image === 'snack' ? 'selected' : ''}>سیب‌زمینی/اسنک</option></select></label>
      </div>
    </div>`).join('');
}

function renderOffers() {
  $('offers-editor').innerHTML = data.offers.map((offer, i) => `
    <div class="entry">
      <div class="entry-head"><strong>${esc(offer.name)}</strong><button type="button" class="delete" data-delete-offer="${i}">حذف</button></div>
      <div class="entry-fields">
        <label>عنوان<input data-offer="${i}" data-key="name" value="${esc(offer.name)}"></label>
        <label>توضیحات<input data-offer="${i}" data-key="description" value="${esc(offer.description || '')}"></label>
        <label>قیمت (تومان)<input type="number" min="0" data-offer="${i}" data-key="price" value="${Number(offer.price) || 0}"></label>
      </div>
    </div>`).join('');
}

function updateField(target) {
  if (!data) return;
  if (target.dataset.p !== undefined) {
    const price = data.prices[Number(target.dataset.p)];
    if (!price) return;
    if (target.dataset.price !== undefined) {
      price.prices[Number(target.dataset.price)].amount = Math.max(0, Number(target.value) || 0);
    } else price[target.dataset.key] = target.value;
  }
  if (target.dataset.prod !== undefined) {
    const product = data.products[Number(target.dataset.prod)];
    if (product) product[target.dataset.key] = target.dataset.key === 'price' ? Math.max(0, Number(target.value) || 0) : target.value;
  }
  if (target.dataset.offer !== undefined) {
    const offer = data.offers[Number(target.dataset.offer)];
    if (offer) offer[target.dataset.key] = target.dataset.key === 'price' ? Math.max(0, Number(target.value) || 0) : target.value;
  }
  $('save-status').textContent = 'تغییرات ذخیره‌نشده دارید.';
}

document.addEventListener('input', event => updateField(event.target));
document.addEventListener('change', event => updateField(event.target));
document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button || !data) return;
  if (button.dataset.deletePrice !== undefined) {
    if (confirm('این تعرفه حذف شود؟')) { data.prices.splice(Number(button.dataset.deletePrice), 1); renderPrices(); }
  } else if (button.dataset.deleteProduct !== undefined) {
    if (confirm('این محصول حذف شود؟')) { data.products.splice(Number(button.dataset.deleteProduct), 1); renderProducts(); }
  } else if (button.dataset.deleteOffer !== undefined) {
    if (confirm('این پیشنهاد حذف شود؟')) { data.offers.splice(Number(button.dataset.deleteOffer), 1); renderOffers(); }
  }
});

function addItem(collection, item, renderFn, editorId, message) {
  if (!data) { $('save-status').textContent = 'ابتدا وارد پنل مدیریت شوید.'; return; }
  data[collection].push(item);
  renderFn();
  $('save-status').textContent = message;
  $(editorId).lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
$('add-price').addEventListener('click', () => addItem('prices', { id: 'price-' + Date.now(), category: 'gaming', name: 'تعرفه جدید', description: '', image: 'ps5', prices: [{ label: 'نیم ساعت', amount: 0 }, { label: '۱ ساعت', amount: 0 }, { label: '۲ ساعت', amount: 0 }] }, renderPrices, 'prices-editor', 'تعرفه اضافه شد؛ برای ثبت نهایی ذخیره همه تغییرات را بزنید.'));
$('add-product').addEventListener('click', () => addItem('products', { id: 'product-' + Date.now(), category: 'drinks', name: 'محصول جدید', description: '', price: 0, image: 'drink' }, renderProducts, 'products-editor', 'محصول اضافه شد؛ برای ثبت نهایی ذخیره همه تغییرات را بزنید.'));
$('add-offer').addEventListener('click', () => addItem('offers', { id: 'offer-' + Date.now(), name: 'پیشنهاد جدید', description: '', price: 0 }, renderOffers, 'offers-editor', 'پیشنهاد اضافه شد؛ برای ثبت نهایی ذخیره همه تغییرات را بزنید.'));

async function save() {
  if (!token || !data) { $('save-status').textContent = 'ابتدا وارد پنل مدیریت شوید.'; return; }
  ['name', 'phone', 'address', 'hours', 'instagram'].forEach(key => data.settings[key] = $('s-' + key).value.trim());
  const buttons = [$('save-all'), $('save-all-bottom')];
  buttons.forEach(button => button.disabled = true);
  $('save-status').textContent = 'در حال ذخیره اطلاعات در پایگاه داده…';
  try {
    const result = await api('/api/admin/data', { method: 'PUT', body: JSON.stringify(data) });
    if (!result.ok) throw new Error(result.error || 'سرور ذخیره را تأیید نکرد.');
    $('save-status').textContent = '✓ همه تغییرات با موفقیت ذخیره شد.';
  } catch (error) {
    $('save-status').textContent = 'خطا: ' + error.message;
  } finally {
    buttons.forEach(button => button.disabled = false);
  }
}
$('save-all').addEventListener('click', save);
$('save-all-bottom').addEventListener('click', save);

if (token) {
  loadEditor().catch(error => {
    token = ''; sessionStorage.removeItem('game7_admin_token');
    $('login-error').textContent = 'ورود قبلی معتبر نبود: ' + error.message;
  });
}
