-- GAME 7 D1 recovery SQL
-- Run in Cloudflare Dashboard > Workers & Pages > D1 > game7-cafe-db > Console.
-- Safe to rerun; existing app_data/main content is not overwritten.
CREATE TABLE IF NOT EXISTS app_data (
  id TEXT PRIMARY KEY NOT NULL,
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO app_data (id, payload, updated_at)
VALUES (
  'main',
  '{"settings":{"name":"کافه گیم سون","phone":"شماره تماس را وارد کنید","address":"آدرس کافه را وارد کنید","hours":"ساعت کاری را وارد کنید","instagram":"game7.cafe"},"prices":[{"id":"ps4","category":"gaming","name":"PS4","description":"تعرفه بازی با پلی‌استیشن ۴","image":"ps4","prices":[{"label":"نیم ساعت","amount":0},{"label":"۱ ساعت","amount":0},{"label":"۲ ساعت","amount":0}]},{"id":"ps5","category":"gaming","name":"PS5","description":"تعرفه بازی با پلی‌استیشن ۵","image":"ps5","prices":[{"label":"نیم ساعت","amount":0},{"label":"۱ ساعت","amount":0},{"label":"۲ ساعت","amount":0}]},{"id":"billiards","category":"billiards","name":"بیلیارد","description":"تعرفه هر میز","image":"billiards","prices":[{"label":"نیم ساعت","amount":0},{"label":"۱ ساعت","amount":0},{"label":"۲ ساعت","amount":0}]}],"products":[{"id":"drink-1","category":"drinks","name":"نوشیدنی نمونه","description":"برای ویرایش از پنل مدیریت","price":0,"image":"drink"},{"id":"food-1","category":"food","name":"خوراکی نمونه","description":"برای ویرایش از پنل مدیریت","price":0,"image":"food"}],"offers":[]}',
  CURRENT_TIMESTAMP
);
