# Homeless Hounds Animal Rescue Website

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/littlebearapps/homelesshounds.com.au.git
cd homelesshounds.com.au-main

# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📊 Progress Tracker

### Development Phases
- [x] **Phase 1**: Initial Setup & Configuration ✅
- [x] **Phase 2**: Core Pages Development ✅
- [x] **Phase 3**: Email Notification System ✅
- [ ] **Phase 4**: Volunteer Portal ⏳
- [ ] **Phase 5**: Pet Adoption System ⏳
- [ ] **Phase 6**: Donation Integration ⏳
- [ ] **Phase 7**: Content Migration ⏳
- [ ] **Phase 8**: Testing & Optimization ⏳
- [ ] **Phase 9**: Deployment & Launch ⏳

## 📈 Current Status

**Active Phase**: Phase 4 - Volunteer Portal Development
**Completion**: 45%
**Version**: 0.5.0
**Next Checkpoint**: Complete volunteer and adoption application forms  

### In Progress
- [ ] Task 4.1: Volunteer registration form (ASM form ID 36)
- [ ] Task 4.2: Adoption application form (ASM form ID 39)
- [ ] Task 4.3: Remove foster care form references
- [ ] Task 4.4: General contact form (non-ASM)

## ✅ Features Checklist

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Homepage | ✅ | High | Complete with ASM integration |
| Pet Listings | ✅ | High | Native ASM integration |
| Surrender Form | ✅ | High | Complete with email notifications |
| Email System | ✅ | High | Production-grade with monitoring |
| Email Monitoring | ✅ | High | Real-time webhooks & alerts |
| Adoption Form | ⏳ | High | Next priority |
| Volunteer Sign-up | ⏳ | Medium | Next priority |
| Donation Gateway | ⏳ | High | Future phase |
| Foster Application | ❌ | Low | Requested removal |
| Events Calendar | ⏳ | Low | Future phase |
| Success Stories | ⏳ | Low | Future phase |

## 📁 Project Structure

```
homelesshounds.com.au-main/
├── src/
│   ├── pages/          # Astro pages
│   ├── components/     # Reusable components
│   ├── layouts/        # Page layouts
│   ├── styles/         # Global styles
│   └── content/        # Content collections
├── public/             # Static assets
├── astro.config.mjs    # Astro configuration
└── package.json        # Dependencies
```

## 🛠 Technical Stack

**Framework**: Astro v5 (SSR enabled)
**Styling**: Tailwind CSS v4 (Vite plugin)
**Deployment**: Cloudflare Pages (Production: homelesshounds-com-au.pages.dev)
**Content**: Native ASM API integration + Markdown/MDX
**Email Service**: SendGrid with templated notifications & monitoring
**Monitoring**: Real-time webhooks with automated alerts

**Core Features**:
- Static site generation for performance
- Responsive design for mobile/tablet/desktop
- SEO optimization
- Accessibility (WCAG 2.1 AA compliance)

## 📋 Key Pages

### Essential Pages (MVP)
1. **Homepage**: Welcome, mission, quick links
2. **Adopt a Pet**: Available pets gallery with filters
3. **Pet Profile**: Individual pet details and adoption form
4. **Volunteer**: How to help, application form
5. **Donate**: Payment options and impact info
6. **Contact**: Contact form and details
7. **About**: Organization story and team

### Additional Pages (Future Phases)
- Success Stories / Blog
- Events Calendar
- Resources for Pet Owners
- Donation portal

## 🧪 Testing

```bash
# Build the site
npm run build

# Preview production build
npm run preview

# Check for build errors
npm run check
```

## 📦 Deployment

### Pre-deployment Checklist
- [ ] All pages responsive on mobile/tablet/desktop
- [ ] Forms tested and working
- [ ] Images optimized
- [ ] Meta tags and SEO configured
- [ ] Analytics setup (if required)
- [ ] Accessibility tested
- [ ] Performance optimized (Lighthouse score >90)

## 🔗 Quick Links

**Internal Resources**:
- [CLAUDE.md](./CLAUDE.md) - AI Context
- [.claude-context](./.claude-context) - Session continuity

**External Resources**:
- [Astro Documentation](https://docs.astro.build)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Current Website](https://homelesshounds.com.au)

## 📝 Notes

This is a volunteer project for Homeless Hounds Animal Rescue, a registered charity in Victoria, Australia. The website aims to:
- Showcase adoptable pets effectively
- Streamline volunteer and foster applications
- Facilitate donations
- Share rescue success stories
- Provide resources for pet adoption

---

**Last Updated**: 2025-09-18
**Maintainer**: Nathan (Volunteer Developer)
**Organization**: Homeless Hounds Animal Rescue
**Production URL**: https://homelesshounds-com-au.pages.dev