# Homeless Hounds Website - AI Context

## 🎯 Core Info

**Primary Features**:
1. Pet adoption listings with profiles and application forms
2. Volunteer and foster care registration system
3. Donation gateway with multiple payment options

**Project Type**: Charity website (Non-commercial volunteer project)  
**Timeline**: Flexible (volunteer basis)  
**Platform**: Astro v5 + Tailwind CSS v4  
**Status**: Phase 2 - Core Pages Development

## 🔧 Technical Stack

**Framework**: Astro v5 (SSR enabled for dynamic content)  
**Styling**: Tailwind CSS v4 via Vite plugin  
**Deployment**: Cloudflare Pages (Active: homelesshounds-com-au.pages.dev)  
**Content**: Native ASM API integration + Markdown/MDX  
**Data Source**: Animal Shelter Manager (ASM) API

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
│   └── pets/        # Individual pet profiles
├── components/      # Reusable components
├── layouts/         # Page layouts
├── styles/          # Global styles
│   └── global.css   # Tailwind imports
└── content/         # Markdown content
```

## 🚧 Current Focus

**Recently Completed**: Native ASM integration for adoption pages  
**Active Task**: Implementing native forms with Turnstile protection  
**Next Milestone**: Complete surrender/contact forms with ASM integration  
**Priority**: Replace all JavaScript embeds with native components

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
- [ ] Contact forms (in progress)
- [x] Basic navigation

**Phase 2 - Pet Adoption System** ✅:
- [x] Pet listing grid with filters (native ASM)
- [x] Individual pet profiles (dynamic routing)
- [ ] Adoption application form (next)
- [x] Search/filter functionality

**Phase 3 - Volunteer System**:
- Volunteer registration form
- Foster care application
- Volunteer resources page

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
**Forms**: All forms need email notification system  
**Images**: Pet photos need optimization for web  
**SEO**: Meta tags and structured data for pet listings

## 🏗️ ASM Integration Details

**API Endpoints** (Cloudflare Pages Functions):
- `/api/asm/adoptable` - List adoptable animals
- `/api/asm/animal/[id]` - Individual animal details  
- `/api/asm/form-schema` - Form structure (proposed)
- `/api/submit/surrender` - Form submission (proposed)

**Environment Variables** (Cloudflare Pages):
- `ASM_ACCOUNT` - Account ID (st3418)
- `ASM_BASE_URL` - API base URL
- `ASM_USERNAME` - API username (encrypted)
- `ASM_PASSWORD` - API password (encrypted)

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

**Token Count**: ~600 (Optimized for Claude Code)  
**Last Updated**: 2025-09-05  
**Version**: 0.2.0