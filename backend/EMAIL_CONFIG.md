# Configuration des Emails en Production - Gmail

## Configuration actuelle
Le système est configuré pour utiliser Gmail avec le compte `rachidbonsa.ai@gmail.com`.

## ÉTAPES OBLIGATOIRES POUR GMAIL

### 1. Activer la vérification en 2 étapes sur Google
1. Allez sur https://myaccount.google.com/security
2. Connectez-vous avec `rachidbonsa.ai@gmail.com`
3. Activez "Vérification en 2 étapes"

### 2. Générer un mot de passe d'application
1. Sur la même page de sécurité Google
2. Allez dans "Mots de passe d'application"
3. Cliquez sur "Créer"
4. Sélectionnez "Mail" comme application
5. Sélectionnez "Autre" comme appareil
6. Nommez-le "DEDSEC Platform"
7. Cliquez sur "Générer"
8. **COPIEZ LE MOT DE PASSE GÉNÉRÉ** (il s'affiche une seule fois)

### 3. Configurer Render
1. Allez dans votre dashboard Render
2. Sélectionnez le service "dedsec-api"
3. Cliquez sur "Environment"
4. Trouvez la variable `SMTP_PASS`
5. Collez le mot de passe d'application généré (pas votre mot de passe Gmail normal)
6. Cliquez sur "Save Changes"
7. Cliquez sur "Manual Deploy" → "Deploy latest commit"

## Configuration SMTP (déjà configurée dans render.yaml)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=rachidbonsa.ai@gmail.com
SMTP_PASS=[VOTRE MOT DE PASSE D'APPLICATION]
EMAIL_FROM=rachidbonsa.ai@gmail.com
```

## Vérification
Après déploiement, vérifiez les logs Render :
```
✅ Email transporter configured and verified with SMTP
✅ Real emails will be sent
```

Si vous voyez :
```
❌ Failed to configure SMTP transporter
```
Vérifiez que :
- La vérification en 2 étapes est activée
- Vous utilisez un mot de passe d'application (pas le mot de passe normal)
- Le mot de passe est correctement copié

## Test
Utilisez l'endpoint de test : `GET /auth/test-email` pour vérifier que les emails partent.

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