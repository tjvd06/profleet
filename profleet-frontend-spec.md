# proFleet 2.0 — Frontend Specification (Modern Design)

> **Purpose**: Complete spec for a modern B2B vehicle reverse-auction platform. Built with Next.js 14, Tailwind CSS, shadcn/ui. Designed for 2026 — clean, bold, premium feel.

---

## 1. Design System

### Design Philosophy
- **Premium B2B SaaS** aesthetic — think Linear, Vercel, Stripe
- Clean whitespace, bold typography, subtle depth through glassmorphism and gradients
- Dark navy hero sections with light content areas
- Cards with frosted glass effect (backdrop-blur + semi-transparent backgrounds)
- Smooth micro-animations on hover and page transitions (Framer Motion)
- NO sidebar login forms, NO 3-column layouts, NO red/gray color schemes
- Mobile-first responsive design

### Colors
```
--navy-950: #030B1A    (darkest — hero backgrounds, footer)
--navy-900: #0A1E3D    (dark sections)
--navy-800: #0F2D5E    (primary buttons, active states)
--navy-700: #163D7A    (hover states)
--blue-500: #3B82F6    (accent — links, badges, interactive elements)
--blue-400: #60A5FA    (light accent)
--blue-300: #93C5FD    (subtle highlights)
--cyan-400: #22D3EE    (gradient accent — used sparingly for energy)
--green-500: #22C55E   (success — savings badges, positive ratings)
--amber-500: #F59E0B   (warning — neutral ratings, alerts)
--red-500: #EF4444     (danger — negative ratings)
--slate-50: #F8FAFC    (page background)
--slate-100: #F1F5F9   (card backgrounds)
--slate-200: #E2E8F0   (borders)
--slate-500: #64748B   (secondary text)
--slate-900: #0F172A   (primary text)
--white: #FFFFFF
```

### Gradients
```
--gradient-hero: linear-gradient(135deg, #030B1A 0%, #0F2D5E 50%, #1E3A6E 100%)
--gradient-accent: linear-gradient(135deg, #3B82F6 0%, #22D3EE 100%)
--gradient-card-glow: radial-gradient(ellipse at top, rgba(59,130,246,0.15) 0%, transparent 60%)
--gradient-savings: linear-gradient(135deg, #22C55E 0%, #16A34A 100%)
--gradient-mesh-bg: subtle mesh gradient with navy/blue/cyan dots (for hero sections)
```

### Glassmorphism
```
Cards and floating elements:
  background: rgba(255, 255, 255, 0.7)
  backdrop-filter: blur(12px)
  border: 1px solid rgba(255, 255, 255, 0.2)
  border-radius: 16px

On dark backgrounds:
  background: rgba(255, 255, 255, 0.05)
  backdrop-filter: blur(16px)
  border: 1px solid rgba(255, 255, 255, 0.1)
```

### Typography
- Display/Hero: "Cal Sans" or "Instrument Serif" — large, bold, elegant
- Headings: "Inter" weight 600–700
- Body: "Inter" weight 400, 16px base, line-height 1.6
- Monospace/Prices: "JetBrains Mono" or "SF Mono" — tabular figures for price columns
- All prices displayed in tabular-nums for alignment

### Spacing & Layout
- Max content width: 1280px centered
- Section padding: 80px vertical (desktop), 48px (mobile)
- Card border-radius: 16px (large cards), 12px (small cards), 8px (buttons/badges)
- Card shadows: `0 4px 24px rgba(0,0,0,0.06)` default, `0 8px 32px rgba(0,0,0,0.12)` hover
- Page transitions: fade + slide-up (200ms ease-out)

### Component Patterns
- Buttons: rounded-xl, gradient fill for primary, ghost/outline for secondary
- Badges: pill-shaped, semi-transparent backgrounds with colored text
- Tables: clean borderless design, alternating subtle row backgrounds, sticky headers
- Inputs: rounded-lg, subtle border, focus ring in blue-500
- Tabs: underline style or pill-shaped toggle group
- Modals: centered overlay with glassmorphism backdrop
- Toast notifications: bottom-right, slide-in animation

---

## 2. User Roles

### Role A: "Nachfrager" (Buyer)
- Small businesses, freelancers, tradespeople
- Creates tenders, configures vehicles, reviews offers, rates dealers
- Free to use

### Role B: "Anbieter" (Dealer)
- Verified car dealers, leasing companies, banks
- Receives tenders, submits offers, manages contacts
- Pays per successful customer contact (30€)

### Role C: Public (Not logged in)
- Can browse tenders and instant offers (read-only)
- Must register to participate

---

## 3. Global Layout

### 3.1 Top Navigation (All Pages)

**Sticky top bar** — transparent on hero sections, white with shadow on scroll:

Left side:
- Logo: "proFleet" wordmark (bold, white on dark / navy on light) + small tagline "Fahrzeugausschreibungen für Unternehmen"

Center:
- Nav links (desktop): Startseite, So funktioniert's, Ausschreibungen, Sofort-Angebote, Für Händler
- Each link has subtle hover underline animation

Right side (NOT logged in):
- "Anmelden" text button (ghost style)
- "Kostenlos starten" primary button (gradient accent)

Right side (logged in):
- Notification bell icon with badge count
- User avatar dropdown menu → Mein Dashboard, Profil, Einstellungen, Abmelden

**Mobile**: Hamburger menu → full-screen overlay with navigation links + auth buttons

### 3.2 Footer (All Pages)

Dark navy background (navy-950) with subtle gradient mesh pattern:

4-column grid:
- Column 1 "proFleet": Logo, short description, social media icons
- Column 2 "Plattform": Ausschreibungen, Sofort-Angebote, Für Nachfrager, Für Händler
- Column 3 "Unternehmen": Über uns, Presse, Karriere, Kontakt
- Column 4 "Rechtliches": AGB, Datenschutz, Impressum, Cookie-Einstellungen

Bottom bar: "© 2026 proFleet GmbH. Alle Rechte vorbehalten."

### 3.3 Auth Pages (Separate Full-Screen Pages)

**Login page** (/anmelden):
- Split screen: left half = navy gradient with proFleet branding + testimonial quote, right half = white with login form
- Form: E-Mail input, Passwort input, "Anmelden" button, "Passwort vergessen?" link
- Below form: "Noch kein Konto?" → link to registration
- Social login buttons (optional): Google, Microsoft

**Registration page** (/registrieren):
- Same split-screen layout
- Step 1: Rolle wählen — two large clickable cards:
  - "Fahrzeuge beschaffen" (Nachfrager) — with icon and description
  - "Fahrzeuge anbieten" (Anbieter) — with icon and description
- Step 2: Registration form (fields depend on role)
  - Nachfrager: Firma, Name, E-Mail, Passwort, Branche, PLZ
  - Anbieter: Firmenname, Name, E-Mail, Passwort, Händlertyp (Vertragshändler/Leasingfirma/Bank), Marken (multi-select), PLZ

### 3.4 Dashboard Layout (Logged In)

**NO traditional sidebar.** Instead use a modern layout:

**Top navigation** (same as 3.1 but with user menu)

**Dashboard sub-navigation** — horizontal tab bar directly below the top nav:
- Nachfrager tabs: Übersicht, Neue Ausschreibung, Meine Ausschreibungen, Sofort-Angebote, Bewertungen
- Anbieter tabs: Übersicht, Eingang, Meine Angebote, Sofort-Angebote, Bewertungen, Rechnungen

On mobile: horizontal scrollable tab bar

**Content area**: Full-width, max-w-7xl centered, with clean card-based layout

---

## 4. Public Pages

### 4.1 Homepage

**Section 1 — Hero** (full-width, navy gradient background with animated mesh dots):
- Large heading: "Neuwagen einkaufen wie die Großen"
- Subheading: "Die Ausschreibungsplattform für Unternehmen. Konfigurieren Sie Ihr Wunschauto, erhalten Sie Top-Angebote von Händlern aus ganz Deutschland — kostenlos und anonym."
- Two CTA buttons: "Jetzt Ausschreibung starten" (gradient primary) + "So funktioniert's" (ghost white outline)
- Below CTAs: Trust badges row — "Kostenlos für Nachfrager" · "Über X Händler" · "Ø 14% Ersparnis"
- Right side or below: floating glassmorphism card showing a live/example tender with animated price dropping

**Section 2 — Logos/Social Proof** (light background):
- "Vertraut von Unternehmen in ganz Deutschland"
- Row of company/brand logos (grayscale, subtle)

**Section 3 — So funktioniert's** (white background):
Three-step horizontal cards with large step numbers and icons:
1. "Fahrzeug konfigurieren" — "Wählen Sie Marke, Modell und Ausstattung — oder laden Sie eine fertige Konfiguration hoch."
2. "Angebote erhalten" — "Händler aus ganz Deutschland bieten auf Ihre Ausschreibung. Sie bleiben anonym."
3. "Bestes Angebot wählen" — "Vergleichen Sie Preise, Leasing- und Finanzierungsraten. Kontaktieren Sie Ihren Wunschhändler."
Below steps: "Jetzt starten" CTA button

**Section 4 — Live-Ersparnisse** (light slate background):
- Section heading: "Aktuelle Ersparnisse auf proFleet"
- Filter bar: Brand pills (Alle, Audi, BMW, Mercedes, VW, etc.) + Type toggle (Kauf / Leasing / Finanzierung)
- Grid of TenderResultCards (2-3 columns):
  Each card shows:
  - Vehicle image placeholder (brand logo or generic car silhouette)
  - Vehicle name: "Audi A4 Avant RS4 · 420 PS"
  - Color dot + color name
  - List price (struck through, muted): "UVP 89.138 €"
  - proFleet price (large, bold): "75.411 €"
  - Savings badge (green gradient pill): "Gespart 15,4%"
  - Bottom row: Buyer rating badge + Dealer rating badge
  - Subtle hover: card lifts with shadow, slight scale
- "Alle Ausschreibungen ansehen →" link below grid
- Pagination or "Mehr laden" button

**Section 5 — Für Händler CTA** (navy gradient section):
- Heading: "Sie sind Händler, Leasingfirma oder Bank?"
- Subtext: "Erreichen Sie kaufbereite Geschäftskunden aus ganz Deutschland. Sie zahlen nur bei erfolgreichem Kundenkontakt."
- CTA: "Als Anbieter registrieren" (white button)
- Feature badges: "30€ pro Kontakt" · "Bundesweite Reichweite" · "Keine Grundgebühr"

**Section 6 — Erfahrungsberichte** (white):
- Testimonial carousel/grid with quote cards (glassmorphism style):
  - Quote text in large italic
  - Author: name, profession, savings achieved
  - Star rating or percentage
- Auto-scrolling on desktop, swipeable on mobile

**Section 7 — FAQ accordion** (light background):
- Common questions: "Ist proFleet wirklich kostenlos?", "Bleibe ich anonym?", "Welche Händler nehmen teil?", etc.

**Section 8 — Final CTA** (gradient navy):
- "Bereit für Ihre erste Ausschreibung?"
- "Kostenlos starten" button

### 4.2 Ausschreibungen (Active Tenders)

**Page header**: Clean title "Laufende Ausschreibungen" + subtitle with count "X aktive Ausschreibungen"

**Filter bar** (sticky on scroll, glassmorphism background):
- Search input (with search icon): "Marke oder Modell suchen..."
- Brand dropdown (multi-select with checkboxes)
- Model series dropdown (filtered by brand)
- Type pills: Kauf · Leasing · Finanzierung (toggle, multi-select)
- Price toggle: Brutto / Netto (switch component)
- Sort dropdown: Neuste zuerst, Ablauf bald, Höchste Ersparnis

**Tender cards** (vertical list or 2-column grid):
Each card:
- Left section:
  - Brand logo (small)
  - Vehicle: "Audi A4 Avant RS4 · 420 PS · schwarz"
  - Delivery: "München · 100 km Umkreis"
  - Tender period with countdown: "Noch 3 Tage 14 Std."
  - Progress bar showing time elapsed
- Right section:
  - List price: "UVP 89.138 €"
  - Current best bid: "75.411 €" (large, bold)
  - Savings badge: "– 15,4%"
  - Number of offers: "7 Angebote"
  - Buyer + top dealer rating badges
- CTA: "Details ansehen →"
- Hover: subtle lift + glow effect

**Empty state**: Illustration + "Keine Ausschreibungen gefunden. Passen Sie Ihre Filter an."

Pagination: numbered pages or infinite scroll with "Mehr laden"

### 4.3 So funktioniert's

**Tab navigation** at top: "Für Nachfrager" | "Für Händler & Leasingfirmen"

#### Tab: Für Nachfrager
Visual step-by-step flow (vertical timeline with alternating left/right content):

Step 1: "Fahrzeug konfigurieren"
- Description + mini screenshot/illustration
- "Nutzen Sie unseren Konfigurator, laden Sie eine bestehende Konfiguration hoch, oder wählen Sie Mindestausstattungen."

Step 2: "Ausschreibung starten"
- "Legen Sie Lieferort, Wunschtermin und gewünschte Angebotsarten fest. Ihre Ausschreibung wird anonym veröffentlicht."

Step 3: "Angebote vergleichen"
- "Händler aus ganz Deutschland bieten auf Ihr Fahrzeug. Sie sehen alle Angebote übersichtlich im Vergleich."

Step 4: "Kontakt aufnehmen"
- "Wählen Sie das beste Angebot und nehmen Sie Kontakt zum Händler auf. Erst dann wird Ihre Identität offengelegt."

Step 5: "Bewerten"
- "Bewerten Sie den Händler — das Bewertungssystem sorgt für Qualität auf der Plattform."

Below: Rules section (clean card):
- "Erstellen Sie nur Ausschreibungen für echten Fahrzeugbedarf"
- "Gegenseitige Bewertung sichert die Qualität"
- CTA: "Jetzt kostenlos registrieren"

#### Tab: Für Händler
Same visual timeline format:
- Step 1: "Ausschreibungen erhalten" — automatic matching by brand/region
- Step 2: "Angebote erstellen" — quick offer form, side-by-side with tender details
- Step 3: "Kundenkontakt" — exclusive contact on acceptance, 30€ per contact
- Step 4: "Zusätzlich: Sofort-Angebote" — list stock vehicles proactively
- Rules + pricing info + CTA: "Als Anbieter registrieren"

### 4.4 Sofort-Angebote (Instant Offers Marketplace)

**Page header**: "Sofort-Angebote" + "Attraktive Neuwagen direkt vom Händler"

**Filter bar** (same style as tenders):
- Brand search/dropdown
- Model dropdown
- Price range slider (min–max)
- Location: PLZ input + radius dropdown
- Sort: Preis aufsteigend, Neueste, Größte Ersparnis

**Offer cards** (grid, 3 columns desktop):
Each card (vertical card layout):
- Vehicle image/placeholder at top
- Brand + Model: "Audi A3 Sportback 2.0 TDI DPF"
- Trim/Color: "Attraction · shadowgrey metallic"
- Specs row: "136 PS · Automatik · Kombi"
- Divider
- Price section:
  - "UVP" struck through: "32.895 €"
  - "Kaufpreis" large bold: "28.400 €" 
  - Savings badge: "– 13,7%"
- Leasing pill: "ab 298 €/Monat"
- Financing pill: "ab 233 €/Monat"
- Dealer info row: anonymous name + rating badge
- Location: "München · 100 km"
- CTA button: "Angebot ansehen"
- Secondary action: bookmark/heart icon "Merken" (requires login)

---

## 5. Buyer Dashboard (Nachfrager)

### 5.0 Dashboard Overview (Übersicht)

**Welcome section**: "Willkommen zurück, [Vorname]"

**Stats row** (4 metric cards with icons):
- Aktive Ausschreibungen: [count]
- Eingegangene Angebote: [count]  
- Durchschnittliche Ersparnis: [X%]
- Offene Bewertungen: [count] (amber warning if > 0)

**Quick actions** (2 prominent cards):
- "Neue Ausschreibung erstellen" (gradient primary, large, with arrow icon)
- "Sofort-Angebote durchsuchen" (outline style)

**Recent activity feed**: Latest offers received, status changes, rating reminders

### 5.1 Neue Ausschreibung — Multi-Step Wizard

**Full-width wizard** with progress stepper at top:
Steps: ① Fahrzeug → ② Details → ③ Leasing & Finanzierung → ④ Lieferung → ⑤ Veröffentlichen

Progress bar: filled gradient for completed steps, blue dot for current, gray for upcoming. Step labels visible on desktop, numbers only on mobile.

#### Step 1: Fahrzeug konfigurieren

**Method selection** — three large clickable cards in a row:

Card 1: "Konfigurator" (recommended badge)
- Icon: settings/sliders
- "Konfigurieren Sie Ihr Fahrzeug Schritt für Schritt mit allen Ausstattungsdetails."

Card 2: "Datei hochladen"
- Icon: upload cloud
- "Laden Sie eine vorhandene Konfiguration als PDF, Word oder Textdatei hoch."

Card 3: "Mindestausstattung"
- Icon: checklist
- "Legen Sie nur die wichtigsten Ausstattungsmerkmale fest."

(If user has saved tenders: Card 4: "Gespeicherte Ausschreibung laden")

**After method selection — Vehicle Form** (clean card layout):

Section "Grunddaten":
- Row 1: Fahrzeugart toggle (PKW / NFZ) · Marke dropdown · Modellreihe dropdown (filtered)
- Row 2: Vollständige Modellbezeichnung (text) · Ausstattungslinie (text)
- Row 3: Karosserieform dropdown · Anzahl Türen dropdown · Kraftstoffart dropdown · Getriebe dropdown
- Row 4: Motorleistung kW (number) · auto-calculated PS display · Allradantrieb toggle (Ja/Nein)
- Row 5: Farbe (text) · Metallic checkbox
- Row 6: Listenpreis netto (currency input, € symbol) · Listenpreis brutto (auto-calculated, read-only)

If method = "Datei hochladen": Same basic data form + drag-and-drop file upload zone below ("Konfiguration hierher ziehen oder klicken zum Auswählen — PDF, DOC, TXT")

If method = "Mindestausstattung": Same basic data form + equipment checkbox grid:
- 4-column responsive grid of toggle chips:
  Klimaautomatik, Klimaanlage, Schiebedach, El. Fensterheber, El. Sitzverstellung, Radio/CD, Navigationssystem, Handyvorbereitung, Xenon/LED, Dieselpartikelfilter, Sitzheizung, Standheizung, Tempomat, Einparkhilfe, Lederausstattung, Leichtmetallfelgen, Sportfahrwerk, Breitreifen, Sportsitze, Sportlenkrad
- "Sonstige Ausstattungen" textarea

**Multi-vehicle info box** (collapsible):
- "Mehrere Fahrzeuge einer Marke? Sie können nach der Konfiguration weitere Fahrzeuge hinzufügen und einen Paketpreis anfragen."

**Bottom bar**: "Zurück" ghost button · "Weiter" primary button

#### Step 2: Weitere Details

**Sticky mini-header** showing configured vehicle: "Fahrzeug 1: Audi A3 Sportback 2.0 TDI DPF"

Section "Stückzahl & Rahmenverträge" (card):
- Anzahl identischer Fahrzeuge: number stepper (default 1)
- Großkundenvertrag: toggle + percentage input ("Rabatt vom Listenpreis")
  - Checkbox: "Kein Großkundenvertrag vorhanden"
- Sondervereinbarungen: toggle + percentage input
  - Checkbox: "Keine Sondervereinbarungen vorhanden"

Section "Alternative Angebote erwünscht" (card with toggle rows):
- "Andere Farbe akzeptabel" — toggle + if yes: Alternativfarbe input + Metallic checkbox
- "Höhere Ausstattung akzeptabel" — toggle
- "Nicht alle Ausstattungswünsche erfüllt" — toggle
- "Tageszulassung akzeptabel" — toggle

#### Step 3: Leasing & Finanzierung

Section "Angebotsarten" (card):
- "Ich möchte Angebote zu:" — three toggle cards:
  - ✓ Kauf (always on)
  - Leasing — toggle on/off, if on:
    - Laufzeit dropdown (12–60 Monate)
    - KM/Jahr dropdown (10.000–50.000)
    - Anzahlung dropdown (0%–50%)
    - Fahrzeugeinsatz dropdown (Dienstwagen, Außendienst, Transport, etc.)
  - Finanzierung — toggle on/off, if on:
    - Laufzeit dropdown
    - Anzahlung dropdown
    - Max. Restzahlung dropdown

#### Step 4: Lieferung

Section "Auslieferung" (card):
- PLZ input + Ortsname input (auto-suggest)
- "oder im Umkreis von" dropdown (25–200 km)
- Liefertermin: von (date picker) — bis (date picker)

Section "Ausschreibungsradius" (card):
- Radio options:
  - "Bundesweit" (recommended, default)
  - "Im Umkreis von X km um den Auslieferungsort" + dropdown

Section "Wunschhändler" (collapsible card):
- "Möchten Sie einen bestimmten Händler einbeziehen?"
- Toggle — if yes: Name, PLZ, Ort, Straße inputs



#### Step 5: Veröffentlichen

**Summary card** — complete overview of the tender in a clean read-only layout:
- Vehicle details, configuration method, equipment
- Pricing preferences (Kauf/Leasing/Finanzierung)
- Delivery location and dates
- All settings at a glance
- "Bearbeiten" links next to each section to jump back

"Weiteres Fahrzeug hinzufügen" button (adds another vehicle to this tender, same brand)

**Publication options** (card):
- Laufzeit: choice pills (7 Tage · 10 Tage · 14 Tage)
- Three action buttons stacked:
  1. "Ausschreibung veröffentlichen" (large gradient primary CTA)
  2. "Zeitgesteuert veröffentlichen" (outline) — expands: date + time pickers
  3. "Als Entwurf speichern" (ghost/text button)

**Success state** (after publishing):
- Confetti/checkmark animation
- "Ihre Ausschreibung ist live!"
- "Wir benachrichtigen Sie, sobald Angebote eingehen."
- CTA: "Zur Übersicht" / "Weitere Ausschreibung erstellen"

### 5.2 Meine Ausschreibungen

**Tab bar**: Laufende · Abgeschlossene · Entwürfe

**Sort & Filter bar**: Sort dropdown (Neueste, Ablauf bald) · Brutto/Netto switch

#### Tab: Laufende

Per tender — expandable card:

**Card header** (always visible):
- Vehicle: "Audi A3 Attraction · 1 Fahrzeug"
- Tender ID badge: "AU23435"
- Status pill: "Läuft · Noch 3 Tage"
- Countdown timer (live)
- Offer count: "7 Angebote erhalten"
- Expand/collapse chevron

**Card expanded content**:
- "Listenpreis gesamt: 92.357 €" · "Bestes Angebot: 78.100 €" · savings badge

**Offers table** (clean, modern table):
| Angebot | Händler | Bewertung | Kaufpreis | Ersparnis | Leasingrate | Finanzrate | Aktion |
Each row:
- Offer ID
- Dealer anonymous name + "WH" badge if preferred dealer
- Rating percentage with colored dot (green/amber/red)
- Price in bold
- Savings % in green
- Leasing rate (if applicable): "298 €/36M"
- Finance rate (if applicable): "233 €/48M"
- "Kontakt aufnehmen" button (primary small) or "Details" link

Sort: by column headers (click to sort)

For multi-vehicle tenders: expandable sub-rows per vehicle + package total

**Warning banner** at bottom:
- "Mit dem Kontaktklick beenden Sie die Ausschreibung. Sie können max. 3 Kontakte aufnehmen."

#### Tab: Abgeschlossene

Same card layout, plus **Status Section** per contacted offer:

Status tracker component (horizontal stepper):
① Kontakt aufgenommen → ② Vertrag abgeschlossen → ③ Bewertung abgegeben

Each step: checkbox + label. Forced sequential completion.

- "Anbieter hat sich gemeldet:" Ja/Nein toggle
- "Vertrag zustande gekommen:" Ja/Nein toggle
- Rating input: three colored buttons (Positiv/Neutral/Negativ) + optional comment

**Info box**: "Sie haben X von 3 Kontaktklicks verwendet. Nach Bewertung des ersten Kontakts können Sie weitere Kontakte aufnehmen."

After first rating: remaining offers show "Kontakt aufnehmen" button again

#### Tab: Entwürfe

Card list of saved/unpublished tenders with status labels and "Bearbeiten" / "Veröffentlichen" / "Löschen" actions.

### 5.3 Meine Sofort-Angebote (Bookmarked)

Grid of bookmarked instant offers (same card design as public marketplace).

Per offer: status tracking same as completed tenders (Kontakt → Vertrag → Bewertung).

Limit: 5 contact requests total for instant offers.

### 5.4 Bewertungen & Statistik

**Two sections** as clean stat cards:

**Section 1: "Erhaltene Bewertungen"**
- Large number: overall rating percentage with colored ring chart
- Breakdown: Positiv X% · Neutral X% · Negativ X%
- "Gesamt" + "Letzte 6 Monate" columns

**Section 2: "Ihre Aktivitäten"**
- Stat rows:
  - Anbieterkontakte (Kontaktklicks): X
  - Davon mit Vertragsabschluss: X%
  - Bewertungen abgegeben: X%
  - Nicht abgeschlossene Ausschreibungen: X
  - Zurückgezogene Ausschreibungen: X
- Also split into "Gesamt" + "Letzte 6 Monate"

**Free-tier usage card** (for normal users):
- "Diesen Monat: X/3 Konfigurationen · X/3 Ausschreibungen"
- Progress bars
- "Mehr benötigt? → Profi-Konto upgraden"

---

## 6. Dealer Dashboard (Anbieter)

### 6.0 Dashboard Overview

**Stats row** (metric cards):
- Neue Ausschreibungen: [count] (with "Neu" badge if unseen)
- Offene Angebote: [count]
- Kontaktwünsche: [count]
- Bewertung: [X%]

**Quick actions**:
- "Ausschreibungen ansehen" (primary)
- "Sofort-Angebot erstellen" (secondary)

**Recent activity feed**: new tenders matching dealer's brands, offer ranking changes, contact requests

### 6.1 Eingang Ausschreibungen

**Filter bar**: Brand filter, Model filter, Sort (Neueste, Ablauf bald), Brutto/Netto switch

**Tender cards** (list):
Each card:
- Header row: "Audi · 3 Fahrzeuge" + Tender ID + Status badge ("Neu" / "Bereits beantwortet")
- Buyer info: anonymous name + profession + rating badge
- Period: start–end with countdown
- Requested types: Kauf/Leasing/Finanzierung as pill badges
- Delivery: "München · 100 km"
- **Vehicle table** (compact, inside card):
  | Modell | UVP | Top-Kauf | Top-Leasing | Top-Finanz |
  - Per vehicle row + package total if multi-vehicle
- Special alert banner (amber): "Dieser Kunde hat Sie als Wunschhändler ausgewählt"
- CTA: "Angebot erstellen" (primary) or "Ansehen" (if already responded)

### 6.2 Angebot erstellen — Split View

**IMPORTANT**: This is a modern side-by-side layout (not the old 2006 table design):

**Left panel** (sticky scroll, 45% width, light slate background):
- Title: "Ausschreibung" + ID
- Read-only tender details in clean card sections:
  - Buyer info card: name, profession, rating, member since
  - Vehicle card: all specs neatly formatted
  - "Vollständige Konfiguration ansehen" expandable/modal
  - Requirements card: color preferences, alternative acceptance flags
  - Delivery card: location, dates, radius
  - Contract card: fleet discount info

**Right panel** (55% width, white background, scrollable form):
- Title: "Ihr Angebot"
- Step indicator or sections with anchor links

**Section 1: Fahrzeug-Konfiguration**
- "Bieten Sie exakt die nachgefragte Konfiguration an?" — prominent Ja/Nein toggle
- If Ja:
  - Netto-Listenpreis input (for verification)
  - Color confirmation checkboxes
  - Tageszulassung toggle + date/km fields
- If Nein (deviation):
  - Tab selection: "Abweichungen eintragen" | "Neue Konfiguration" | "Datei hochladen"
  - Abweichungen: color change, Mehr-/Minderausstattungen textareas, Tageszulassung fields
  - Neue Konfiguration: opens configurator modal
  - Datei: drag-and-drop upload zone

**Section 2: Lieferung**
- PLZ + Ort inputs
- Entfernung zum Wunschort (auto-calculated or manual)
- Frühester Liefertermin date picker

**Section 3: Vertragsdaten**
- Großkundenvertrag: toggle + Rabatt % input
- Sondervereinbarungen: toggle + Rabatt % input
- Angebotene Anzahl: number input

**Section 4: Preise** (highlighted section with gradient border)
- Kaufpreis netto: large currency input
- If leasing requested:
  - Leasingrate monatlich netto: currency input
  - Terms (pre-filled from tender, editable): Laufzeit, KM, Anzahlung, Einsatz
- If financing requested:
  - Finanzierungsrate monatlich netto: currency input
  - Terms: Laufzeit, Anzahlung, Restzahlung
- MwSt percentage input (default 19%)

**Section 5: Zusatzkosten**
- Überführungskosten netto: currency
- Zulassungskosten netto: currency
- Netto-Gesamtpreis: currency (auto-calculated or manual)

**For multi-vehicle tenders**: "Weiter zu Fahrzeug 2 →" button (paginated within the form)

**Bottom action bar** (sticky):
- "Angebot speichern und absenden" (gradient primary, large)
- "Als Entwurf speichern" (ghost)

### 6.3 Meine Angebote

**Tab bar**: Laufende · Kontaktwunsch erhalten · Archiv

#### Tab: Laufende

Per tender responded to — card:
- Tender info header + buyer details
- **Your offers table**:
  | Datum | Ihr Preis | Top-Preis | Ihre Leasing | Top-Leasing | Ihre Finanz | Top-Finanz | Ranking |
  - Ranking shown as "#1", "#2" etc. with colored badge (gold for #1, silver #2, etc.)
- "Angebot überarbeiten" button on latest offer
- "Neues Angebot abgeben" button (creates revised offer)

#### Tab: Kontaktwunsch erhalten

Same layout + status tracker:
① Kontakt aufgenommen → ② Vertrag abgeschlossen → ③ Bewertung
- Forced sequential steps
- "Der Kontakt ist offen" / "Abgeschlossen" status

#### Tab: Archiv

Past tenders with historical offer data (read-only).

### 6.4 Sofort-Angebote (Dealer Management)

**Tab bar**: Erstellen · Laufende · Archiv

#### Erstellen

Method selection (same 3 cards as buyer):
1. Datei hochladen
2. Konfigurator
3. Gespeichertes Angebot

Vehicle form → Pricing form:
- Delivery location + radius + dates
- Kauf toggle + price
- Leasing toggle + terms + rate
- Finanzierung toggle + terms + rate
- Additional costs section
- "Anzahl identische Fahrzeuge" stepper
- Publication: Laufzeit pills (7/14/30 Tage) + publish buttons

#### Laufende

Per offer: vehicle details + pricing table + contact requests table:
| Kontakt | Von | Datum | Bewertung | Status: Kontakt → Vertrag → Bewertung |
Each row has sequential status tracking.

### 6.5 Bewertungen & Statistik

Same layout as buyer (Section 5.4), from dealer perspective:
- "Von Nachfragern erhaltene Bewertungen"
- "Ihre Statistik als Anbieter"

### 6.6 Rechnungen

**Month selector** (horizontal scrollable pills or dropdown)

Per month — expandable card:
- Month/Year header + total amount prominent

**Invoice table**:
| Posten | Kostenlos | Kostenpflichtig | Preis/Stück | Gesamt |
| Konfigurationen erstellt | 3 | 3 | 5,00 € | 15,00 € |
| Sofort-Angebote eingestellt | 5 | 2 | 3,00 € | 6,00 € |
| Kontaktdaten (Ausschreibungen) | 3 | 5 | 30,00 € | 150,00 € |
| Kontaktdaten (Sofort-Angebote) | 4 | 0 | 10,00 € | 0,00 € |
| **Summe netto** | | | | **171,00 €** |
| **Summe inkl. MwSt.** | | | | **203,49 €** |

"Details anzeigen" expandable → individual line items
"Rechnung herunterladen (PDF)" button

---

## 7. Reusable Components

### VehicleCard — Displays vehicle summary with brand, specs, price, savings badge
### TenderCard — Tender overview with countdown, offers count, best price
### OfferTable — Sortable comparison table for offers (price, leasing, financing, rating)
### SavingsBadge — Green gradient pill showing "– X,X%"
### RatingBadge — Circular or pill badge with percentage and color coding
### StatusTracker — Horizontal 3-step progress (Kontakt → Vertrag → Bewertung)
### VehicleConfigForm — Reusable form for all vehicle configuration scenarios
### PricingForm — Kauf/Leasing/Finanzierung conditional input group
### WizardStepper — Multi-step form progress bar with gradient fill
### SplitPaneLayout — Dual-column sticky-left scrollable-right layout
### FilterBar — Glassmorphism sticky filter bar with search, dropdowns, toggles
### StatCard — Metric display card with icon, number, label, trend indicator
### EmptyState — Illustration + message + CTA for empty lists

---

## 8. Key Business Rules

- Buyers anonymous until "Kontaktklick" (contact click)
- Max 3 contacts per tender (2 additional after completing first rating)
- Dealers bound to offers for tender duration + 1 week (max 3 weeks)
- Offer ranking: by purchase price, or leasing rate, or financing rate
- All dealer-facing prices displayed as Netto
- Free tier: 3 configurations + 3 tenders per month
- Dealer fees: 30€/contact (tenders), 10€/contact (instant offers), 5€/configuration, 3€/instant offer listing
- Ratings: positive/neutral/negative — displayed as percentage
- Forced rating sequence: must confirm contact → confirm contract → submit rating

---

## 9. Technical Notes

### Routing Structure
```
/                           → Homepage
/ausschreibungen            → Active tenders (public)
/ausschreibungen/[id]       → Tender detail (public view)
/so-funktionierts           → How it works
/sofort-angebote            → Instant offers marketplace
/sofort-angebote/[id]       → Offer detail
/fuer-haendler              → Dealer landing page
/anmelden                   → Login (full-screen)
/registrieren               → Registration (full-screen)

/dashboard                  → Buyer or Dealer overview (role-based)
/dashboard/ausschreibung/neu        → Create tender wizard
/dashboard/ausschreibungen          → My tenders (tabs)
/dashboard/ausschreibungen/[id]     → Tender detail + offers
/dashboard/sofort-angebote          → My instant offers (buyer bookmarks / dealer management)
/dashboard/sofort-angebote/neu      → Create instant offer (dealer)
/dashboard/eingang                  → Incoming tenders (dealer)
/dashboard/eingang/[id]/angebot     → Create offer (dealer, split view)
/dashboard/angebote                 → My offers (dealer, tabs)
/dashboard/bewertungen              → Ratings & stats
/dashboard/rechnungen               → Invoices (dealer)
/dashboard/profil                   → Profile settings
```

### Database Entities (simplified)
- Users (id, role, email, company, name, profession, rating_pct, registered_at)
- Tenders (id, buyer_id, status, start_at, end_at, delivery_plz, delivery_city, delivery_radius, tender_scope)
- TenderVehicles (id, tender_id, config_method, brand, model, specs, equipment, list_price, quantity)
- Offers (id, tender_id, dealer_id, status, created_at, pricing, delivery, deviation_type)
- OfferVehicles (id, offer_id, vehicle_id, config, price, lease_rate, finance_rate)
- Contacts (id, tender_or_offer_id, buyer_id, dealer_id, status_steps)
- Ratings (id, from_id, to_id, contact_id, type, comment)
- InstantOffers (id, dealer_id, vehicle, pricing, status, period)
- Invoices (id, dealer_id, month, line_items)

### Real-Time Features
- Live bid updates on active tenders (WebSocket or SSE)
- Push notifications for new offers, contact requests, rating reminders
- Countdown timers on tender end dates
- Animated savings counter on homepage
