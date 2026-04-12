# Creative Asset Validator

[English](README.md) | [Français](README.fr.md) | [Español](README.es.md) | [中文](README.zh.md) | [Nederlands](README.nl.md) | [Русский](README.ru.md) | [한국어](README.ko.md)

## Enterprise-grade creatief intelligentieplatform

<div align="center">

![Version](https://img.shields.io/badge/version-5.11.0-blue.svg)
![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)
![Platform](https://img.shields.io/badge/platform-Web-green.svg)
![AI Powered](https://img.shields.io/badge/AI-Powered-purple.svg)

**De complete oplossing voor het valideren, organiseren en optimaliseren van creatieve advertentie-assets op 50+ platforms met kogelvrije datapersistentie.**

> 🎉 **NIEUW: v5.11.0 is er!** - 100% betrouwbaarheid bij verwijdering, nul console-errors, diagnostiek van wereldklasse. [Bekijk wat er nieuw is →](README-v5.11.0.md)

[Snel starten](#snel-starten) | [v5.11.0 Docs](README-v5.11.0.md) | [Functies](#kernfuncties) | [Deployment](#deployment)

</div>

---

## Het probleem dat we oplossen

In digitale advertenties staan creatieve teams dagelijks voor een uitdaging: ervoor zorgen dat elke asset voldoet aan de exacte specificaties van tientallen verschillende platforms. Eén verkeerd geformatteerd creatief kan leiden tot afgewezen advertenties, verspilde campagnebudgetten en gemiste marktkansen.

Traditionele workflows omvatten:
- Handmatig dimensies controleren tegen verspreide documentatie
- Eindeloze herformatvariaties maken voor elk platform
- Uit het oog verliezen welke klanten welke formaten nodig hebben
- Zoeken in ongeorganiseerde mapstructuren
- Missen van merkrichtlijnen en nalevingsvereisten

Deze inefficiënties kosten agentschappen en marketingteams duizenden uren per jaar.

## Onze oplossing

Creative Asset Validator is een uitgebreid platform dat de gehele creatieve asset-workflow automatiseert. Gebouwd voor marketingteams, agentschappen en ondernemingen, valideert het assets tegen platformspecificaties, organiseert ze intelligent en benut AI om creatieve prestaties te optimaliseren.

Het platform draait volledig in de browser met optionele cloudsynchronisatie, zonder complexe backend-infrastructuur, terwijl het enterprise-grade beveiliging en samenwerkingsfuncties biedt.

---

## Kernfuncties

### Assetbibliotheek en validatie

Het centrale punt voor alle creatieve assets. Upload afbeeldingen en video's via drag-and-drop, en het systeem valideert ze automatisch tegen specificaties van meer dan 50 advertentieplatforms, waaronder YouTube, TikTok, Meta, Google Ads, DV360, The Trade Desk en connected TV-netwerken.

- Automatische dimensie- en formaatvalidatie
- Controle op bestandsgrootte en duur
- Visuele statusindicatoren per platform
- Maporganisatie met tags en favorieten
- Scheiding van persoonlijke en teamopslag

### AI-aangedreven creatieve analyse

Benut meerdere AI-providers om creatieve effectiviteit te analyseren:

- **Hook-analyse**: Beoordeel de eerste seconden voor aandachtvangst
- **CTA-detectie**: Evalueer duidelijkheid en plaatsing van de call-to-action
- **Merknaleving**: Controleer logoplaatsing, kleuren en richtlijnen
- **Prestatievoorspelling**: Schat engagement, CTR en conversiepotentieel

Het systeem orkestreert Claude, GPT-4 en Gemini voor een uitgebreide analyse vanuit meerdere perspectieven.

### Merkkit-generator

Transformeer één logo in een compleet pakket merkassets. Upload één hoge-resolutie logo en genereer meer dan 100 formaatvaritaties:

- Profielafbeeldingen en omslagen voor sociale media
- Google Ads bannerformaten
- Favicons en app-iconen
- E-mailhandtekeningen
- Drukklare formaten

Elke variatie behoudt de juiste beeldverhouding en bevat AI-upscaling voor bronnen met lage resolutie.

### AI Studio

Directe toegang tot AI-generatiemogelijkheden:

- **Tekst-naar-afbeelding**: Genereer visuals uit beschrijvingen met Gemini
- **Afbeelding-naar-video**: Converteer stilstaande beelden naar beweging met Veo 3.1
- **Outpainting**: Breid afbeeldingen uit naar nieuwe beeldverhoudingen
- **Achtergrondverwijdering**: Isoleer onderwerpen direct

### Strategiemodule

Plan campagnes met vertrouwen:

- **Plaatsingsmatrix**: Visueel raster met alle platformvereisten
- **Afgeleide roadmap**: Breng alle benodigde variaties in kaart vanuit masterassets
- **A/B-testplanner**: Ontwerp hypothesegestuurde creatieve tests
- **Creatieve vermoeidheidsvoorspelling**: Weet wanneer assets vernieuwd moeten worden

### CRM-integratie

Ingebouwd klant- en projectbeheer elimineert de noodzaak voor aparte tools:

- Bedrijfsprofielen met merkrichtlijnen
- Projecttracking met tijdlijnen en budgetten
- Assetkoppeling en versiegeschiedenis
- Teamdeling met gedetailleerde toegangsniveaus (Bekijken, Bewerken, Volledig)
- Domeingebaseerd automatisch delen

### Integratiehub

Verbind met uw bestaande ecosysteem:

- **Google Drive**: Blader door mappen, scan assets, importeer direct
- **Google Sheets**: Extraheer afbeeldings-URL's uit spreadsheets
- **Gmail**: Scan bijlagen op creatieve assets
- **Dropbox**: Mapsynchronisatie
- **Slack**: Kanaalbestandsscanning

Elke integratie bevat een geschiktheidsanalyse die toont welke assets aan de vereisten voldoen en welke aandacht nodig hebben.

---

## Architectuur

### SaaS-Ready infrastructuur

Het platform bevat een complete backend-architectuur voor productiedeployment:

**Databaselaag (MySQL)**
- Gebruikers- en teambeheer met rolgebaseerde toegang
- Assetmetadata met validatieresultaten
- CRM-entiteiten (bedrijven, projecten, contacten)
- Synchronisatietracking voor offline-first werking
- Gebruiksanalyse en auditlogging

**API-laag (PHP)**
- RESTful endpoints voor alle operaties
- Google OAuth tokenvalidatie
- Sessiebeheer met versleuteling
- Cloudinary-integratie voor assetverwerking

**Synchronisatie-engine (JavaScript)**
- Bidirectionele synchronisatie tussen browser en server
- Conflictresolutie met versietracking
- Offline wachtrij voor wachtende wijzigingen
- Realtime statusupdates

**Opslagopties**
- Lokaal: IndexedDB voor browsergebaseerde opslag
- Cloud: Cloudinary voor beeld-/videoverwerking en CDN-levering
- Hybride: Automatische synchronisatie tussen lokaal en cloud

### Beveiligingsimplementatie

| Laag | Implementatie |
|-------|----------------|
| Sessieversleuteling | AES-256-GCM met PBKDF2-sleutelafleiding |
| Authenticatie | Google SSO met JWT-validatie |
| Domeinhandhaving | Configureerbare bedrijfsdomeinvereisten |
| Apparaatkoppeling | Sessies gekoppeld aan browserfingerprints |
| Anti-manipulatie | HMAC-SHA256 handtekeningverificatie |
| Activiteitenlogging | 360-daagse audittrail met export |
| Data-isolatie | Gebruikersspecifieke versleutelde opslag |
| Rolgebaseerde toegang | Super Admin, Domein Admin, Redacteur, Lezer |

---

## Licentie

Propriëtaire software - Alle rechten voorbehouden

Copyright 2024-2025 It All Started With An Idea

---

<div align="center">

**Creative Asset Validator**

*Valideer. Organiseer. Optimaliseer.*

Gebouwd voor creatieve teams die precisie en efficiëntie eisen.

</div>
