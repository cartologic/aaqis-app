# AAQIS Deployment Flow

## 🔄 Dual Deployment Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AAQIS Project                                │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ git push
                                  ▼
                    ┌─────────────────────────┐
                    │    GitHub Repository     │
                    └─────────────────────────┘
                                  │
                ┌─────────────────┴─────────────────┐
                │                                   │
                ▼                                   ▼
        ┌───────────────┐                  ┌───────────────┐
        │  dev branch   │                  │  main branch  │
        └───────────────┘                  └───────────────┘
                │                                   │
                │ trigger                           │ trigger
                ▼                                   ▼
   ┌──────────────────────┐            ┌──────────────────────┐
   │  deploy.yml          │            │ deploy-production.yml│
   │  (GitHub Pages)      │            │  (SSH Server)        │
   └──────────────────────┘            └──────────────────────┘
                │                                   │
                ▼                                   ▼
        ┌───────────────┐                  ┌───────────────┐
        │   Build App   │                  │   Build App   │
        │   (pnpm)      │                  │   (pnpm)      │
        └───────────────┘                  └───────────────┘
                │                                   │
                ▼                                   ▼
   ┌──────────────────────┐            ┌──────────────────────┐
   │ Deploy to GH Pages   │            │  Deploy via rsync    │
   │ (gh-pages branch)    │            │  to SSH Server       │
   └──────────────────────┘            └──────────────────────┘
                │                                   │
                ▼                                   ▼
        ┌───────────────┐                  ┌───────────────┐
        │  📱 DEV SITE  │                  │  🚀 PROD SITE │
        │  GitHub Pages │                  │  Nginx Server │
        │               │                  │               │
        │  For Testing  │                  │  For Users    │
        └───────────────┘                  └───────────────┘
```

## 📋 Workflow Comparison

| Feature          | Development (`dev`) | Production (`main`)     |
| ---------------- | ------------------- | ----------------------- |
| **Branch**       | `dev`               | `main`                  |
| **Workflow**     | `deploy.yml`        | `deploy-production.yml` |
| **Platform**     | GitHub Pages        | SSH Server + Nginx      |
| **URL**          | GitHub Pages URL    | Custom domain           |
| **Purpose**      | Testing & QA        | Live production         |
| **SSL**          | GitHub managed      | Certbot/Let's Encrypt   |
| **Build Tool**   | pnpm                | pnpm                    |
| **Node Version** | 22                  | 22                      |
| **Deployment**   | Automatic           | Automatic               |

## 🎯 Usage

### Development Cycle

```bash
# 1. Work on feature branch
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 3. Push and create PR to dev
git push origin feature/new-feature
# Create PR to dev branch on GitHub

# 4. Merge PR → Auto-deploys to GitHub Pages
```

### Production Release

```bash
# 1. Ensure dev is fully tested on GitHub Pages

# 2. Create PR from dev to main
git checkout dev
git pull origin dev
# Create PR from dev to main on GitHub

# 3. Review and merge PR → Auto-deploys to production server

# 4. Verify production deployment
curl -I https://afriairresilience.org
```

## 🔐 Security Setup

### Required GitHub Secrets

Set these in: **Settings** → **Secrets and variables** → **Actions**

1. `SSH_PRIVATE_KEY` - SSH private key for server access
2. `SSH_USER` - Server username (e.g., `deployer`)
3. `SERVER_IP` - Server IP or hostname
4. `DEPLOY_PATH` - Deployment directory (e.g., `/var/www/aaqis/`)

### Optional Variables

1. `PRODUCTION_URL` - Production website URL for display

## ⚡ Quick Start Checklist

- [ ] Generate SSH key pair
- [ ] Add public key to server
- [ ] Create deployment user on server
- [ ] Setup deployment directory with correct permissions
- [ ] Configure Nginx with SvelteKit routing
- [ ] Add all secrets to GitHub repository
- [ ] Test SSH connection manually
- [ ] Push to `dev` → Verify GitHub Pages deployment
- [ ] Merge to `main` → Verify production deployment
- [ ] Setup SSL certificate (optional but recommended)

## 📚 Documentation

- Full setup guide: `.github/DEPLOYMENT.md`
- Nginx configuration: See DEPLOYMENT.md
- Troubleshooting: See DEPLOYMENT.md

## 🆘 Quick Troubleshooting

**Deployment fails?**

1. Check GitHub Actions logs
2. Verify all secrets are set correctly
3. Test SSH connection: `ssh user@server`
4. Check server logs: `sudo tail -f /var/log/nginx/error.log`

**Site not loading?**

1. Check Nginx status: `sudo systemctl status nginx`
2. Test Nginx config: `sudo nginx -t`
3. Check file permissions: `ls -la /var/www/aaqis`
4. Check deployment path matches Nginx config
