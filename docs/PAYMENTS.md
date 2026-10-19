# Система оплаты MIKBOOK (Stripe) — ЕС / Франция

Документ для настройки и понимания потока: цифровая подписка на книгу для студентов в странах Европейского союза (и EEA/UK при необходимости).

---

## 1. Что продаём

Не разовый «товар в корзине», а **рекуррентная подписка** на доступ к платформе:

| План (MVP) | Интервал | Пример цены (настраивается) |
|------------|----------|-----------------------------|
| Mensuel    | месяц    | 19,99 €                     |
| Annuel     | год      | 149 €                       |

Позже можно добавить тариф «по главе» (отдельный продукт / one-time или отдельная подписка).

Валюта по умолчанию: **EUR**. Цены в Stripe задаются в евроцентах или через Price ID в Dashboard.

---

## 2. Роли и участники

```
Студент → сайт MIKBOOK → Stripe Checkout → банк / карта
                ↑                ↓
           наш бэкенд ←── webhooks (оплачено / отменено / просрочено)
                ↓
         доступ к reader / PDF
```

- **MIKBOOK (продавец)** — французское (или другое EU) юрлицо / совместимый статус, аккаунт Stripe.
- **Stripe** — эквайринг, подписки, налоги (опционально Stripe Tax), Customer Portal.
- **Студент** — платит картой (и при включении — Apple Pay / Google Pay и др.).

---

## 3. Поток оплаты (как работает)

### 3.1. Первая покупка

1. На сайте студент нажимает **S'abonner** и выбирает Mensuel / Annuel.
2. Бэкенд создаёт **Stripe Checkout Session** (`mode: subscription`).
3. Студент попадает на страницу Stripe (логотип MIKBOOK можно настроить в Dashboard):
   - email  
   - карта (Visa/Mastercard и т.д.)  
   - при необходимости **3‑D Secure** (PSD2)  
   - адрес для биллинга (часто нужен для НДС)
4. После успешной оплаты Stripe создаёт:
   - **Customer**  
   - **Subscription** (статус `active` / `trialing`)  
5. Webhook `checkout.session.completed` → наш сервер помечает доступ как активный (по email / `customer_id`).
6. Редирект на `/subscribe/success` — подтверждение на сайте.
7. В cookie (или в аккаунте после auth) сохраняется связь с `stripe_customer_id` для «Gérer mon abonnement».

### 3.2. Продление (автосписание)

- Stripe сам списывает по расписанию (каждый месяц / год).
- При успехе: `invoice.paid` → доступ остаётся.
- При ошибке карты: `invoice.payment_failed` → Stripe шлёт письма (Smart Retries); доступ можно ограничить после grace period (политика настраивается).

### 3.3. Смена плана / отмена

Через **Customer Portal** (кнопка «Gérer mon abonnement»):

- смена Mensuel ↔ Annuel  
- отмена в конце периода или сразу (настройка Portal)  
- смена карты  
- просмотр счетов / инвойсов  

События: `customer.subscription.updated` / `deleted` → обновляем доступ в БД.

### 3.4. Доступ к контенту

Правило: **активная подписка Stripe = доступ к книге/reader**.  
Проверка: статус подписки у Customer (`active`, опционально `trialing`) или запись в нашей БД, синхронизированная webhooks.

PDF **не** лежит в публичной папке на CDN без проверки — только через авторизованный endpoint.

---

## 4. Настройка под страны ЕС

### 4.1. Аккаунт Stripe

1. Зарегистрировать Stripe на юрлицо / статус, допустимый во Франции (или другой стране EU).
2. Пройти **KYC** (документы компании, директор, банк IBAN для выплат).
3. Включить выплаты на **европейский IBAN**.
4. Business settings: страна, поддержка, URL сайта (`https://mikbook.vercel.app` или прод-домен), политика возвратов.

### 4.2. Продукты и цены

В Dashboard → **Products**:

- Product: `MIKBOOK Abonnement`  
  - Price monthly recurring EUR  
  - Price yearly recurring EUR  

В env (Vercel / `.env`):

```text
STRIPE_SECRET_KEY=sk_live_...          # или sk_test_ для тестов
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...
NEXT_PUBLIC_APP_URL=https://ваш-домен
STRIPE_WEBHOOK_SECRET=whsec_...
```

Без Price ID приложение может создавать `price_data` на лету (удобно для теста); **для продакшена лучше фиксированные Price ID**.

### 4.3. НДС (VAT) по ЕС — критично для «стран ЕС»

Цифровая подписка студентам в разных странах EU → обычно применяется **правило места потребления** (где покупатель), не только «мы во Франции».

**Рекомендуемый вариант: Stripe Tax**

1. Dashboard → **Tax** → включить Stripe Tax.  
2. Зарегистрировать налоговые обязательства (или следовать подсказкам Stripe по порогам OSS / стране).  
3. Для Франции часто нужна регистрация НДС; для продаж B2C digital по EU — часто схема **One-Stop Shop (OSS)** через налоговую FR (или эквивалент).  
4. В Checkout включить автоматический расчёт налога (`automatic_tax: { enabled: true }` — добавить в код при выводе в прод).  
5. Собирать **billing address** / страну (уже можно через Checkout).  
6. Для B2B (редко для студентов): VAT ID → reverse charge (Stripe Tax умеет проверять).

**Без Stripe Tax:** считать НДС вручную или через бухгалтера + свои ставки — дороже в разработке и рискованнее.

**Важно юридически:** цены «TTC» (с налогом) или «HT» — зафиксировать в оферте и на Checkout (Stripe Tax показывает breakdown).

### 4.4. Платёжные методы по EU

Минимальный набор (MVP):

- Cards (EU + 3‑D Secure)

Желательно включить в Dashboard → Payment methods:

- Apple Pay / Google Pay  
- при расширении: SEPA Debit (меньше актуально для студентов), Ideal / Bancontact и т.д. через Stripe (по странам)

Локаль Checkout: `locale: "fr"` (уже в коде); для других языков EU можно `auto` или переключать по языку сайта.

### 4.5. Customer Portal

Dashboard → Settings → Billing → **Customer portal**:

- разрешить отмену подписки  
- разрешить смену плана (monthly ↔ yearly)  
- обновление способа оплаты  
- просмотр инвойсов  

Без включённого Portal кнопка «Gérer mon abonnement» вернёт ошибку.

### 4.6. Webhooks (обязательно для доступа)

Endpoint продакшена:

`https://ваш-домен/api/stripe/webhook`

События минимум:

- `checkout.session.completed`  
- `customer.subscription.updated`  
- `customer.subscription.deleted`  
- `invoice.paid`  
- `invoice.payment_failed`  

Секрет `whsec_...` → `STRIPE_WEBHOOK_SECRET`.

Локально: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

### 4.7. Валюты и мульти-страны

- MVP: всё в **EUR** (проще для FR + большинство студентов EU).  
- Если понадобятся локальные валюты (PLN, CZK…): отдельные Prices в Stripe или Adaptive Pricing — отдельная задача.  
- Гео-ограничения: по желанию ограничить Checkout списком стран EU в Dashboard / Radar.

### 4.8. Соответствие и тексты

На сайте / в Checkout должны быть доступны:

- CGV / условия подписки (автопродление, отмена)  
- политика возвратов (цифровой контент — особые правила 14 дней в EU, часто с оговоркой о начале потребления)  
- privacy / RGPD  
- контакты продавца (издатель / компания)

Stripe не заменяет юриста; оферту лучше согласовать с юристом во Франции.

---

## 5. Что уже есть в коде

| Компонент | Путь / поведение |
|-----------|------------------|
| Кнопка подписки | `SubscribeWidget` — Mensuel / Annuel |
| Создание сессии | `POST /api/stripe/checkout` |
| Portal | `POST /api/stripe/portal` |
| Подтверждение session + cookie | `GET /api/stripe/session` |
| Webhook | `POST /api/stripe/webhook` (логирует события; запись в БД — следующий этап) |
| Success / Cancel | `/subscribe/success`, `/subscribe/cancel` |

**Ещё не сделано (нужно для полного контура EU-продакшена):**

- `automatic_tax` в Checkout  
- БД пользователей + привязка `stripeCustomerId` / статуса подписки  
- Auth (чтобы доступ не держался только на cookie)  
- Закрытая выдача PDF / reader по активной подписке  
- Stripe Tax + OSS / бухгалтерия  
- Live keys + webhook на прод-домен  

---

## 6. Чеклист запуска по странам ЕС

1. [ ] Stripe аккаунт + KYC + IBAN  
2. [ ] Products / Prices EUR (monthly, yearly)  
3. [ ] Env на Vercel (secret, publishable, price ids, app url)  
4. [ ] Customer Portal включён  
5. [ ] Webhook на прод + нужные события  
6. [ ] Stripe Tax (или явная схема НДС с бухгалтером)  
7. [ ] Cards + Apple/Google Pay  
8. [ ] Тест-карты в Test mode, потом Live  
9. [ ] CGV / refund / privacy на сайте  
10. [ ] Проверка доступа: оплата → active → контент; отмена → revoke  

---

## 7. Коротко «для заказчика»

Оплата идёт через **Stripe Billing**: студент выбирает месяц или год, платит на защищённой странице Stripe (карты EU, 3‑D Secure). Подписка продлевается автоматически; отмена и смена плана — в личном кабинете Stripe. Для продаж по странам ЕС цены в евро, НДС считаем через **Stripe Tax** (и при необходимости OSS во Франции), доступ к книге открывается только при активной подписке и закрывается при отмене или просрочке платежа.
