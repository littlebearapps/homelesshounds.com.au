# Homeless Hounds Notification System Guide

## Overview

The notification system is now enhanced with **testing/production modes** and **extensible architecture** for future notification types.

## 🧪 Testing vs Production Modes

### Production Mode (Default)
- **Environment**: `NOTIFICATION_MODE=production`
- **Behavior**: Normal operation - real emails to real applicants
- **Polling**: Checks ASM `json_recent_adoptions` for actual adoptions
- **Delay**: 12-hour safety delay before notifications

### Testing Mode
- **Environment**: `NOTIFICATION_MODE=testing`
- **Behavior**: All emails redirected to test address
- **Polling**: Watches for test trigger in ASM animal records
- **Delay**: Immediate processing for quick testing

## 🔧 Testing Configuration

### Environment Variables
```bash
# Testing Mode
NOTIFICATION_MODE="testing"                         # Enable test mode
TEST_EMAIL_RECIPIENT="web@homelesshounds.com.au"   # All emails go here
TEST_TRIGGER_VALUE="TEST_ADOPTION_NOTIFICATION"    # Trigger value for ASM field

# Production Mode
NOTIFICATION_MODE="production"                      # Normal operation
```

### Test Trigger Process

1. **Set Testing Mode**: Update `NOTIFICATION_MODE=testing` in Cloudflare Pages
2. **Trigger Test**: In ASM animal record, set the `HEALTHPROBLEMS` field to `TEST_ADOPTION_NOTIFICATION`
3. **Wait**: Next cron run (up to 10 minutes) will detect the trigger
4. **Test Emails**: Both congrats and sorry emails sent to `web@homelesshounds.com.au`
5. **Clean Up**: Clear the `HEALTHPROBLEMS` field or set back to original value

### Test Email Format
Test emails include:
- 🧪 **Test notice** in subject/body
- **Original recipient** information
- **Test mode indicators**
- **Special test categories** for SendGrid analytics

## 🚀 Admin API Endpoints

### Notification Configuration
```bash
# View all notification configs
GET /api/admin/notifications/config
Headers: x-admin-key: YOUR_ADMIN_SECRET

# Update notification settings
POST /api/admin/notifications/config
Headers: x-admin-key: YOUR_ADMIN_SECRET
Body: {
  "notification_type": "adoption_outcome",
  "enabled": true,
  "test_mode": false,
  "delay_hours": 12
}
```

### Test Triggers
```bash
# Manual test trigger (creates synthetic adoption)
POST /api/admin/notifications/test-trigger
Headers: x-admin-key: YOUR_ADMIN_SECRET
Body: {
  "animal_id": "12345",
  "action": "force_test"
}

# Get instructions for ASM field trigger
POST /api/admin/notifications/test-trigger
Body: {
  "animal_id": "12345",
  "action": "set_trigger"
}
```

### Existing Endpoints (Enhanced)
```bash
# View adoption events (now shows test vs production)
GET /api/admin/adoptions
Headers: x-admin-key: YOUR_ADMIN_SECRET

# Suppress notifications for animal
POST /api/admin/adoptions/{animal_id}/suppress
Headers: x-admin-key: YOUR_ADMIN_SECRET
Body: {"suppressed": true, "reason": "Special case"}
```

## 🔮 Extensible Architecture

The system is now designed to support multiple notification types beyond adoption outcomes.

### Current Implementation
- **adoption_outcome**: Congratulations to winners, sorry to others

### Easy to Add in Future
- **foster_outcome**: Foster application results
- **volunteer_followup**: Welcome messages for new volunteers
- **medical_updates**: Health update notifications
- **event_reminders**: Adoption day reminders
- **donation_thanks**: Thank you messages for donors

### Adding New Notification Types

1. **Add Configuration**:
```sql
INSERT INTO notification_configs (
  notification_type,
  display_name,
  description,
  asm_api_method,
  template_success_id
) VALUES (
  'foster_outcome',
  'Foster Application Results',
  'Notifies foster applicants of outcomes',
  'json_recent_foster_outcomes',
  'd-foster-success-template'
);
```

2. **Add Processor Function**:
```typescript
async function processFosterOutcomes(env: Env, config: NotificationConfig) {
  // Similar pattern to processAdoptionOutcomes
  // Fetch data from ASM
  // Match applicants
  // Send notifications
}
```

3. **Register in Cron Worker**:
```typescript
case 'foster_outcome':
  await processFosterOutcomes(env, config);
  break;
```

## 📊 Database Schema

### Core Tables
- `notification_configs` - Configuration for each notification type
- `notification_events` - Generic events (extensible)
- `notification_applications` - Generic applications (extensible)
- `notification_queue` - Generic notification queue
- `notification_poll_state` - Polling state per notification type

### Legacy Tables (Adoption-Specific)
- `applications` - Adoption applications (still used)
- `adoption_events` - Adoption events (still used)
- `adoption_outcome_notifications` - Adoption notifications (still used)

## 🛠️ Deployment Checklist

### 1. Database Setup
```bash
# Create D1 database
wrangler d1 create homeless_hounds_adoptions

# Run migrations
wrangler d1 migrations apply homeless_hounds_adoptions --local
wrangler d1 migrations apply homeless_hounds_adoptions --remote
```

### 2. Environment Variables
Set in Cloudflare Pages dashboard:
```bash
# Core Settings
NOTIFICATION_MODE=production
TEST_EMAIL_RECIPIENT=web@homelesshounds.com.au
TEST_TRIGGER_VALUE=TEST_ADOPTION_NOTIFICATION
ADMIN_SECRET=your-secret-key

# SendGrid (create templates first)
SENDGRID_API_KEY=SG.xxxxx
TEMPLATE_CONGRATS_ID=d-xxxxx
TEMPLATE_SORRY_ID=d-xxxxx

# ASM (existing)
ASM_USERNAME=api_service_account
ASM_PASSWORD=your-password
```

### 3. Test Mode Verification
1. Set `NOTIFICATION_MODE=testing`
2. Apply for an animal (creates application record)
3. Use admin API to force test: `POST /api/admin/notifications/test-trigger`
4. Check `web@homelesshounds.com.au` for test emails
5. Switch to `NOTIFICATION_MODE=production`

## 🎯 Next Steps

1. **Create SendGrid Templates** 📧
   - Design congratulations template
   - Design sorry template with encouragement
   - Include test mode indicators

2. **Test the System** 🧪
   - Deploy to staging
   - Run through complete test cycle
   - Verify all emails work correctly

3. **Launch** 🚀
   - Deploy to production
   - Monitor admin dashboard
   - Set up alerts for failed notifications

## 💡 Future Enhancements

- **Email Analytics**: Track open/click rates per notification type
- **A/B Testing**: Test different email templates
- **Scheduling**: Send notifications at optimal times
- **Segmentation**: Different templates based on applicant history
- **Multi-language**: Support for different languages
- **SMS Notifications**: Alternative to email
- **Push Notifications**: For mobile app integration

---

**System Status**: ✅ Ready for SendGrid templates and deployment
**Architecture**: ✅ Future-proof and extensible
**Testing**: ✅ Comprehensive test mode available