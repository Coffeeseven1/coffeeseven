GAME 7 — نسخه آماده GitHub + Cloudflare Workers + D1
=====================================================

این نسخه با پروژه قبلی Express فرق دارد و برای Cloudflare Workers ساخته شده است.
فایل‌های سایت در public هستند؛ API و پنل مدیریت روی Worker و اطلاعات در D1 ذخیره می‌شوند.
از Cloudflare R2 استفاده نمی‌شود.

مراحل راه‌اندازی

۱) در GitHub یک repository جدید بسازید (مثلاً game7-cafe-menu) و تمام فایل‌های این پوشه را در شاخه main قرار دهید.

۲) در Cloudflare داشبورد وارد Workers & Pages > D1 SQL Database شوید و دیتابیس بسازید:
   game7-cafe-db
   سپس Database ID را کپی کنید.

۳) در فایل wrangler.jsonc مقدار database_id را با ID واقعی دیتابیس جایگزین کنید:
   "database_id": "REPLACE_WITH_YOUR_D1_DATABASE_ID"

۴) در Cloudflare > Workers & Pages > Overview، Account ID را بردارید.
   از My Profile > API Tokens یک API Token بسازید که مجوز Workers Scripts:Edit و D1:Edit روی حساب موردنظر داشته باشد.

۵) در GitHub repository بروید به Settings > Secrets and variables > Actions و این Secrets را اضافه کنید:
   CLOUDFLARE_API_TOKEN = توکن API
   CLOUDFLARE_ACCOUNT_ID = شناسه حساب Cloudflare

۶) قبل از اولین Deploy، دو Secret مدیریت را در Worker تنظیم کنید.
   ساده‌ترین روش در Cloudflare Dashboard:
   Workers & Pages > game7-cafe-menu > Settings > Variables and Secrets
   - ADMIN_PASSWORD (نوع Secret): رمز قوی دلخواه برای ورود به پنل
   - SESSION_SECRET (نوع Secret): یک رشته تصادفی طولانی و غیرقابل حدس
   بعد Save کنید.
   اگر Worker هنوز ساخته نشده، ابتدا یک Deploy اولیه از GitHub اجرا کنید، سپس Secretها را اضافه کنید و دوباره Deploy کنید.

۷) با هر push به شاخه main، GitHub Actions:
   - مهاجرت D1 را اجرا می‌کند
   - سایت را به Cloudflare Workers Deploy می‌کند

۸) آدرس نهایی معمولاً شبیه این خواهد بود:
   https://game7-cafe-menu.<subdomain>.workers.dev
   آدرس دقیق را از داشبورد Cloudflare ببینید.
   پنل مدیریت: همان آدرس + /admin

تست محلی (اختیاری)
------------------
1) نصب Node.js 20+
2) اجرا:
   npm ci
   کپی .dev.vars.example به .dev.vars و مقادیر امن خود را وارد کنید.
   npx wrangler d1 migrations apply game7-cafe-db --local
   npm run dev

نکات مهم
--------
- قیمت‌ها به‌صورت اولیه صفر هستند تا تعرفه واقعی وارد شود.
- پنل مدیریت با رمز محیطی و توکن امضاشده ۸ ساعته محافظت می‌شود.
- پس از Deploy، پنل /admin را باز کنید و با ADMIN_PASSWORD وارد شوید.
- این نسخه از D1 استفاده می‌کند و نیازی به R2 ندارد.
- برای QR، بعد از آنلاین شدن سایت، QR همان URL عمومی workers.dev را بسازید.
- GitHub Actions برای Deploy نیازمند Secretهای معتبر و database_id صحیح است.


به‌روزرسانی طراحی صفحه اصلی
---------------------------
- تصویر اختصاصی دسته بازی سه‌بعدی در public/assets/game7-3d-controller.png اضافه شده است.
- بخش Hero در public/index.html و انیمیشن شناور آن در public/style.css به‌روزرسانی شده است.
- نام Worker در wrangler.jsonc روی coffeeseven تنظیم شده تا Deploy به Worker فعلی انجام شود.
- اتصال D1 و مسیر /admin حفظ شده‌اند.
- برای اعمال تغییرات، فایل‌های این پروژه را در همان مخزن GitHub متصل به Worker قرار دهید و Commit/Push کنید. سپس وضعیت Deployments را بررسی کنید.


به‌روزرسانی طراحی رابط کاربری (اکتبر ۲۰۲۶)
-------------------------------------------
- دکمه مدیریت داخل ناوبری اصلی قرار گرفت.
- دسته بازی در هیرو شناور و با نورپردازی طلایی/قرمز نمایش داده می‌شود.
- کارت‌های PS4 و PS5 با کنسول/دسته سه‌بعدی CSS و کارت بیلیارد با میز و توپ‌های متحرک ساخته شده‌اند.
- استایل فیلدها، دکمه‌ها، کادرها و کارت‌های پنل مدیریت اصلاح شده است.
- این تغییرات در public/ هستند؛ Worker و D1 binding حفظ شده‌اند.


تغییرات رابط کاربری (نسخه اکتبر ۲۰۲۶)
---------------------------------------
- لینک مدیریت داخل ناوبری قرار گرفته و دکمه جداگانه سمت چپ هدر حذف شده است.
- کارت PS4 از تصویر دسته DualShock 4 در Wikimedia Commons استفاده می‌کند.
- کارت PS5 از تصویر دسته DualSense در Wikimedia Commons استفاده می‌کند.
- برای این تصاویر، شرایط مجوز Creative Commons مربوط به صفحه منبع را رعایت کنید؛ هنگام انتشار عمومی بهتر است اعتبار منبع در صفحه «درباره» یا فایل README حفظ شود.
- افکت‌های شناور دسته‌ها، انعکاس نوری، درخشش کارت‌ها و انیمیشن میز/توپ‌های بیلیارد به CSS افزوده شده‌اند.
