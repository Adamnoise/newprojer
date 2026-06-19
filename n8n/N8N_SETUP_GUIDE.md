# n8n Soccer Championship Analysis Workflow - Teljes Beállítási Útmutató

## 🎯 Áttekintés

Ez az útmutató lépésről-lépésre végigvezet az n8n workflow beállításán a Soccer Championship Analysis rendszerhez.

---

## 📋 1. LÉPÉS: PostgreSQL Credentials Beállítása

### A. Adatbázis-hitelesítő adatok előkészítése

Szükséged lesz a következőkre:
- **Host**: `your-neon-host.neon.tech` (vagy localhost ha helyi)
- **Port**: `5432`
- **Database**: `soccer_analysis`
- **User**: `postgres` (vagy a te felhasználóneved)
- **Password**: az adatbázis jelszavad
- **SSL**: Enable (Neon esetén kötelező)

### B. Credentials létrehozása az n8n-ben

1. **Bal oldali menü** → **"Credentials"** gombra kattints
2. Kattints a **"+ Create New"** gombra
3. Keress rá: **"Postgres"** és válaszd ki
4. Töltsd ki az alábbi mezőket:
   \`\`\`
   Host: your-neon-host.neon.tech
   Port: 5432
   Database: soccer_analysis
   User: postgres
   Password: [jelszavad]
   SSL: Enable
   \`\`\`
5. Kattints: **"Test Connection"** → majd **"Save"**
6. Nevezd el: **"Soccer DB"** (vagy bármilyen név)

### C. Credentials hozzárendelése a node-okhoz

Kattints az alábbi node-okra és rendeld hozzájuk a "Soccer DB" credentialt:
- [ ] **Store League Data**
- [ ] **Store Match Data**
- [ ] **Load Patterns**
- [ ] **Load Match Data for Analysis**
- [ ] **Store Analysis Results**

Minden node-nál:
1. Jobb kattintás a node-ra
2. "Edit credential" → válaszd a "Soccer DB"-t
3. Kattints: "Save"

---

## 📧 2. LÉPÉS: Email (SMTP) Credentials Beállítása

### Opció A: Gmail (Ajánlott)

#### A1. Gmail App Password generálása

1. Menj ide: https://myaccount.google.com/security
2. Keress: **"App passwords"** vagy **"Alkalmazásjelszavak"**
3. Válaszd ki: **Mail** → **Windows Computer** (vagy más eszköz)
4. Generálj egy **16 karakteres jelszót** és másold ki!

#### A2. SendGrid Credential az n8n-ben

1. **Credentials** → **"+ Create New"**
2. Keress: **"SendGrid"** vagy **"SMTP"**
3. Válaszd: **"SendGrid"** (ha elérhető)
4. Töltsd ki:
   \`\`\`
   API Key: [a Gmail App Password vagy SendGrid API Key]
   \`\`\`
5. Mentsd el: **"Gmail SMTP"** vagy **"SendGrid"**

### Opció B: Egyéb SMTP (pl. Office365, ProtonMail)

Ha nem Gmail-t használsz:

1. **Credentials** → **"+ Create New"** → **"SMTP"**
2. Töltsd ki:
   \`\`\`
   Host: smtp.example.com (pl. smtp.office365.com)
   Port: 587 (vagy 465 SSL-hez)
   User: your-email@domain.com
   Password: [jelszó]
   Secure: TLS (vagy SSL)
   \`\`\`
3. Kattints: **"Test Connection"** → **"Save"**
4. Nevezd el: **"Email SMTP"**

#### B3. Hozzárendelés a Send Alert Email node-hoz

1. Kattints a **"Send Alert Email"** node-ra
2. **Credentials** → válaszd ki a savedault emailt
3. Kattints: **"Save"**

---

## ⚙️ 3. LÉPÉS: Workflow Configuration Paraméterek

Kattints a **"Workflow Configuration"** node-ra:

### A. League Name beállítása

1. Keress a node paraméterei között a **"leagueName"** sort
2. **Aktuális érték:** `<__PLACEHOLDER_VALUE__League Name__>`
3. **Módosítsd erre:**
   \`\`\`
   Premier League
   \`\`\`
   (vagy: La Liga, Serie A, Bundesliga, Ligue 1, stb.)

### B. Season beállítása

1. Keress a **"season"** sort
2. **Aktuális érték:** `<__PLACEHOLDER_VALUE__Season (e.g., 2023-2024)__>`
3. **Módosítsd erre:**
   \`\`\`
   2024-2025
   \`\`\`
   (vagy az aktuális szezonfélév)

### C. Módosítások mentése

Kattints: **"Save Node"** vagy **"Save Workflow"** (Ctrl+S)

---

## 📬 4. LÉPÉS: Send Alert Email Paraméterek

Kattints a **"Send Alert Email"** node-ra:

### A. From Email (Feladó)

1. Keress a **"fromEmail"** vagy **"From"** mezőt
2. **Módosítsd erre:**
   \`\`\`
   noreply@yourdomain.com
   \`\`\`
   vagy
   \`\`\`
   your-email@gmail.com
   \`\`\`

### B. To Email (Címzett)

1. Keress a **"toEmail"** vagy **"To"** mezőt
2. **Módosítsd erre:**
   \`\`\`
   your-email@example.com
   \`\`\`
   (ahova az alerteket akarod kapni)

### C. Subject (Tárgy)

1. **Szöveg:**
   \`\`\`
   Alert: Soccer Championship Pattern Detected - {{ $json.leagueName }}
   \`\`\`

### D. Email Body (Tartalom)

1. **HTML Body:**
   \`\`\`html
   <h2>Soccer Championship Analysis Alert</h2>
   <p><strong>Liga:</strong> {{ $json.leagueName }}</p>
   <p><strong>Szezón:</strong> {{ $json.season }}</p>
   <p><strong>Alert Üzenet:</strong></p>
   <p>{{ $json.alertMessage }}</p>
   <hr>
   <p><em>Ez egy automatikus üzenet az n8n Soccer Championship Analysis rendszerből.</em></p>
   \`\`\`

---

## 🔗 5. LÉPÉS: Send Webhook Notification (Opcionális)

Ha nem szeretnél webhook-ot használni:
- **Egyszerűen töröld ki ezt a node-ot** vagy hagyd **disabled** állapotban

Ha **szeretnél webhook-ot** (pl. Discord, Slack):

### A. Discord Webhook

1. Menj a Discord szerveredhez
2. **Channel Settings** → **Integrations** → **Webhooks**
3. **Create Webhook** → másold ki a **Webhook URL**-t
4. n8n **"Send Webhook Notification"** node-ban:
   \`\`\`
   URL: https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
   \`\`\`

### B. Slack Webhook

1. Menj ide: https://api.slack.com/apps
2. **Create New App** → **From scratch**
3. **Incoming Webhooks** → **On**
4. **Add New Webhook to Workspace** → másold ki az URL-t
5. n8n node-ban:
   \`\`\`
   URL: https://hooks.slack.com/services/YOUR_WEBHOOK_URL
   \`\`\`

### C. Hozzárendelés az n8n node-hoz

1. Kattints a **"Send Webhook Notification"** node-ra
2. Keress a **"url"** mezőt
3. Töltsd ki a webhook URL-t
4. Kattints: **"Save Node"**

---

## 🔑 6. LÉPÉS: PostgreSQL Táblák Létrehozása

Futtasd az alábbi SQL-t a **Neon Console**-ban (vagy lokális psql-ben):

\`\`\`sql
-- League Data tábla
CREATE TABLE IF NOT EXISTS league_data (
  id SERIAL PRIMARY KEY,
  league_name VARCHAR(255) NOT NULL,
  season VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Match Data tábla
CREATE TABLE IF NOT EXISTS match_data (
  id SERIAL PRIMARY KEY,
  league_id INTEGER REFERENCES league_data(id),
  match_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analysis Patterns tábla
CREATE TABLE IF NOT EXISTS analysis_patterns (
  id SERIAL PRIMARY KEY,
  league_id INTEGER REFERENCES league_data(id),
  pattern_name VARCHAR(255),
  pattern_definition JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analysis Results tábla
CREATE TABLE IF NOT EXISTS analysis_results (
  id SERIAL PRIMARY KEY,
  league_id INTEGER REFERENCES league_data(id),
  analysis_data JSONB NOT NULL,
  alert_triggered BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexek a gyorsabb lekérdezésekhez
CREATE INDEX IF NOT EXISTS idx_league_data_season ON league_data(league_name, season);
CREATE INDEX IF NOT EXISTS idx_match_data_league ON match_data(league_id);
CREATE INDEX IF NOT EXISTS idx_patterns_league ON analysis_patterns(league_id);
CREATE INDEX IF NOT EXISTS idx_results_league ON analysis_results(league_id);
\`\`\`

---

## ✅ Ellenőrző Lista - Végezz el minden lépést!

\`\`\`
[ ] PostgreSQL credential létrehozva és hozzárendelve mind az 5 Postgres node-hoz
    - [ ] Store League Data
    - [ ] Store Match Data
    - [ ] Load Patterns
    - [ ] Load Match Data for Analysis
    - [ ] Store Analysis Results

[ ] Email credential (SMTP / SendGrid) létrehozva és hozzárendelve

[ ] Workflow Configuration:
    - [ ] leagueName kitöltve (pl. "Premier League")
    - [ ] season kitöltve (pl. "2024-2025")

[ ] Send Alert Email:
    - [ ] fromEmail kitöltve (pl. "noreply@domain.com")
    - [ ] toEmail kitöltve (pl. "your-email@example.com")
    - [ ] subject és body beállítva

[ ] PostgreSQL táblák létrehozva

[ ] (Opcionális) Send Webhook Notification URL beállítva vagy node törölve

[ ] Workflow mentve (Ctrl+S)

[ ] Workflow aktiválva (jobb felső: Inactive → Active)
\`\`\`

---

## 🚀 7. LÉPÉS: Teszt Futtatás

### A. Webhook Test (Curl)

\`\`\`bash
curl -X POST https://your-n8n-instance.app.n8n.cloud/webhook/upload-csv \
  -H "Content-Type: application/json" \
  -d '{
    "leagueName": "Premier League",
    "season": "2024-2025",
    "csvDataUrl": "https://example.com/your-data.csv"
  }'
\`\`\`

### B. Workflow Test az n8n UI-ben

1. Kattints az **"Execute Workflow"** gombra (vagy F5)
2. Figyeld meg az **Execution Output**-ot
3. Ha hiba van, ellenőrizd az error message-eket

### C. Ellenőrzés az adatbázisban

\`\`\`sql
SELECT * FROM league_data ORDER BY created_at DESC LIMIT 1;
SELECT * FROM analysis_results ORDER BY created_at DESC LIMIT 1;
\`\`\`

---

## 🆘 Gyakori Hibák és Megoldások

### Hiba: "Connection refused on [host]:5432"
**Megoldás:** Ellenőrizd, hogy az adatbázis hostja helyes. Neon esetén: `*.neon.tech`

### Hiba: "SSL error"
**Megoldás:** Az n8n Postgres node-ban kapcsold be az SSL opciót

### Hiba: "SMTP authentication failed"
**Megoldás:** Nézd meg, hogy a jelszó helyes-e, vagy generálj újat Gmail-nél

### Hiba: "Webhook URL not found"
**Megoldás:** Ellenőrizd a webhook URL-t (Discord / Slack) és az n8n webhook ID-t

### Hiba: "No rows found"
**Megoldás:** Ellenőrizd, hogy a táblák léteznek-e az adatbázisban

---

## 📚 Hasznos Linkek

- **n8n Dokumentáció:** https://docs.n8n.io/
- **n8n Postgres Node:** https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.postgres/
- **Neon Docs:** https://neon.tech/docs/
- **Gmail App Passwords:** https://support.google.com/accounts/answer/185833
- **Discord Webhooks:** https://discord.com/developers/docs/resources/webhook
- **Slack Webhooks:** https://api.slack.com/apps

---

## 💡 Pro Tippek

1. **Testing:** Használd az n8n Debug node-ot az adatok vizsgálatához
2. **Error Handling:** Biztosítsd, hogy minden node-on be van állítva az "On Error" opció
3. **Logging:** Állítsd be a workflow-t, hogy logoljon az adatbázisba vagy egy log file-ba
4. **Scheduling:** Ha automatikus futtatást szeretnél, használd az n8n Cron triggert az alapértelmezett webhook helyett

---

**Kész vagy? Aktiváld a workflow-t és küldj egy CSV fájlt! 🎯**
