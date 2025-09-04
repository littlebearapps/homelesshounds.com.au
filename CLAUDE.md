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

**Framework**: Astro v5 (Static Site Generator)  
**Styling**: Tailwind CSS v4 via Vite plugin  
**Deployment**: TBD (Netlify/Vercel recommended)  
**Content**: Markdown/MDX for dynamic content  

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

**Active Task**: Building core page structure  
**Next Milestone**: Complete essential pages (About, Contact, Adopt)  
**Priority**: Get basic site structure ready for content

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

## 🔗 Key Features to Implement

**Phase 1 - Core Pages**:
- Homepage with mission statement
- About Us page
- Contact form
- Basic navigation

**Phase 2 - Pet Adoption System**:
- Pet listing grid with filters
- Individual pet profiles
- Adoption application form
- Search functionality

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

## 💡 Key Decisions

- **Static Generation**: Using Astro for fast, SEO-friendly static sites
- **Tailwind CSS**: Utility-first for rapid, consistent styling
- **No CMS Initially**: Static content, can add CMS later if needed
- **Form Handling**: Consider Netlify Forms or similar service

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

**Token Count**: ~500 (Optimized for Claude Code)  
**Last Updated**: 2025-09-04  
**Version**: 0.1.0