# Déploiement PhoBamboo v2 sur VPS (CloudPanel)

Architecture retenue : **un seul port**. Le backend Node sert l'API, le WebSocket
**et** le frontend Vue compilé. Aucun conflit avec le Nginx de CloudPanel. Plus
tard, quand vous aurez un domaine, vous ajoutez un *Reverse Proxy site* CloudPanel
qui pointe vers `127.0.0.1:4000` + SSL Let's Encrypt automatique.

```
Internet ──> (plus tard) CloudPanel Nginx + SSL ──> 127.0.0.1:4000 ──> Node (Express)
                                                                        ├── /api/*      REST
                                                                        ├── /socket.io  WebSocket
                                                                        ├── /uploads/*  images disque
                                                                        └── /*          Vue SPA (dist)
```

Pour démarrer **sans domaine** : on accède directement à `http://IP_DU_VPS:4000`.

---

## ⚡ Méthode rapide (scripts automatiques)
Après avoir récupéré le code sur le VPS :
```bash
# 1. PostgreSQL : vérifie/installe + crée la base (idempotent)
sudo PG_PASS='un_mot_de_passe_fort' bash scripts/setup-postgres.sh
# 2. Renseigner backend/.env (DATABASE_URL affiché par le script ci-dessus, + JWT_SECRET)
# 3. Déploiement complet : build front + deps + migrations + seed + PM2
bash scripts/deploy.sh
# (option) migrer les données Firebase en même temps :
RUN_FIREBASE=1 bash scripts/deploy.sh
```
Les étapes manuelles détaillées ci-dessous restent valables si vous préférez tout
faire à la main ou diagnostiquer un souci.

---

## 0. Prérequis sur le VPS
- Node.js 20+ (`node -v`). CloudPanel permet d'installer Node via l'interface,
  ou : `curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs`
- PM2 : `sudo npm install -g pm2`

## 1. PostgreSQL

### Vérifier s'il est installé
```bash
psql --version          # version installée ?
sudo systemctl status postgresql
```

### S'il n'est PAS installé (Debian/Ubuntu)
```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
```

### Créer la base + l'utilisateur
```bash
sudo -u postgres psql <<'SQL'
CREATE USER phobamboo WITH PASSWORD 'CHANGEZ_MOI';
CREATE DATABASE phobamboo OWNER phobamboo;
GRANT ALL PRIVILEGES ON DATABASE phobamboo TO phobamboo;
SQL
```
Chaîne de connexion résultante :
`postgresql://phobamboo:CHANGEZ_MOI@localhost:5432/phobamboo?schema=public`

> Alternative Docker (si vous préférez ne pas installer PG sur l'hôte) :
> `docker run -d --name pg-phobamboo -e POSTGRES_USER=phobamboo -e POSTGRES_PASSWORD=CHANGEZ_MOI -e POSTGRES_DB=phobamboo -p 5432:5432 -v pgdata:/var/lib/postgresql/data postgres:16`

## 2. Récupérer le code
```bash
# adaptez le chemin (ex: site CloudPanel /home/phobamboo/app)
cd /home/phobamboo
git clone <votre-repo> app   # ou rsync/scp depuis votre machine
cd app
```

## 3. Build du frontend
```bash
cd frontend
cp .env.example .env          # laisser VITE_API_URL vide (même origine)
npm ci
npm run build                 # génère frontend/dist
```

## 4. Configurer + initialiser le backend
```bash
cd ../backend
cp .env.example .env
nano .env
```
Renseignez au minimum :
```
DATABASE_URL="postgresql://phobamboo:CHANGEZ_MOI@localhost:5432/phobamboo?schema=public"
JWT_SECRET="<chaîne aléatoire longue>"   # openssl rand -hex 32
SEED_ADMIN_USER="admin"
SEED_ADMIN_PASS="phobamboo"              # simple/mémorisable pour le patron
PUBLIC_URL=""                            # garder vide (liens images relatifs)
```
Puis :
```bash
npm ci
npx prisma db push            # crée/synchronise les tables depuis le schéma
npm run seed                  # crée la config + le compte admin
```

## 5. (Une seule fois) Migrer les données Firebase
```bash
# Console Firebase > Paramètres > Comptes de service > Générer une clé privée
# Déposez le JSON, puis dans backend/.env :
#   FIREBASE_SERVICE_ACCOUNT="/home/phobamboo/app/backend/firebase-key.json"
npm run migrate:firebase
```
> Les noms de plats sont migrés en FR ; les champs ZH/EN restent vides → à
> compléter dans la page Menu.

## 6. Lancer en continu (PM2)
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup        # suivez la commande affichée pour le démarrage auto
```
Vérifier : `curl http://localhost:4000/api/health` → `{"ok":true}`

### Accès immédiat sans domaine
Ouvrez le port 4000 (firewall / CloudPanel) puis visitez `http://IP_DU_VPS:4000`.
- Client : `http://IP_DU_VPS:4000/` et `/order?table=5`
- Back-office : `http://IP_DU_VPS:4000/admin/login` (admin / phobamboo)

## 7. Plus tard : domaine + HTTPS via CloudPanel
1. Dans CloudPanel : **+ Add Site → Reverse Proxy** (ou un site Node.js).
2. Domaine : `phobamboo.com`. Reverse proxy vers `http://127.0.0.1:4000`.
3. Onglet **SSL/TLS → Let's Encrypt** : certificat automatique.
4. Assurez-vous que CloudPanel transmet les WebSockets (Upgrade/Connection headers) —
   le template Reverse Proxy de CloudPanel le fait par défaut pour `/`.

Aucun changement de code : tout est servi en même origine.

## Mises à jour ultérieures
```bash
cd /home/phobamboo/app && git pull
cd frontend && npm ci && npm run build
cd ../backend && npm ci && npx prisma db push && pm2 restart phobamboo
```

## Sauvegarde base de données

### Manuelle
```bash
pg_dump -U phobamboo phobamboo > backup_$(date +%F).sql
```

### Automatique quotidienne (recommandé)
Le script `scripts/backup.sh` exporte + compresse + garde les 14 derniers jours.
```bash
bash scripts/backup.sh           # test manuel → backups/phobamboo_*.sql.gz
crontab -e                       # planifier (3h30 chaque nuit) :
# 30 3 * * * /bin/bash /home/app/scripts/backup.sh >> /home/app/backup.log 2>&1
```
