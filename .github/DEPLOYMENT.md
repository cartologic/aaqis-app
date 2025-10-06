# AAQIS Deployment Guide

This project uses a dual deployment strategy:

- **Development**: Pushes to `dev` branch deploy to GitHub Pages
- **Production**: Pushes to `main` branch deploy to SSH server with Nginx

## 🌿 Development Deployment (GitHub Pages)

**Branch**: `dev`
**Workflow**: `.github/workflows/deploy.yml`
**Trigger**: Push to `dev` branch or manual workflow dispatch

The site is automatically deployed to GitHub Pages and accessible at the configured GitHub Pages URL.

## 🚀 Production Deployment (SSH Server)

**Branch**: `main`
**Workflow**: `.github/workflows/deploy-production.yml`
**Trigger**: Push to `main` branch or manual workflow dispatch

### Required GitHub Secrets

Navigate to: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

| Secret Name       | Description                                     | Example                                                     |
| ----------------- | ----------------------------------------------- | ----------------------------------------------------------- |
| `SSH_PRIVATE_KEY` | Private SSH key for authentication              | Generated using `ssh-keygen -t ed25519 -C "github-actions"` |
| `SSH_USER`        | SSH username on the server                      | `deployer` or `ubuntu`                                      |
| `SERVER_IP`       | Server IP address or hostname                   | `192.168.1.100` or `afriairresilience.org`                  |
| `DEPLOY_PATH`     | Absolute path to deployment directory on server | `/var/www/aaqis/`                                           |

### Optional GitHub Variables

Navigate to: `Settings` → `Secrets and variables` → `Actions` → `Variables` → `New repository variable`

| Variable Name    | Description                          | Example                         |
| ---------------- | ------------------------------------ | ------------------------------- |
| `PRODUCTION_URL` | Production website URL (for display) | `https://afriairresilience.org` |

## ⚙️ Configuration

### Base Path Configuration

The application uses different base paths for different environments:

- **Development (Local)**: No base path (`''`)
- **GitHub Pages (dev branch)**: `/aaqis-app`
- **Production Server (main branch)**: No base path (`''`)

This is configured in `svelte.config.js` using the `BASE_PATH` environment variable:

```javascript
paths: {
  base: process.env.BASE_PATH || ''
}
```

The GitHub Actions workflows automatically set the correct `BASE_PATH`:
- `deploy.yml` (GitHub Pages): `BASE_PATH: /aaqis-app`
- `deploy-production.yml` (SSH Server): `BASE_PATH: ''`

### Local Development

For local development, the app runs at the root path by default:

```bash
pnpm run dev
# App available at: http://localhost:5173
```

To test with the GitHub Pages base path locally:

```bash
BASE_PATH=/aaqis-app pnpm run build
BASE_PATH=/aaqis-app pnpm run preview
# App available at: http://localhost:4173/aaqis-app
```

## 🔧 Server Setup

### 1. Create Deployment User

```bash
# On your server
sudo adduser deployer
sudo usermod -aG www-data deployer
```

### 2. Setup SSH Key Authentication

```bash
# On your local machine, generate a new SSH key pair
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github-actions-aaqis

# Copy the public key to your server
ssh-copy-id -i ~/.ssh/github-actions-aaqis.pub deployer@your-server-ip

# Test the connection
ssh -i ~/.ssh/github-actions-aaqis deployer@your-server-ip

# Copy the PRIVATE key content and add it to GitHub Secrets as SSH_PRIVATE_KEY
cat ~/.ssh/github-actions-aaqis
```

### 3. Setup Deployment Directory

```bash
# On your server
sudo mkdir -p /var/www/aaqis
sudo chown -R deployer:www-data /var/www/aaqis
sudo chmod -R 755 /var/www/aaqis
```

### 4. Configure Nginx

Create a new Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/aaqis
```

Add the following configuration:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name afriairresilience.org;  # Replace with your domain

    root /var/www/aaqis;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # SvelteKit static adapter routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|wasm)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Disable logging for favicon and robots
    location = /favicon.ico {
        log_not_found off;
        access_log off;
    }

    location = /robots.txt {
        log_not_found off;
        access_log off;
    }
}
```

Enable the site and test configuration:

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/aaqis /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 5. Setup SSL with Certbot (Optional but Recommended)

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d afriairresilience.org

# Auto-renewal is automatically configured
# Test renewal process
sudo certbot renew --dry-run
```

### 6. Configure Sudo for Nginx Reload (Optional)

If you want the deployment to automatically reload Nginx:

```bash
# On your server
sudo visudo
```

Add this line (replace `deployer` with your SSH user):

```
deployer ALL=(ALL) NOPASSWD: /usr/sbin/nginx, /usr/bin/systemctl reload nginx
```

## 🔄 Deployment Workflow

### Development Workflow

1. Make changes and commit to feature branch
2. Create PR to `dev` branch
3. Merge PR → Automatically deploys to GitHub Pages
4. Test on GitHub Pages

### Production Workflow

1. Test thoroughly on `dev` branch (GitHub Pages)
2. Create PR from `dev` to `main`
3. Review and merge PR → Automatically deploys to production server
4. Verify deployment on production URL

## 🛠️ Manual Deployment

### Deploy Development Manually

```bash
# Trigger GitHub Pages deployment
gh workflow run deploy.yml --ref dev
```

### Deploy Production Manually

```bash
# Trigger production deployment
gh workflow run deploy-production.yml --ref main
```

Or use the "Run workflow" button in the GitHub Actions tab.

## 🐛 Troubleshooting

### SSH Connection Issues

```bash
# Test SSH connection from your local machine
ssh -i ~/.ssh/github-actions-aaqis deployer@your-server-ip

# Check SSH logs on server
sudo tail -f /var/log/auth.log
```

### Nginx Issues

```bash
# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Deployment Fails

1. Check GitHub Actions logs for detailed error messages
2. Verify all secrets are correctly set
3. Test SSH connection manually
4. Check server disk space: `df -h`
5. Check file permissions: `ls -la /var/www/aaqis`

## 📊 Monitoring

After deployment, verify:

1. ✅ Website loads correctly
2. ✅ All routes work (client-side routing)
3. ✅ Static assets load (images, CSS, JS)
4. ✅ No console errors in browser DevTools
5. ✅ SSL certificate is valid (if using HTTPS)

## 🔐 Security Best Practices

1. ✅ Use SSH keys, not passwords
2. ✅ Rotate SSH keys regularly
3. ✅ Keep server and dependencies updated
4. ✅ Use HTTPS with valid SSL certificate
5. ✅ Configure firewall (UFW or iptables)
6. ✅ Regular backups of deployment directory
7. ✅ Monitor server logs for suspicious activity

## 📚 Additional Resources

- [SvelteKit Static Adapter Docs](https://kit.svelte.dev/docs/adapter-static)
- [GitHub Actions SSH Deploy](https://github.com/marketplace/actions/ssh-deploy)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Certbot Documentation](https://certbot.eff.org/)
