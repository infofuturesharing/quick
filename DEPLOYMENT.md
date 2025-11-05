# Netlify Dağıtım Adımları

Bu proje Next.js 14 kullanır ve Netlify üzerinde `@netlify/plugin-nextjs` ile çalışacak şekilde yapılandırılmıştır.

## Gereksinimler

- Node `>=18`
- Netlify hesabı
- Google Cloud’da etkin API’ler:
  - Places API (sunucu tarafı)
  - Maps JavaScript API (istemci tarafı)

## Ortam Değişkenleri

- `GOOGLE_PLACES_API_KEY` — Sunucu tarafı Places/Geocoding çağrıları için (gizli).
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — İstemci tarafı Maps JS için (public).

Netlify’da: Site settings → Build & deploy → Environment → Environment variables → Add.

## Build ve Yayın Dizini

- Build komutu: `npm run build`
- Publish dizini: `.next`

`netlify.toml` dosyasında bu ayarlar hazırdır ve `@netlify/plugin-nextjs` eklentisi etkin.

## Dağıtım Yöntemi A (Önerilen): Netlify UI + Git

1. Kodu bir Git repo’suna gönderin (GitHub/GitLab/Bitbucket).
2. Netlify’da “Add new site → Import from Git” deyin, repo’yu seçin.
3. Build ayarları:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Ortam değişkenlerini girin.
5. “Deploy site” deyin ve tamamlanmasını bekleyin.

## Dağıtım Yöntemi B: Netlify CLI

> Not: CLI bazı adımlarda etkileşim gerektirir.

```bash
npm i -g netlify-cli
netlify login
netlify init
netlify env:set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY <değer>
netlify env:set GOOGLE_PLACES_API_KEY <değer>
netlify deploy --build --prod
```

## Sonrası Kontrol Listesi

- `/search` sayfası açılıyor mu?
- Harita pin numaraları ↔ kart eşleşmesi birebir mi?
- Pin tıklayınca kart ortaya kayıyor ve yan panel bilgileri anında geliyor mu?
- API çağrılarında hata yok mu (Netlify logs)?