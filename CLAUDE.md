# Homeless Hounds Website - AI Context

## 🎯 Core Info

**Primary Features**:
1. Pet adoption listings with profiles and application forms
2. Volunteer and foster care registration system
3. Donation gateway with multiple payment options

**Project Type**: Charity website (Non-commercial volunteer project)  
**Timeline**: Flexible (volunteer basis)  
**Platform**: Astro v5 + Tailwind CSS v4  
**Status**: Phase 4 - Adoption Outcome Notification System Complete

## 🔧 Technical Stack

**Framework**: Astro v5 (SSR enabled for dynamic content)
**Styling**: Tailwind CSS v4 via Vite plugin
**Deployment**: Cloudflare Pages (Active: homelesshounds-com-au.pages.dev)
**Content**: Native ASM API integration + Markdown/MDX
**Data Source**: Animal Shelter Manager (ASM) API
**Email Service**: SendGrid with templated notifications + newsletter system
**Newsletter System**: SendGrid Contacts API with comprehensive segmentation

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
│   ├── email/       # Email templates & services
│   │   ├── templates/   # Email template files
│   │   └── services/    # SendGrid integration
│   └── sendgrid-newsletter.ts # Newsletter & contact management
├── styles/          # Global styles
│   └── global.css   # Tailwind imports
└── content/         # Markdown content
```

## 🚧 Current Focus

**Recently Completed**: Full email compliance implementation - transactional vs marketing distinction (2025-09-27)
**Active Task**: Email system fully compliant with proper transactional/marketing separation
**Next Milestone**: Testing adoption outcome notifications in production
**Priority**: Verify notification system with test mode before production deployment

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

**Phase 3 - Email System & Newsletter Integration** ✅:
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
- [x] **Newsletter system with contact segmentation**
- [x] **GDPR-compliant contact management**
- [x] **Automatic form integration for newsletter signup**
- [x] **Footer newsletter component with dark theme support**
- [x] **Dual segmentation: Contact lists + Marketing lists**
- [ ] Volunteer registration form (ASM form ID 36)
- [x] Dog adoption application form (ASM form ID 70 - corrected)
- [x] Cat adoption application form (ASM form ID 65 - corrected)
- [x] Dog foster application form (ASM form ID 68)
- [x] Cat foster application form (ASM form ID 69)
- [x] Pet courier application form (ASM form ID 67)
- [x] Turnstile spam protection integration

**Phase 4 - Adoption Outcome Notification System** ✅:
- [x] **Cloudflare D1 database** for application and adoption tracking
- [x] **Submit proxy endpoint** to intercept adoption applications (form IDs 70/65)
- [x] **Cron-triggered polling worker** checks ASM every 10 minutes for adoptions
- [x] **Automated email notifications** - congratulations to winners, sorry to others
- [x] **Testing/Production mode switches** with email redirection for safe testing
- [x] **Extensible notification architecture** - ready for foster, volunteer, donation outcomes
- [x] **Admin API endpoints** - monitor, configure, suppress, test notifications
- [x] **12-hour safety delay** before notifications (configurable, disabled in test mode)
- [x] **Email matching logic** - identifies successful adopter vs other applicants
- [x] **Idempotent operations** - prevents duplicate notifications
- [x] **Comprehensive logging** and error handling with SendGrid integration
- [x] **Manual test triggers** via admin API for quality assurance
- [ ] **SendGrid email templates** for adoption outcome messages
- [ ] **Production environment setup** with all required variables

**Phase 5 - Donations**:
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
- Form ID 65: Cat adoption application ✅ (corrected - with outcome notifications)
- Form ID 67: Pet courier application ✅ (modal active)
- Form ID 68: Dog foster application ✅ (modal active)
- Form ID 69: Cat foster application ✅ (modal active)
- Form ID 70: Dog adoption application ✅ (corrected - with outcome notifications)

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
- `NOTIFICATION_MODE` - 'testing' or 'production' (controls notification system)
- `TEST_EMAIL_RECIPIENT` - Email address for test mode notifications
- `TEST_TRIGGER_VALUE` - ASM field value to trigger test notifications
- `TEMPLATE_CONGRATS_ID` - SendGrid template ID for congratulations email
- `TEMPLATE_SORRY_ID` - SendGrid template ID for sorry email
- `ADMIN_SECRET` - Authentication key for admin API endpoints

## 💡 Key Decisions

- **SSR over Static**: Using Astro SSR for dynamic ASM content
- **Native Integration**: Replace JS embeds with server-side components
- **Cloudflare Pages**: Leverages edge functions and KV storage
- **Turnstile Protection**: Anti-spam for forms (proposed)
- **Tailwind CSS**: Utility-first for rapid, consistent styling

## 🚀 SEO Tasks

### Pre-Launch Tasks
1. **Replace Open Graph image** - Create real 1200x630px image (currently placeholder)
2. **Enable Cloudflare Brotli** - Turn on in Cloudflare dashboard for compression
3. **Final SEO audit** - Test all meta tags, sitemaps, and structured data
4. **Performance testing** - Verify Core Web Vitals scores
5. **Mobile testing** - Test on real devices and Google Mobile-Friendly Test

### Post-Launch Tasks
1. **Submit sitemap to Google Search Console** - Register property and submit sitemap.xml
2. **Submit to Bing Webmaster Tools** - Register and submit sitemap
3. **Set up Google Business Profile** - Claim and optimize listing
4. **Implement FAQ schema** - Add to adoption process pages
5. **Create local event pages** - With Event schema for adoption days
6. **Monitor 404s** - Set up monitoring for broken links
7. **Track Core Web Vitals** - Monitor in Search Console
8. **Build backlinks** - Partner with local vets, councils, pet businesses

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
- See `NOTIFICATION_SYSTEM_GUIDE.md` for adoption notification system documentation
- Reference existing site: homelesshounds.com.au

**Development Approach**:
1. Build core structure first
2. Add content progressively
3. Optimize performance last
4. Test on real devices

---

**Token Count**: ~750 (Optimized for Claude Code)
**Last Updated**: 2025-09-27
**Version**: 0.9.0