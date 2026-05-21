# Rafael Tonietto — Links Oficiais

Página de links oficiais (estilo link-in-bio) para Rafael Tonietto — Personal Trainer Academy.

## Desenvolvimento

Estrutura do código-fonte:

- `index.html` — markup e SEO
- `css/main.css` — estilos
- `js/main.js` — scripts (opcional)
- `assets/` — imagens originais

Abra `index.html` no navegador ou use um servidor local (`npx serve .`).

## Build de produção

```bash
npm install
npm run build
```

Gera a pasta `dist/` pronta para upload na hospedagem:

```
dist/
├── index.html      # HTML minificado + SEO
├── css/main.css    # CSS minificado
├── js/main.js      # JS minificado
└── assets/         # Imagens otimizadas (WebP)
```

### Otimizações aplicadas

- Minificação de HTML, CSS e JS
- Conversão do avatar `rafael.jpg` → `rafael.webp` (320×320)
- Recompressão de `mobile.webp` e `web.webp`
- Meta tags SEO, Open Graph, Twitter Cards e canonical
- Separação por tecnologia (css/, js/, assets/)

## Deploy

Envie **apenas o conteúdo de `dist/`** para a raiz do domínio (Vercel, Netlify, S3, etc.).

Canonical configurado: `https://pos.personaltraineracademy.com.br/`
