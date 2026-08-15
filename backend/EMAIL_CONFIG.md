# Configuration des Emails en Production - SendGrid

## Problème avec Gmail
Gmail bloque les connexions depuis Render (timeout de connexion). C'est une mesure de sécurité de Gmail.

## Solution : SendGrid (Recommandé)

SendGrid est plus fiable pour les services cloud et offre 100 emails/jour gratuits.

### Étape 1 : Créer un compte SendGrid

1. **Allez sur https://sendgrid.com/**
2. **Cliquez sur "Sign Up"** (inscription gratuite)
3. **Remplissez le formulaire** :
   - Email : `rachidbonsa.ai@gmail.com`
   - Mot de passe : choisissez un mot de passe sécurisé
   - Nom complet : Rachid Bonsa
   - Société : DEDSEC (ou votre nom)
4. **Vérifiez votre email** :
   - SendGrid envoie un email de confirmation
   - Cliquez sur le lien de vérification
5. **Choisissez le plan gratuit** (Free plan - 100 emails/jour)

### Étape 2 : Créer un Sender (IMPORTANT)

1. **Connectez-vous** à votre compte SendGrid
2. **Allez dans** Settings → Sender Authentication (dans le menu de gauche)
3. **Cliquez sur "Create New Sender"**
4. **Remplissez les informations du sender** :
   - **From Email** : `rachidbonsa.ai@gmail.com`
   - **From Name** : DEDSEC Platform (ou votre nom)
   - **Reply To** : `rachidbonsa.ai@gmail.com`
   - **Address** : votre adresse (optionnelle)
5. **Cliquez sur "Next"**
6. **Vérification par email** :
   - SendGrid envoie un email à `rachidbonsa.ai@gmail.com`
   - **Ouvrez l'email** Gmail
   - **Cliquez sur le lien de vérification** "Verify Sender"
7. **Retournez sur SendGrid** et cliquez sur "Done"

### Étape 3 : Générer une API Key

1. **Allez dans** Settings → API Keys (dans le menu de gauche)
2. **Cliquez sur "Create API Key"**
3. **Nommez la clé** : `DEDSEC Platform`
4. **Sélectionnez les permissions** :
   - Cochez "Mail Send"
   - Vous pouvez laisser les autres décochées
5. **Cliquez sur "Create & View"**
6. **COPIEZ LA CLÉ IMMÉDIATEMENT** :
   - La clé s'affiche une seule fois : `SG.xxxxxxxxxxxxxxx`
   - **Sauvegardez-la** dans un endroit sûr
   - C'est cette clé que vous utiliserez comme mot de passe SMTP

### Étape 4 : Configurer Render

1. **Allez dans votre dashboard Render**
   - https://dashboard.render.com
2. **Sélectionnez le service** "dedsec-api"
3. **Cliquez sur "Environment"** (menu de gauche)
4. **Trouvez la variable** `SMTP_PASS`
5. **Collez votre API Key SendGrid** :
   - Exemple : `SG.abcd1234efgh5678ijkl9012mnop3456`
6. **Cliquez sur "Save Changes"**
7. **Redéployez le service** :
   - Cliquez sur "Manual Deploy" → "Deploy latest commit"

### Étape 5 : Vérification

Après le déploiement, regardez les logs Render. Vous devriez voir :

```
✅ Email transporter configured and verified with SMTP
✅ Real emails will be sent
```

### Étape 6 : Test

1. **Créez un nouvel utilisateur** dans l'interface admin
2. **Utilisez votre email** `rachidbonsa.ai@gmail.com` comme email du nouveau compte
3. **Regardez votre boîte Gmail** - vous devriez recevoir l'email de bienvenue

## Configuration SMTP finale

Les variables dans Render devraient ressembler à ceci :

```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.votre_clé_api_ici
EMAIL_FROM=rachidbonsa.ai@gmail.com
```

## Dépannage

### Si l'email de vérification n'arrive pas
- Vérifiez le dossier spam dans Gmail
- Attendez quelques minutes (peut prendre jusqu'à 5 minutes)
- Réessayez d'envoyer l'email de vérification

### Si la connexion échoue
- Vérifiez que l'API Key est correctement copiée (commence par "SG.")
- Vérifiez que le sender est bien vérifié (status "Verified" dans SendGrid)
- Regardez les logs Render pour le message d'erreur exact

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