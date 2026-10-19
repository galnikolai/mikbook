# MIKBOOK

Трёхколоночный лендинг в духе [KLINE](https://kline.brussels/) + подписка через **Stripe Billing**.

## Запуск

```bash
cp .env.example .env.local
# заполните STRIPE_SECRET_KEY (и при желании Price IDs)
npm install
npm run dev
```

- Просмотр: [http://127.0.0.1:3000](http://127.0.0.1:3000)
- Редактор картинок: [http://127.0.0.1:3000/?edit=1](http://127.0.0.1:3000/?edit=1)
- Кнопка **S'abonner** справа внизу → Checkout (mensuel / annuel)

## Stripe

1. Ключи: [Dashboard → API keys](https://dashboard.stripe.com/apikeys) → `.env.local`
2. (Рекомендуется) Products → recurring prices → `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_YEARLY`  
   Без Price ID Checkout создаёт `price_data` на лету (суммы из `STRIPE_AMOUNT_*_CENTS`).
3. Customer Portal: Settings → Billing → Customer portal → включить.
4. Локальные webhooks:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Скопируйте `whsec_…` в `STRIPE_WEBHOOK_SECRET`.

| Endpoint | Назначение |
|----------|------------|
| `POST /api/stripe/checkout` | Создать Checkout Session (`monthly` \| `yearly`) |
| `POST /api/stripe/portal` | Customer Portal (cookie после успешной оплаты) |
| `GET /api/stripe/session` | Подтвердить session + cookie `mikbook_stripe_customer` |
| `POST /api/stripe/webhook` | События подписки |

## Книга (PDF)

Локально: [`content/books/mikbook-medecine-4e.pdf`](content/books/mikbook-medecine-4e.pdf)  
(4e éd. — Mikaël Guedj, Olivier Hoffman). PDF ~148MB, **не в git** и **не в `public/`**.

## Колонки

| Колонка | Поведение |
|---------|-----------|
| 1 | Фиксированный текст |
| 2 | Текст + картинки, свой scroll |
| 3 | Только картинки, свой scroll |

Ширины: `--col-1/2/3` и панель редактора.

## Редактор (`?edit=1`)

Move / scale / replace / link / save (localStorage) / export JSON.
