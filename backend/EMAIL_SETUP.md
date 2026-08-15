# Configuration du système d'emails et notifications

## Variables d'environnement requises

Pour activer l'envoi d'emails automatiques, configurez les variables suivantes dans votre fichier `.env` ou dans les variables d'environnement de Render :

### Configuration SMTP

```bash
# Configuration du serveur SMTP
SMTP_HOST=smtp.gmail.com           # Exemple pour Gmail
SMTP_PORT=587                       # Port standard pour TLS
SMTP_SECURE=false                   # false pour STARTTLS, true pour SSL
SMTP_USER=votre@email.com           # Votre email
SMTP_PASS=votre_mot_de_passe_app   # Mot de passe d'application (pas le mot de passe normal)

# Adresse d'expéditeur
EMAIL_FROM=noreply@dedsec.io        # Adresse d'expéditeur par défaut

# URL du frontend pour les liens dans les emails
FRONTEND_URL=https://dedsec-pied.vercel.app
```

### Configuration sans SMTP (mode développement)

Si vous ne configurez pas les variables SMTP, le système utilisera automatiquement le mode développement avec Ethereal Email :
- Les emails seront simulés et affichés dans les logs
- Un lien de preview sera généré pour visualiser l'email
- Aucun email réel ne sera envoyé

## Types de notifications

### 1. Notifications par email

Le système envoie automatiquement des emails pour :
- **Bienvenue** : Nouveaux utilisateurs créés par l'admin
- **Réinitialisation de mot de passe** : Liens de réinitialisation
- **Tâche assignée** : Nouvelle tâche assignée à un utilisateur
- **Mise à jour de tâche** : Modifications de tâches importantes
- **Invitation au projet** : Ajout d'un membre à un projet
- **Demande de congé** : Nouvelle demande de congé soumise
- **Congé approuvé** : Demande de congé acceptée
- **Annonces** : Nouvelles annonces publiées

### 2. Notifications in-app

Les notifications sont également stockées dans la base de données et affichées dans l'interface :
- Tous les types d'emails ci-dessus
- Notifications de tâches en retard
- Notifications de tâches à échéance proche

## Configuration SMTP par fournisseur

### Gmail
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre@gmail.com
SMTP_PASS=votre_mot_de_passe_app  # Généré dans Google Account > Security > 2-Step Verification > App Passwords
```

### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre@outlook.com
SMTP_PASS=votre_mot_de_passe
```

### SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.votre_api_key
```

### Mailgun
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@votre_domaine.mailgun.org
SMTP_PASS=votre_mot_de_passe_mailgun
```

## Scheduler (Tâches planifiées)

Le système inclut un scheduler automatique qui :
- **Tous les jours à 9h** : Vérifie les tâches à échéance proche (dans les 24h)
- **Toutes les heures** : Vérifie les tâches en retard

Ces notifications sont envoyées aux assignées des tâches concernées.

## Activation/Désactivation par utilisateur

Chaque utilisateur peut configurer ses préférences de notification dans la base de données :
- `notifyEmail` : Activer/désactiver les emails
- `notifyTaskAssigned` : Notifications de tâches assignées
- `notifyDueSoon` : Notifications d'échéance proche
- `notifyComments` : Notifications de commentaires
- `notifyMentions` : Notifications de mentions

## Déploiement sur Render

1. Allez dans votre projet Render
2. Accédez à "Environment"
3. Ajoutez les variables SMTP
4. Redéployez l'application

Les variables sont automatiquement disponibles dans le backend sans modification de code.

## Test du système

En mode développement, les emails sont simulés. Vérifiez les logs du backend pour voir :
- Les contenus des emails simulés
- Les liens de preview Ethereal (si disponible)
- Les erreurs éventuelles

## Désactivation temporaire

Pour désactiver temporairement les emails sans supprimer les variables :
- Mettez `SMTP_HOST` à une valeur vide ou commentez-la
- Le système passera automatiquement en mode simulation