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
- [x] **Phase 4**: Volunteer Portal ✅
- [x] **Phase 5**: Pet Adoption System ✅
- [ ] **Phase 6**: Donation Integration ⏳
- [ ] **Phase 7**: Content Migration ⏳
- [ ] **Phase 8**: Testing & Optimization ⏳
- [ ] **Phase 9**: Deployment & Launch ⏳

## 📈 Current Status

**Active Phase**: Phase 6 - Donation Integration
**Completion**: 70%
**Version**: 0.6.0
**Next Checkpoint**: Payment gateway integration

### Recently Completed (2025-09-20)
- [x] All adoption application forms (dog #38, cat #39)
- [x] Foster care forms (dog #68, cat #69) with modals
- [x] Pet courier application form (#67) with modal
- [x] FAQ accordions on foster and courier pages
- [x] Fixed modal ID conflicts
- [x] Thank you pages for all applications

### In Progress
- [ ] Task 6.1: Volunteer registration form (ASM form ID 36)
- [ ] Task 6.2: Payment gateway integration
- [ ] Task 6.3: Recurring donation options
- [ ] Task 6.4: Donation impact dashboard

## ✅ Features Checklist

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Homepage | ✅ | High | Complete with ASM integration |
| Pet Listings | ✅ | High | Native ASM integration |
| Surrender Form | ✅ | High | Complete with email notifications |
| Email System | ✅ | High | Production-grade with monitoring |
| Email Monitoring | ✅ | High | Real-time webhooks & alerts |
| Volunteer Page | ✅ | High | Redesigned with accordion UI |
| Privacy Policy | ✅ | Medium | Complete |
| Dog Adoption Form | ✅ | High | Modal with form ID 38 |
| Cat Adoption Form | ✅ | High | Modal with form ID 39 |
| Dog Foster Form | ✅ | High | Modal with form ID 68 |
| Cat Foster Form | ✅ | High | Modal with form ID 69 |
| Pet Courier Form | ✅ | Medium | Modal with form ID 67 |
| Volunteer Sign-up | ⏳ | Medium | Next priority (form ID 36) |
| Donation Gateway | ⏳ | High | Next phase |
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

**Last Updated**: 2025-09-20
**Maintainer**: Nathan (Volunteer Developer)
**Organization**: Homeless Hounds Animal Rescue
**Production URL**: https://homelesshounds-com-au.pages.dev