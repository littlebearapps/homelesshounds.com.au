# Homeless Hounds Website - AI Context

## 🎯 Core Info

**Primary Features**:
1. Pet adoption listings with profiles and application forms
2. Volunteer and foster care registration system
3. Donation gateway with multiple payment options

**Project Type**: Charity website (Non-commercial volunteer project)  
**Timeline**: Flexible (volunteer basis)  
**Platform**: Astro v5 + Tailwind CSS v4  
**Status**: Phase 3 - Email System Complete with Advanced Monitoring

## 🔧 Technical Stack

**Framework**: Astro v5 (SSR enabled for dynamic content)
**Styling**: Tailwind CSS v4 via Vite plugin
**Deployment**: Cloudflare Pages (Active: homelesshounds-com-au.pages.dev)
**Content**: Native ASM API integration + Markdown/MDX
**Data Source**: Animal Shelter Manager (ASM) API
**Email Service**: SendGrid with templated notifications

**Performance Targets**:
- Lighthouse score: >90 all categories
- Page load: <2s on 3G
- Mobile-first responsive design
- WCAG 2.1 AA accessibility

## 📂 Key Files

```
src/
├── pages/           # Astro pages (.astro)
│   ├── index.astro  # Homepage
│   ├── adopt.astro  # Pet listings
│   ├── pets/        # Individual pet profiles
│   └── api/         # API endpoints (ASM, forms, email)
├── components/      # Reusable components
├── layouts/         # Page layouts
├── lib/
│   └── email/       # Email templates & services
│       ├── templates/   # Email template files
│       └── services/    # SendGrid integration
├── styles/          # Global styles
│   └── global.css   # Tailwind imports
└── content/         # Markdown content
```

## 🚧 Current Focus

**Recently Completed**: Homepage redesign with live ASM adoption carousel & comprehensive Contact Us page (2025-09-18)
**Active Task**: Core website structure complete - ready for next phase
**Next Milestone**: Implement volunteer/foster/adoption application forms
**Priority**: Build out volunteer engagement system with ASM form integration

## ⚠️ Critical Requirements

**Accessibility**:
- [x] Semantic HTML structure
- [ ] ARIA labels where needed
- [ ] Keyboard navigation support
- [ ] Screen reader testing

**User Experience**:
- Mobile-responsive design
- Fast loading on slow connections
- Clear navigation
- Prominent CTAs for adoption/donation

## 🔗 Key Features Implementation

**Phase 1 - Core Pages** ✅:
- [x] Homepage with mission statement
- [x] About Us page
- [x] Contact forms (surrender form complete)
- [x] Basic navigation

**Phase 2 - Pet Adoption System** ✅:
- [x] Pet listing grid with filters (native ASM)
- [x] Individual pet profiles (dynamic routing)
- [ ] Adoption application form (ASM form ID 38)
- [x] Search/filter functionality

**Phase 3 - Email System & Monitoring** ✅:
- [x] Animal surrender form (ASM form ID 37) with email notifications
- [x] SendGrid email system with templated notifications
- [x] Smart email routing by department (dogs/cats/general)
- [x] Complete email template system with branding
- [x] Thank you pages with personalization
- [x] **Production domain authentication** (bounce.homelesshounds.com.au)
- [x] **Link branding** (link.homelesshounds.com.au)
- [x] **Event webhooks with real-time monitoring**
- [x] **Automated alerts for critical delivery issues**
- [x] **Signature verification for webhook security**
- [ ] Volunteer registration form (ASM form ID 36)
- [ ] Adoption application form (ASM form ID 39)
- [x] Turnstile spam protection integration

**Phase 4 - Donations**:
- Payment gateway integration
- Recurring donation options
- Donation impact information

## 📊 Success Metrics

**Technical**: Site loads <2s, mobile-friendly, accessible  
**User**: Clear user journeys for adoption/volunteering/donating  
**Organization**: Increased adoption inquiries and volunteer sign-ups

## 🚨 Important Considerations

**Content Migration**: Need to review current site for content to migrate  
**Forms**: ✅ Email notification system complete (SendGrid)  
**Images**: Pet photos need optimization for web  
**SEO**: Meta tags and structured data for pet listings

## 🏗️ ASM Integration Details

**API Endpoints** (Working):
- `/api/asm/adoptable` - List adoptable animals ✅
- `/api/asm/animal/[id]` - Individual animal details ✅
- `/api/asm/form-schema` - Form structure with HTML fallback ✅
- `/api/submit` - Universal form submission with Turnstile ✅

**Form ID Mapping** (ASM):
- Form ID 36: Volunteer registration
- Form ID 37: Animal surrender ✅ (with email notifications)
- Form ID 38: Adoption application
- Form ID 39: Foster care application

**ASM API Authentication**:
- **Service Account**: `api_service_account` (no-login account for API-only access)
- **Account ID**: `st3418`
- **Base URL**: `https://service.sheltermanager.com/asmservice`
- **Local Dev**: Uses `.env` file with fallback to `import.meta.env`
- **Production**: Uses Cloudflare Pages environment variables

**Environment Variables** (Required):
- `ASM_ACCOUNT` - Account ID (st3418)
- `ASM_BASE_URL` - API base URL
- `ASM_USERNAME` - API service account username
- `ASM_PASSWORD` - API service account password
- `SENDGRID_API_KEY` - SendGrid API key for email notifications
- `SENDGRID_WEBHOOK_PUBLIC_KEY` - Webhook signature verification
- `EMAIL_*` - Smart routing emails for different departments

## 💡 Key Decisions

- **SSR over Static**: Using Astro SSR for dynamic ASM content
- **Native Integration**: Replace JS embeds with server-side components
- **Cloudflare Pages**: Leverages edge functions and KV storage
- **Turnstile Protection**: Anti-spam for forms (proposed)
- **Tailwind CSS**: Utility-first for rapid, consistent styling

## 📝 Notes for Claude

**Remember**:
- This is a charity website - focus on clarity and compassion
- Mobile-first design is essential
- Accessibility is non-negotiable
- Keep it simple and user-friendly
- Performance matters for users on mobile data

**Context Files**:
- See `.claude-context` for session continuity
- Check `README.md` for project progress
- Reference existing site: homelesshounds.com.au

**Development Approach**:
1. Build core structure first
2. Add content progressively
3. Optimize performance last
4. Test on real devices

---

**Token Count**: ~650 (Optimized for Claude Code)
**Last Updated**: 2025-09-18
**Version**: 0.5.0