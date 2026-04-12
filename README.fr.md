# Creative Asset Validator

[English](README.md) | [Français](README.fr.md) | [Español](README.es.md) | [中文](README.zh.md) | [Nederlands](README.nl.md) | [Русский](README.ru.md) | [한국어](README.ko.md)

## Plateforme d'intelligence créative de niveau entreprise

<div align="center">

![Version](https://img.shields.io/badge/version-5.11.0-blue.svg)
![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)
![Platform](https://img.shields.io/badge/platform-Web-green.svg)
![AI Powered](https://img.shields.io/badge/AI-Powered-purple.svg)

**La solution complète pour valider, organiser et optimiser les assets créatifs publicitaires sur plus de 50 plateformes avec une persistance des données à toute épreuve.**

> 🎉 **NOUVEAU : v5.11.0 est arrivée !** - Fiabilité de suppression à 100%, zéro erreur console, diagnostics de classe mondiale. [Voir les nouveautés →](README-v5.11.0.md)

[Démarrage rapide](#démarrage-rapide) | [Docs v5.11.0](README-v5.11.0.md) | [Fonctionnalités](#fonctionnalités-principales) | [Déploiement](#déploiement)

</div>

---

## Le problème que nous résolvons

Dans la publicité numérique, les équipes créatives font face à un défi quotidien : s'assurer que chaque asset respecte les spécifications exactes requises par des dizaines de plateformes différentes. Un seul créatif aux mauvaises dimensions peut entraîner des publicités rejetées, des budgets de campagne gaspillés et des opportunités de marché manquées.

Les workflows traditionnels impliquent :
- La vérification manuelle des dimensions par rapport à une documentation dispersée
- La création d'innombrables variantes de redimensionnement pour chaque plateforme
- La perte de suivi des formats nécessaires à chaque client
- La recherche dans des structures de dossiers désorganisées
- Le non-respect des guidelines de marque et des exigences de conformité

Ces inefficacités coûtent des milliers d'heures par an aux agences et équipes marketing.

## Notre solution

Creative Asset Validator est une plateforme complète qui automatise l'ensemble du workflow des assets créatifs. Conçue pour les équipes marketing, les agences et les entreprises, elle valide les assets par rapport aux spécifications des plateformes, les organise intelligemment et exploite l'IA pour optimiser les performances créatives.

La plateforme fonctionne entièrement dans le navigateur avec synchronisation cloud optionnelle, ne nécessitant aucune infrastructure backend complexe tout en offrant une sécurité et des fonctionnalités de collaboration de niveau entreprise.

---

## Fonctionnalités principales

### Bibliothèque d'assets et validation

Le hub central pour tous les assets créatifs. Téléchargez des images et vidéos par glisser-déposer, et le système les valide automatiquement par rapport aux spécifications de plus de 50 plateformes publicitaires, dont YouTube, TikTok, Meta, Google Ads, DV360, The Trade Desk et les réseaux de TV connectée.

- Validation automatique des dimensions et formats
- Vérification de conformité de la taille et de la durée des fichiers
- Indicateurs visuels de statut pour chaque plateforme
- Organisation par dossiers avec tags et favoris
- Séparation du stockage personnel et d'équipe

### Analyse créative alimentée par l'IA

Exploitez plusieurs fournisseurs d'IA pour analyser l'efficacité créative :

- **Analyse d'accroche** : Évaluez les premières secondes pour la capture d'attention
- **Détection de CTA** : Évaluez la clarté et le placement de l'appel à l'action
- **Conformité de marque** : Vérifiez le placement du logo, les couleurs et les guidelines
- **Prédiction de performance** : Estimez l'engagement, le CTR et le potentiel de conversion

Le système orchestre Claude, GPT-4 et Gemini pour fournir une analyse complète sous plusieurs perspectives.

### Générateur de Kit de marque

Transformez un seul logo en un package complet d'assets de marque. Téléchargez un logo haute résolution et générez plus de 100 variations de format :

- Images de profil et couvertures pour les réseaux sociaux
- Tailles de bannières Google Ads
- Favicons et icônes d'application
- Signatures d'e-mail
- Formats prêts pour l'impression

Chaque variation maintient les bons ratios d'aspect et inclut l'upscaling IA pour les sources basse résolution.

### AI Studio

Accès direct aux capacités de génération IA :

- **Texte-vers-image** : Générez des visuels à partir de descriptions avec Gemini
- **Image-vers-vidéo** : Convertissez des images fixes en mouvement avec Veo 3.1
- **Outpainting** : Étendez les images vers de nouveaux ratios d'aspect
- **Suppression d'arrière-plan** : Isolez les sujets instantanément

### Module Stratégie

Planifiez vos campagnes en toute confiance :

- **Matrice de placement** : Grille visuelle montrant toutes les exigences des plateformes
- **Feuille de route des dérivés** : Cartographiez toutes les variations nécessaires à partir des assets principaux
- **Planificateur de tests A/B** : Concevez des tests créatifs basés sur des hypothèses
- **Prédiction de fatigue créative** : Sachez quand vos assets doivent être renouvelés

### Intégration CRM

Gestion intégrée de clients et de projets, éliminant le besoin d'outils séparés :

- Profils d'entreprise avec guidelines de marque
- Suivi de projets avec calendriers et budgets
- Liaison d'assets et historique des versions
- Partage d'équipe avec niveaux d'accès granulaires (Voir, Éditer, Complet)
- Partage automatique basé sur le domaine

### Hub d'intégration

Connectez-vous à votre écosystème existant :

- **Google Drive** : Parcourez les dossiers, scannez les assets, importez directement
- **Google Sheets** : Extrayez les URLs d'images depuis les tableurs
- **Gmail** : Scannez les pièces jointes pour les assets créatifs
- **Dropbox** : Synchronisation de dossiers
- **Slack** : Scan des fichiers de channels

Chaque intégration inclut une analyse d'éligibilité, montrant quels assets répondent aux exigences et lesquels nécessitent une attention.

---

## Architecture

### Infrastructure SaaS-Ready

La plateforme comprend une architecture backend complète pour le déploiement en production :

**Couche base de données (MySQL)**
- Gestion des utilisateurs et des équipes avec accès basé sur les rôles
- Métadonnées d'assets avec résultats de validation
- Entités CRM (entreprises, projets, contacts)
- Suivi de synchronisation pour le fonctionnement hors-ligne en priorité
- Analytique d'utilisation et journalisation d'audit

**Couche API (PHP)**
- Points d'accès RESTful pour toutes les opérations
- Validation des tokens Google OAuth
- Gestion de session avec chiffrement
- Intégration Cloudinary pour le traitement d'assets

**Moteur de synchronisation (JavaScript)**
- Synchronisation bidirectionnelle entre navigateur et serveur
- Résolution de conflits avec suivi de versions
- File d'attente hors-ligne pour les modifications en attente
- Mises à jour de statut en temps réel

**Options de stockage**
- Local : IndexedDB pour le stockage dans le navigateur
- Cloud : Cloudinary pour le traitement d'images/vidéos et la livraison CDN
- Hybride : Synchronisation automatique entre local et cloud

### Implémentation de la sécurité

| Couche | Implémentation |
|-------|----------------|
| Chiffrement de session | AES-256-GCM avec dérivation de clé PBKDF2 |
| Authentification | Google SSO avec validation JWT |
| Application de domaine | Exigences de domaine d'entreprise configurables |
| Liaison d'appareil | Sessions liées aux empreintes du navigateur |
| Anti-falsification | Vérification de signature HMAC-SHA256 |
| Journalisation d'activité | Piste d'audit de 360 jours avec export |
| Isolation des données | Stockage chiffré par utilisateur |
| Accès basé sur les rôles | Super Admin, Admin de domaine, Éditeur, Lecteur |

---

## Licence

Logiciel propriétaire - Tous droits réservés

Copyright 2024-2025 It All Started With An Idea

---

<div align="center">

**Creative Asset Validator**

*Validez. Organisez. Optimisez.*

Conçu pour les équipes créatives qui exigent précision et efficacité.

</div>
