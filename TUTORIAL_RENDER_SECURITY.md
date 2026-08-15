# 🚀 Tutoriel Configuration Sécurité sur Render

## 📋 Étape 1 : Accéder au Dashboard Render

1. Allez sur https://dashboard.render.com/
2. Connectez-vous avec votre compte GitHub
3. Sélectionnez votre service `dedsec-api`

---

## 🔧 Étape 2 : Configurer les variables d'environnement

### 2.1 Accéder aux variables d'environnement

1. Dans votre service `dedsec-api`, cliquez sur **"Environment"** dans le menu gauche
2. Vous verrez les variables existantes (DATABASE_URL, JWT_SECRET, etc.)

### 2.2 Ajouter les variables de sécurité

Cliquez sur **"+ Add Environment Variable"** et ajoutez les variables suivantes :

#### **Variables Email (déjà configurées)**
```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_SECURE = false
SMTP_USER = rachidbonsa.ai@gmail.com
SMTP_PASS = bwbk zbtn gagu zwka
EMAIL_FROM = noreply@dedsec.io
```

#### **Variables de sécurité (nouvelles)**
```
FRONTEND_URL = https://dedsec-pied.vercel.app
ALLOWED_IPS = ""
```

#### **Variables JWT (existantes, vérifiez-les)**
```
JWT_SECRET = <auto-généré par Render>
JWT_EXPIRES_IN = 15m
```

### 2.3 Explication des variables

| Variable | Description | Valeur recommandée |
|----------|-------------|-------------------|
| `FRONTEND_URL` | URL du frontend pour CORS | `https://dedsec-pied.vercel.app` |
| `ALLOWED_IPS` | Filtrage par IP (optionnel) | Vide = toutes les IP autorisées |
| `SMTP_HOST` | Serveur SMTP | `smtp.gmail.com` |
| `SMTP_PORT` | Port SMTP | `587` |
| `SMTP_SECURE` | SSL/TLS | `false` (STARTTLS) |
| `SMTP_USER` | Email SMTP | `rachidbonsa.ai@gmail.com` |
| `SMTP_PASS` | Mot de passe app | `bwbk zbtn gagu zwka` |
| `EMAIL_FROM` | Expéditeur emails | `noreply@dedsec.io` |

---

## 🔄 Étape 3 : Redéployer l'application

### 3.1 Déploiement manuel

1. Cliquez sur **"Manual Deploy"** dans le menu gauche
2. Sélectionnez **"Deploy latest commit"**
3. Attendez que le déploiement soit terminé (environ 2-3 minutes)

### 3.2 Vérifier le déploiement

1. Cliquez sur **"Logs"** pour voir les logs de déploiement
2. Cherchez ces messages de succès :
   ```
   🔒 DEDSEC API running on port 4000
   [EmailService] Email transporter configured with SMTP
   ```

---

## 🧪 Étape 4 : Tester la sécurité

### 4.1 Tester la politique de mot de passe

1. Connectez-vous en tant qu'admin sur https://dedsec-pied.vercel.app
2. Créez un nouvel utilisateur
3. Essayez de créer un mot de passe faible (ex: "password")
4. **Vérifiez** : Vous devriez recevoir une erreur avec les exigences

### 4.2 Tester le changement de mot de passe forcé

1. Connectez-vous avec le nouvel utilisateur
2. Utilisez le mot de passe temporaire envoyé par email
3. **Vérifiez** : Vous devriez être redirigé vers la page de changement de mot de passe
4. Changez le mot de passe pour un mot de passe fort
5. **Vérifiez** : Après le changement, vous pouvez accéder à l'application

### 4.3 Tester le rate limiting

1. Essayez de vous connecter avec un mauvais mot de passe 6 fois
2. **Vérifiez** : La 6ème tentative devrait être bloquée avec un message "Trop de tentatives"

### 4.4 Tester les emails

1. Créez une nouvelle tâche et assignez-la à un utilisateur
2. **Vérifiez** : L'utilisateur devrait recevoir un email de notification
3. Vérifiez votre boîte Gmail : `rachidbonsa.ai@gmail.com`

---

## 📊 Étape 5 : Surveiller les logs de sécurité

### 5.1 Accéder aux logs

1. Cliquez sur **"Logs"** dans le menu de votre service
2. Filtrez les logs avec ces termes :
   - `[SECURITY]` : Opérations de sécurité
   - `[AUTH_ATTEMPT]` : Tentatives de connexion
   - `[SECURITY_ERROR]` : Erreurs de sécurité

### 5.2 Exemples de logs à surveiller

**Log normal :**
```
[SECURITY] 2026-08-15T18:51:48.000Z | POST /api/auth/login | IP: 192.168.1.1 | User-Agent: Mozilla/5.0...
[AUTH_ATTEMPT] 2026-08-15T18:51:48.000Z | IP: 192.168.1.1 | Email: user@example.com
[SECURITY_SUCCESS] 2026-08-15T18:51:50.000Z | POST /api/auth/login | IP: 192.168.1.1
```

**Log d'erreur (à surveiller) :**
```
[SECURITY_ERROR] 2026-08-15T18:52:00.000Z | POST /api/auth/login | IP: 192.168.1.1 | Error: Invalid credentials
```

---

## 🔒 Étape 6 : Configuration avancée (optionnelle)

### 6.1 Filtrage par IP

Si vous voulez restreindre l'accès à certaines IP :

1. Dans **Environment**, modifiez `ALLOWED_IPS`
2. Exemple pour autoriser une seule IP :
   ```
   ALLOWED_IPS = 192.168.1.100
   ```
3. Exemple pour autoriser une plage d'IP :
   ```
   ALLOWED_IPS = 192.168.1.0/24
   ```
4. Exemple pour plusieurs IP :
   ```
   ALLOWED_IPS = 192.168.1.100,10.0.0.0/8
   ```
5. Cliquez sur **"Save Changes"** et redéployez

### 6.2 Désactiver Swagger en production

Swagger est déjà désactivé automatiquement en production via le code, mais vous pouvez vérifier :

1. Dans les logs, cherchez "Swagger docs"
2. En production, ce message ne devrait pas apparaître
3. Essayez d'accéder à `https://dedsec-api.onrender.com/api/docs`
4. **Vérifiez** : Vous devriez obtenir une erreur 404

---

## 🚨 Étape 7 : Procédures d'urgence

### 7.1 En cas d'attaque détectée

1. **Bloquer l'IP attaquante** :
   - Ajoutez l'IP à `ALLOWED_IPS` (avec préfixe `-` pour exclure)
   - Exemple : `ALLOWED_IPS = -192.168.1.100`

2. **Suspendre les comptes compromis** :
   - Connectez-vous à votre base de données Neon
   - Exécutez : `UPDATE "User" SET status = 'SUSPENDED' WHERE email = 'compromised@email.com';`

3. **Forcer le reconnexion** :
   - Supprimez les refresh tokens dans la base de données
   - Tous les utilisateurs devront se reconnecter

### 7.2 Révoquer les tokens

1. Connectez-vous à votre base de données Neon
2. Exécutez :
   ```sql
   DELETE FROM "RefreshToken";
   ```
3. Tous les utilisateurs devront se reconnecter

---

## ✅ Étape 8 : Checklist de vérification

Avant de considérer la configuration comme terminée, vérifiez :

- [ ] Toutes les variables d'environnement sont configurées
- [ ] Le déploiement a réussi sans erreurs
- [ ] Les emails de notification fonctionnent
- [ ] La politique de mot de passe fonctionne
- [ ] Le changement de mot de passe forcé fonctionne
- [ ] Le rate limiting fonctionne (testez avec 6 logins échoués)
- [ ] Les logs de sécurité apparaissent dans Render
- [ ] Swagger est désactivé en production
- [ ] CORS ne permet que les origines autorisées
- [ ] Les headers de sécurité sont actifs

---

## 📞 Étape 9 : Support et dépannage

### Problèmes courants

**Emails non reçus :**
- Vérifiez les logs Render pour les erreurs SMTP
- Vérifiez le dossier Spam dans Gmail
- Confirmez que le mot de passe d'application Gmail est valide

**Rate limiting trop strict :**
- Ajustez les limites dans `backend/src/common/throttler.module.ts`
- Redéployez après modification

**Erreur CORS :**
- Vérifiez que `FRONTEND_URL` est correct
- Vérifiez que l'URL du frontend correspond exactement

**Problème de connexion :**
- Vérifiez les logs pour `[AUTH_ATTEMPT]`
- Confirmez que l'utilisateur n'est pas suspendu
- Vérifiez que le statut n'est pas `PENDING_PASSWORD_CHANGE`

---

## 🎉 Conclusion

Une fois toutes ces étapes terminées, votre application DEDSEC sera :

✅ **Sécurisée** avec mots de passe forts
✅ **Protégée** contre les attaques par force brute
✅ **Surveillée** avec des logs de sécurité
✅ **Configurée** pour envoyer des emails automatiques
✅ **Prête** pour une utilisation en production

**N'oubliez pas de surveiller régulièrement les logs Render pour détecter toute activité suspecte !**