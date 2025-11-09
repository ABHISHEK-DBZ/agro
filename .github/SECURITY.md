# 🔒 Security Policy

## 🛡️ Repository Security

This repository is **PRIVATE** and contains sensitive configuration and API keys.

### ⚠️ Important Security Rules

1. **DO NOT make this repository public**
2. **DO NOT share API keys or credentials**
3. **DO NOT commit `.env` files**
4. **DO NOT share Firebase configuration**

## 🔐 Protected Information

The following files contain sensitive data and are excluded from version control:

- `.env` and `.env.*` files
- `src/config/firebase.ts`
- `serviceAccountKey.json`
- Any `*.key`, `*.pem`, `*.p12` files
- Firebase configuration files

## 📋 Security Checklist

Before committing:
- ✅ Check no API keys in code
- ✅ Check `.env` is in `.gitignore`
- ✅ Check Firebase config is not exposed
- ✅ Check no credentials in comments
- ✅ Run `npm audit` for vulnerabilities

## 🚨 If Security Breach Occurs

1. **Immediately revoke all API keys**
2. **Regenerate Firebase credentials**
3. **Change all passwords**
4. **Contact repository owner**
5. **Review all recent commits**

## 📞 Contact

For security concerns, contact repository owner privately.

## 🔄 Regular Security Maintenance

- Update dependencies monthly: `npm update`
- Check vulnerabilities: `npm audit`
- Review access permissions quarterly
- Rotate API keys every 6 months

---

**Last Updated:** November 9, 2025
**Repository Owner:** ABHISHEK-DBZ
