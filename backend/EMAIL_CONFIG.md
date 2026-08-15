# Configuration des Emails en Production

## Problème actuel
Les emails ne partent pas en production car les variables SMTP ne sont pas configurées correctement dans Render.

## Solution rapide : Utiliser un service SMTP gratuit

### Option 1 : Gmail (Recommandé pour tester)
1. Allez dans votre compte Google → Sécurité
2. Activez la "vérification en 2 étapes"
3. Générez un "mot de passe d'application"
4. Utilisez ces identifiants dans Render

Variables à configurer dans Render :
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre.email@gmail.com
SMTP_PASS=votre_mot_de_passe_application
EMAIL_FROM=votre.email@gmail.com
```

### Option 2 : SendGrid (Gratuit jusqu'à 100 emails/jour)
1. Créez un compte sur [SendGrid](https://sendgrid.com/)
2. Créez un "Sender" (votre email)
3. Générez une "API Key"
4. Utilisez les identifiants SMTP fournis

Variables à configurer dans Render :
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.votre_api_key
EMAIL_FROM=votre.email@example.com
```

### Option 3 : Mailtrap (Pour développement)
1. Créez un compte sur [Mailtrap](https://mailtrap.io/)
2. Utilisez les identifiants SMTP du sandbox

Variables à configurer dans Render :
```
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=votre_user_mailtrap
SMTP_PASS=votre_pass_mailtrap
EMAIL_FROM=noreply@dedsec.io
```

## Configuration dans Render

1. Allez dans votre dashboard Render
2. Sélectionnez votre service "dedsec-api"
3. Cliquez sur "Environment"
4. Ajoutez/modifiez les variables ci-dessus
5. Redéployez le service

## Logs de debug améliorés

Le service email inclut maintenant des logs détaillés :
- Vérification de la configuration SMTP au démarrage
- Logs lors de chaque tentative d'envoi
- Messages d'erreur détaillés en cas d'échec
- Fallback automatique vers Ethereal en développement

## Mode développement

En l'absence de configuration SMTP, le système utilise automatiquement Ethereal (service de test) :
- Les emails sont simulés mais pas réellement envoyés
- Les logs affichent les identifiants Ethereal
- Un lien de preview est disponible dans les logs pour voir l'email

## Vérification

Après configuration, vérifiez les logs Render :
```
Email configuration check - SMTP_HOST: "smtp.gmail.com", SMTP_USER: "votre@email.com"
Email transporter configured and verified with SMTP
✅ Email successfully sent to user@example.com: Bienvenue sur DEDSEC
```

## Problèmes courants

**Gmail bloque la connexion** :
- Vérifiez que vous utilisez un "mot de passe d'application" et non votre mot de passe normal
- Activez "Autoriser les applications moins sécurisées" si nécessaire

**SendGrid retourne une erreur** :
- Vérifiez que votre "Sender" est vérifié dans SendGrid
- Assurez-vous que l'API Key a les permissions "Mail Send"

**Pas d'emails reçus** :
- Vérifiez le dossier spam
- Vérifiez les logs Render pour les erreurs
- Testez avec un service comme Mailtrap en premier