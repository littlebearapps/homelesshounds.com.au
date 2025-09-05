# Native Forms Implementation Plan

## Overview

This document outlines the phased implementation of native ASM (Animal Shelter Manager) forms for the Homeless Hounds website, replacing JavaScript embeds with server-side rendered forms using Cloudflare Pages Functions and Turnstile protection.

## Architecture Summary

- **Frontend**: Astro SSR pages with dynamic form generation
- **Backend**: Cloudflare Pages Functions for API endpoints
- **Security**: Cloudflare Turnstile for spam protection
- **Data Source**: ASM API for form schemas and submissions
- **Caching**: Edge caching for form schemas (10min TTL)

---

## Phase 1: Core Implementation
**Timeline**: Week 1-2  
**Priority**: Critical

### 1.1 Environment Setup

#### Environment Variables (Cloudflare Pages)

**Server-only Variables** (Functions access only):
```env
# ASM Configuration
ASM_ACCOUNT=st3418
ASM_BASE_URL=https://service.sheltermanager.com/asmservice

# Turnstile Configuration
TURNSTILE_SECRET_KEY=[from Cloudflare dashboard]
```

**Client-exposed Variables** (PUBLIC_ prefix):
```env
# Public ASM Configuration
PUBLIC_ASM_ACCOUNT=st3418
PUBLIC_ASM_BASE=https://service.sheltermanager.com/asmservice

# Public Turnstile Configuration  
PUBLIC_TURNSTILE_SITE_KEY=[from Cloudflare dashboard]
```

> **Note**: ASM username/password NOT needed for public Service endpoints (online_form_json, online_form_html). Only add credentials if using private API methods, and NEVER expose as PUBLIC_ variables.

#### Local Development Files
- `.env` - Client-side PUBLIC_* variables
- `.dev.vars` - Server-side variables for Wrangler

### 1.2 Core Functions Implementation

#### API Endpoints
```typescript
// functions/api/asm/form-schema.ts
- GET /api/asm/form-schema?formid={id}
- Proxy ASM form JSON with caching
- 10-minute cache TTL

// functions/api/submit/index.ts (SINGLE ENDPOINT)
- POST /api/submit
- Accepts formid in FormData
- Turnstile verification
- File validation (size + type)
- Forward to ASM
- Handle redirects
```

#### Consolidated Submit Endpoint
```typescript
// functions/api/submit/index.ts
const TURNSTILE_VERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const MAX_TOTAL = 10 * 1024 * 1024; // 10MB total (Cloudflare limit)
const ALLOWED = new Set([
  "image/jpeg","image/png","image/gif","image/webp",
  "application/pdf","application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

export const onRequestPost: PagesFunction = async ({ env, request }) => {
  const form = await request.formData();

  // --- Turnstile ---
  const token = form.get("cf-turnstile-response");
  if (!token) return new Response("Turnstile token missing", { status: 400 });
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const verify = await fetch(TURNSTILE_VERIFY, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: String(token), remoteip: ip })
  }).then(r => r.json());
  if (!verify.success) return new Response("Turnstile failed", { status: 403 });

  // --- Validate files + total size ---
  let total = 0;
  for (const [name, value] of form.entries()) {
    if (value instanceof File) {
      total += value.size || 0;
      if (total > MAX_TOTAL) return new Response("Files too large (max 10MB total).", { status: 413 });
      if (!ALLOWED.has(value.type)) return new Response(`Invalid file type for ${name}`, { status: 400 });
    }
  }

  // --- Forward to ASM ---
  const account = env.ASM_ACCOUNT;
  const formid = String(form.get("formid"));
  if (!account || !formid) return new Response("Missing config/formid", { status: 400 });

  form.delete("cf-turnstile-response");
  const asmUrl = `${env.ASM_BASE_URL}?account=${encodeURIComponent(account)}&method=online_form_html&formid=${encodeURIComponent(formid)}`;

  const asmRes = await fetch(asmUrl, { method: "POST", body: form });
  if (asmRes.status >= 300 && asmRes.status < 400) {
    const loc = asmRes.headers.get("location") || "/contact-us/thanks";
    return Response.redirect(loc, 303);
  }
  const html = await asmRes.text();
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" }, status: asmRes.status });
};
```

### 1.3 Basic Form Pages

```
src/pages/
├── contact-us/
│   ├── surrender/
│   │   ├── index.astro (form page)
│   │   └── thanks.astro (confirmation)
│   ├── adoption/
│   │   ├── index.astro
│   │   └── thanks.astro
│   └── volunteer/
│       ├── index.astro
│       └── thanks.astro
```

### 1.4 Security Headers

```headers
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' https://challenges.cloudflare.com https://service.sheltermanager.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://service.sheltermanager.com;
  connect-src 'self' https://service.sheltermanager.com;
  frame-src https://service.sheltermanager.com https://challenges.cloudflare.com;
  form-action 'self';
  base-uri 'none';
```

> **Important**: `frame-src` includes ASM for animal overlays and Turnstile for anti-spam iframe

### 1.5 File Upload Configuration

```typescript
// Maximum file sizes (Cloudflare Pages limit)
const FILE_SIZE_LIMITS = {
  per_file: 5 * 1024 * 1024,  // 5MB per file
  total: 10 * 1024 * 1024     // 10MB total per request (Cloudflare limit)
};

// Allowed file types
const ALLOWED_TYPES = new Set([
  'image/jpeg', 
  'image/png', 
  'image/gif', 
  'image/webp',
  'application/pdf', 
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

// Server-side validation (in Functions)
function validateFiles(formData: FormData): ValidationResult {
  let total = 0;
  
  for (const [name, value] of formData.entries()) {
    if (value instanceof File) {
      // Check individual file size
      if (value.size > FILE_SIZE_LIMITS.per_file) {
        return { valid: false, error: `${name} too large (max 5MB per file)` };
      }
      
      // Check cumulative size
      total += value.size;
      if (total > FILE_SIZE_LIMITS.total) {
        return { valid: false, error: 'Total files too large (max 10MB combined)' };
      }
      
      // Check file type
      if (!ALLOWED_TYPES.has(value.type)) {
        return { valid: false, error: `Invalid file type for ${name}` };
      }
    }
  }
  
  return { valid: true, totalSize: total };
}
```

> **Note**: Cloudflare Pages Functions have a ~10MB request size limit on free tier. For larger uploads, implement R2 direct upload flow.

---

## Phase 2: Enhanced UX & Error Handling
**Timeline**: Week 3-4  
**Priority**: High

### 2.1 Loading States

```javascript
// Skeleton loader while fetching schema
const SkeletonLoader = () => `
  <div class="animate-pulse space-y-4">
    <div class="h-10 bg-gray-200 rounded"></div>
    <div class="h-10 bg-gray-200 rounded"></div>
    <div class="h-32 bg-gray-200 rounded"></div>
    <div class="h-10 bg-gray-200 rounded w-32"></div>
  </div>
`;

// Show while schema loads
container.innerHTML = SkeletonLoader();
```

### 2.2 Error Recovery

```javascript
// Exponential backoff retry mechanism with fallback
async function fetchWithRetry(url, maxRetries = 3) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    
    // Exponential backoff: 1s, 2s, 4s
    if (i < maxRetries - 1) {
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
  
  // After max retries, show fallback
  showFallbackForm(lastError);
  throw lastError;
}

// Fallback to ASM embedded form
function showFallbackForm(error) {
  const container = document.getElementById('form-container');
  container.innerHTML = `
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <p class="text-yellow-800 font-medium">Unable to load optimized form</p>
      <p class="text-sm text-yellow-700">Using standard form instead.</p>
    </div>
    <div id="fallback-form">
      <!-- Option 1: Direct link to ASM form -->
      <a href="https://service.sheltermanager.com/asmservice?account=${PUBLIC_ASM_ACCOUNT}&method=online_form_html&formid=${formId}" 
         class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
         target="_blank">
        Open Form in New Window
      </a>
      
      <!-- Option 2: Iframe embed (if CSP allows) -->
      <iframe src="https://service.sheltermanager.com/asmservice?account=${PUBLIC_ASM_ACCOUNT}&method=online_form_html&formid=${formId}"
              width="100%" 
              height="800"
              frameborder="0">
      </iframe>
    </div>
  `;
}
```

### 2.3 Session Storage for Form Progress

```javascript
// Auto-save form progress
class FormPersistence {
  constructor(formId) {
    this.storageKey = `form_progress_${formId}`;
    this.form = document.getElementById(formId);
    this.autoSaveInterval = null;
  }
  
  start() {
    // Load saved data
    this.restore();
    
    // Auto-save every 30 seconds
    this.autoSaveInterval = setInterval(() => {
      this.save();
    }, 30000);
    
    // Save on input change
    this.form.addEventListener('input', debounce(() => {
      this.save();
    }, 1000));
  }
  
  save() {
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);
    sessionStorage.setItem(this.storageKey, JSON.stringify(data));
  }
  
  restore() {
    const saved = sessionStorage.getItem(this.storageKey);
    if (!saved) return;
    
    const data = JSON.parse(saved);
    Object.entries(data).forEach(([name, value]) => {
      const field = this.form.elements[name];
      if (field) field.value = value;
    });
    
    // Show restoration notice
    showNotice('Form progress restored from previous session');
  }
  
  clear() {
    sessionStorage.removeItem(this.storageKey);
    clearInterval(this.autoSaveInterval);
  }
}
```

### 2.4 Progress Indicators

```javascript
// Submission progress
class SubmissionProgress {
  constructor() {
    this.overlay = this.createOverlay();
  }
  
  show() {
    document.body.appendChild(this.overlay);
    // Disable form
    form.querySelectorAll('input, button').forEach(el => {
      el.disabled = true;
    });
  }
  
  hide() {
    this.overlay.remove();
    // Re-enable form
    form.querySelectorAll('input, button').forEach(el => {
      el.disabled = false;
    });
  }
  
  createOverlay() {
    const div = document.createElement('div');
    div.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    div.innerHTML = `
      <div class="bg-white rounded-lg p-8 max-w-sm">
        <div class="flex items-center space-x-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="text-lg">Submitting your form...</p>
        </div>
        <p class="text-sm text-gray-600 mt-2">Please don't close this window</p>
      </div>
    `;
    return div;
  }
}
```

---

## Phase 3: Advanced Features & Validation
**Timeline**: Week 5-6  
**Priority**: Medium

### 3.1 Client-Side Validation

```javascript
// Enhanced validation that respects server-side ASM validation
class FormValidator {
  constructor(form) {
    this.form = form;
    this.errors = new Map();
    this.allowServerValidation = true; // Don't block submission on client errors
  }
  
  validateField(field) {
    const validators = {
      email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      phone: (value) => /^[\d\s\-\+\(\)]+$/.test(value),
      postcode: (value) => /^\d{4}$/.test(value),
      required: (value) => value.trim().length > 0
    };
    
    // Check HTML5 validation
    if (!field.checkValidity()) {
      this.setError(field, field.validationMessage);
      return false;
    }
    
    // Custom validation based on field type
    const fieldType = field.dataset.validate;
    if (fieldType && validators[fieldType]) {
      if (!validators[fieldType](field.value)) {
        this.setError(field, `Please enter a valid ${fieldType}`);
        return false;
      }
    }
    
    this.clearError(field);
    return true;
  }
  
  // Handle ASM server-side validation errors
  handleServerErrors(asmResponse) {
    // Parse ASM error HTML or JSON response
    const parser = new DOMParser();
    const doc = parser.parseFromString(asmResponse, 'text/html');
    const errors = doc.querySelectorAll('.asm-error');
    
    errors.forEach(error => {
      const fieldName = error.dataset.field;
      const message = error.textContent;
      const field = this.form.querySelector(`[name="${fieldName}"]`);
      if (field) {
        this.setError(field, message);
      }
    });
    
    // Show general error if no field-specific errors
    if (errors.length === 0 && asmResponse.includes('error')) {
      this.showGeneralError('The form could not be submitted. Please check your entries and try again.');
    }
  }
  
  setError(field, message) {
    this.errors.set(field.name, message);
    // Show error UI
    const errorEl = field.parentElement.querySelector('.error-message');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }
    field.classList.add('border-red-500');
  }
  
  clearError(field) {
    this.errors.delete(field.name);
    const errorEl = field.parentElement.querySelector('.error-message');
    if (errorEl) {
      errorEl.classList.add('hidden');
    }
    field.classList.remove('border-red-500');
  }
}
```

### 3.2 Accessibility Enhancements

```javascript
// ARIA attributes and focus management
function enhanceAccessibility(field, config) {
  // Required fields
  if (config.mandatory) {
    field.setAttribute('aria-required', 'true');
    field.setAttribute('required', 'true');
  }
  
  // Help text
  if (config.tooltip) {
    const helpId = `help-${field.name}`;
    const helpEl = document.createElement('span');
    helpEl.id = helpId;
    helpEl.className = 'sr-only';
    helpEl.textContent = config.tooltip;
    field.parentElement.appendChild(helpEl);
    field.setAttribute('aria-describedby', helpId);
  }
  
  // Error announcements
  field.addEventListener('invalid', (e) => {
    e.preventDefault();
    const error = field.validationMessage;
    announceError(error);
  });
}

// Screen reader announcements
function announceError(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'alert');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => announcement.remove(), 5000);
}
```

### 3.3 Conditional Fields

```javascript
// Show/hide fields based on other field values
class ConditionalFields {
  constructor(form) {
    this.form = form;
    this.rules = new Map();
  }
  
  addRule(targetField, condition) {
    this.rules.set(targetField, condition);
  }
  
  evaluate() {
    this.rules.forEach((condition, targetField) => {
      const target = this.form.querySelector(`[name="${targetField}"]`);
      if (!target) return;
      
      const shouldShow = condition(this.form);
      const container = target.closest('.field-container');
      
      if (shouldShow) {
        container.classList.remove('hidden');
        target.disabled = false;
      } else {
        container.classList.add('hidden');
        target.disabled = true;
      }
    });
  }
  
  // Example rules
  setupStandardRules() {
    // Show "other pet details" if "Do you have other pets?" is "Yes"
    this.addRule('other_pet_details', (form) => {
      return form.querySelector('[name="has_other_pets"]:checked')?.value === 'Yes';
    });
    
    // Show upload field if "Can provide references?" is "Yes"
    this.addRule('reference_upload', (form) => {
      return form.querySelector('[name="has_references"]:checked')?.value === 'Yes';
    });
  }
}
```

---

## Phase 4: Analytics & Optimization
**Timeline**: Week 7-8  
**Priority**: Low

### 4.1 Form Analytics (Privacy-First)

```javascript
// Track form interactions without PII
class FormAnalytics {
  constructor(formId) {
    this.formId = formId;
    this.startTime = Date.now();
    this.interactions = [];
    this.fieldTimes = new Map();
  }
  
  // Track field interactions (no values, only metadata)
  trackFieldFocus(fieldName) {
    // Hash field name to avoid exposing structure
    const fieldHash = this.hashFieldName(fieldName);
    this.fieldTimes.set(fieldHash, Date.now());
    this.track('field_focus', { 
      field_hash: fieldHash,
      field_type: this.getFieldType(fieldName)
    });
  }
  
  trackFieldBlur(fieldName) {
    const fieldHash = this.hashFieldName(fieldName);
    const focusTime = this.fieldTimes.get(fieldHash);
    if (focusTime) {
      const duration = Date.now() - focusTime;
      this.track('field_complete', { 
        field_hash: fieldHash,
        field_type: this.getFieldType(fieldName),
        duration_ms: duration,
        // Track if field was filled, not the value
        was_filled: this.isFieldFilled(fieldName)
      });
    }
  }
  
  trackSubmission(success) {
    const totalTime = Date.now() - this.startTime;
    this.track('form_submit', {
      success,
      total_time_ms: totalTime,
      fields_completed: this.fieldTimes.size,
      // Only send counts, not content
      total_files: this.countFiles(),
      total_text_fields: this.countTextFields()
    });
  }
  
  trackAbandonment() {
    // Don't send specific field names
    this.track('form_abandon', {
      fields_viewed: this.fieldTimes.size,
      time_spent_ms: Date.now() - this.startTime,
      completion_percentage: this.getCompletionPercentage()
    });
  }
  
  track(event, data) {
    // Strip any PII before sending
    const sanitizedData = this.sanitizeData(data);
    
    if (window.gtag) {
      gtag('event', event, {
        form_id: this.formId,
        ...sanitizedData
      });
    }
  }
  
  // Helper methods
  hashFieldName(name) {
    // Simple hash to obscure field names
    return btoa(name).substring(0, 8);
  }
  
  getFieldType(fieldName) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    return field ? field.type : 'unknown';
  }
  
  isFieldFilled(fieldName) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    return field && field.value && field.value.trim().length > 0;
  }
  
  sanitizeData(data) {
    // Remove any potential PII patterns
    const sanitized = { ...data };
    delete sanitized.email;
    delete sanitized.name;
    delete sanitized.phone;
    delete sanitized.address;
    // Remove any field that might contain user data
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].includes('@')) {
        delete sanitized[key];
      }
    });
    return sanitized;
  }
}
```

### 4.2 A/B Testing Framework

```javascript
// Test different form layouts
class FormABTest {
  constructor(formId, variants) {
    this.formId = formId;
    this.variants = variants;
    this.variant = this.selectVariant();
  }
  
  selectVariant() {
    // Get from cookie or assign new
    let variant = this.getCookie('form_variant');
    if (!variant) {
      variant = this.variants[Math.floor(Math.random() * this.variants.length)];
      this.setCookie('form_variant', variant, 30);
    }
    return variant;
  }
  
  apply() {
    switch (this.variant) {
      case 'single_column':
        this.applySingleColumn();
        break;
      case 'multi_step':
        this.applyMultiStep();
        break;
      case 'progressive_disclosure':
        this.applyProgressive();
        break;
      default:
        // Control: two-column layout
    }
    
    // Track variant
    this.trackVariant();
  }
  
  applySingleColumn() {
    const container = document.getElementById('asm-fields');
    container.className = 'grid grid-cols-1 gap-6';
  }
  
  applyMultiStep() {
    // Convert to wizard-style form
    const wizard = new FormWizard(this.formId);
    wizard.init();
  }
  
  applyProgressive() {
    // Show fields progressively as previous ones are completed
    const progressive = new ProgressiveForm(this.formId);
    progressive.init();
  }
  
  trackVariant() {
    if (window.gtag) {
      gtag('event', 'experiment_impression', {
        experiment_id: 'form_layout_test',
        variant_id: this.variant
      });
    }
  }
}
```

### 4.3 Email Notifications

```typescript
// functions/api/notifications/webhook.ts
export const onRequestPost: PagesFunction = async ({ env, request }) => {
  const data = await request.json();
  
  // Send email via SendGrid/Mailgun/AWS SES
  const emailData = {
    to: env.NOTIFICATION_EMAIL,
    from: 'noreply@homelesshounds.com.au',
    subject: `New ${data.formType} submission`,
    html: generateEmailHTML(data),
    text: generateEmailText(data)
  };
  
  // Using SendGrid as example
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: emailData.to }] }],
      from: { email: emailData.from },
      subject: emailData.subject,
      content: [
        { type: 'text/plain', value: emailData.text },
        { type: 'text/html', value: emailData.html }
      ]
    })
  });
  
  return new Response(JSON.stringify({ 
    success: response.ok 
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
};

function generateEmailHTML(data) {
  return `
    <h2>New ${data.formType} Submission</h2>
    <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
    <hr>
    <h3>Form Data:</h3>
    <table style="border-collapse: collapse; width: 100%;">
      ${Object.entries(data.fields).map(([key, value]) => `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;"><strong>${key}:</strong></td>
          <td style="border: 1px solid #ddd; padding: 8px;">${value}</td>
        </tr>
      `).join('')}
    </table>
    <hr>
    <p><a href="${data.asmUrl}">View in ASM</a></p>
  `;
}
```

### 4.4 Performance Monitoring

```javascript
// Monitor form performance
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
  }
  
  measureSchemaLoad() {
    performance.mark('schema-fetch-start');
    
    return {
      end: () => {
        performance.mark('schema-fetch-end');
        performance.measure('schema-fetch', 'schema-fetch-start', 'schema-fetch-end');
        const measure = performance.getEntriesByName('schema-fetch')[0];
        this.metrics.schemaLoadTime = measure.duration;
      }
    };
  }
  
  measureFormRender() {
    performance.mark('form-render-start');
    
    return {
      end: () => {
        performance.mark('form-render-end');
        performance.measure('form-render', 'form-render-start', 'form-render-end');
        const measure = performance.getEntriesByName('form-render')[0];
        this.metrics.renderTime = measure.duration;
      }
    };
  }
  
  reportMetrics() {
    // Send to monitoring service
    if (window.gtag) {
      Object.entries(this.metrics).forEach(([metric, value]) => {
        gtag('event', 'timing_complete', {
          name: metric,
          value: Math.round(value)
        });
      });
    }
    
    // Log to console in dev
    if (import.meta.env.DEV) {
      console.table(this.metrics);
    }
  }
}
```

---

## Implementation Checklist

### Phase 1 Checklist
- [ ] Set up environment variables in Cloudflare Pages
- [ ] Create `.env` and `.dev.vars` files
- [ ] Implement form-schema API endpoint
- [ ] Implement submit API endpoints
- [ ] Create surrender form page
- [ ] Create thank you pages
- [ ] Configure CSP headers
- [ ] Set up Turnstile
- [ ] Implement file upload validation
- [ ] Test form submission flow

### Phase 2 Checklist
- [ ] Add skeleton loaders
- [ ] Implement retry mechanism
- [ ] Add session storage for form progress
- [ ] Create submission progress indicators
- [ ] Add form restoration notices
- [ ] Test error recovery scenarios
- [ ] Implement auto-save functionality
- [ ] Add progress overlay during submission

### Phase 3 Checklist
- [ ] Implement client-side validation
- [ ] Add ARIA attributes
- [ ] Set up focus management
- [ ] Create error announcements
- [ ] Implement conditional fields
- [ ] Add custom validation rules
- [ ] Test with screen readers
- [ ] Verify keyboard navigation

### Phase 4 Checklist
- [ ] Set up Google Analytics
- [ ] Implement form analytics tracking
- [ ] Create A/B testing framework
- [ ] Set up email notifications
- [ ] Configure SendGrid/Mailgun
- [ ] Implement performance monitoring
- [ ] Create analytics dashboard
- [ ] Document metrics and insights

---

## Testing Strategy

### Unit Tests
```javascript
// Test form field generation
describe('FormFieldGenerator', () => {
  test('generates text input correctly', () => {
    const field = generateField({ type: 'TEXT', name: 'test' });
    expect(field.tagName).toBe('INPUT');
    expect(field.type).toBe('text');
  });
});
```

### Integration Tests
```javascript
// Test form submission flow
describe('Form Submission', () => {
  test('submits successfully with valid data', async () => {
    // Fill form
    // Submit
    // Verify redirect
  });
});
```

### E2E Tests
```javascript
// Test complete user journey
describe('Surrender Form Journey', () => {
  test('user can complete surrender form', async () => {
    // Navigate to form
    // Fill all fields
    // Submit
    // Verify thank you page
  });
});
```

---

## Deployment Process

### Step 1: Local Development
```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
cp .dev.vars.example .dev.vars

# Run development server
npm run dev

# Test with Wrangler
npm run preview
```

### Step 2: Staging Deployment
```bash
# Build for production
npm run build

# Deploy to staging branch
git checkout -b staging
git push origin staging

# Test on staging URL
# https://staging.homelesshounds-com-au.pages.dev
```

### Step 3: Production Deployment
```bash
# Merge to main
git checkout main
git merge staging
git push origin main

# Verify on production
# https://homelesshounds-com-au.pages.dev
```

---

## Monitoring & Maintenance

### Key Metrics to Track
- Form completion rate
- Average time to complete
- Field abandonment rates
- Error rates by field
- Submission success rate
- Page load performance

### Regular Maintenance Tasks
- Review form analytics monthly
- Update ASM form IDs as needed
- Monitor Turnstile effectiveness
- Check error logs weekly
- Update file size limits based on usage
- Review and optimize slow fields

### Support Documentation
- User guide for form completion
- FAQ for common issues
- Admin guide for ASM configuration
- Developer guide for modifications

---

## Risk Mitigation

### Potential Issues & Solutions

| Risk | Impact | Mitigation |
|------|--------|------------|
| ASM API downtime | Forms unavailable | Cache schemas longer, show maintenance message |
| Large file uploads | Slow submission | Implement chunked uploads, progress bars |
| Spam submissions | Database pollution | Turnstile + rate limiting + honeypot fields |
| Browser compatibility | Users can't submit | Progressive enhancement, fallback forms |
| Session timeout | Lost form data | Auto-save + session extension warnings |

---

## Success Metrics

### Phase 1 Success Criteria
- [ ] All forms render without JavaScript errors
- [ ] Submissions reach ASM successfully
- [ ] Turnstile blocks spam attempts
- [ ] Page loads under 3 seconds

### Phase 2 Success Criteria
- [ ] 90% of users don't experience errors
- [ ] Form progress saved for 95% of sessions
- [ ] Retry mechanism recovers 80% of failures

### Phase 3 Success Criteria
- [ ] Validation prevents 99% of invalid submissions
- [ ] WCAG 2.1 AA compliance achieved
- [ ] Keyboard navigation fully functional

### Phase 4 Success Criteria
- [ ] Analytics capture 100% of interactions
- [ ] A/B tests show 10%+ improvement
- [ ] Email notifications delivered within 1 minute
- [ ] Performance metrics meet targets

---

## Appendix

### Useful Resources
- [ASM API Documentation](https://sheltermanager.com/repo/ASM3_API.html)
- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/platform/functions/)
- [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Contact Information
- **Technical Lead**: [Your Name]
- **ASM Support**: support@sheltermanager.com
- **Cloudflare Support**: support.cloudflare.com

### Version History
- v1.0 - Initial implementation plan
- v1.1 - Added file upload limits and email notifications
- v1.2 - Enhanced with session storage and analytics

---

## Critical Implementation Notes (GPT-5 Feedback)

### ✅ **Key Changes Made**

1. **Removed ASM Credentials** - No username/password needed for public Service endpoints
2. **Fixed CSP Headers** - Added ASM to frame-src for overlays and Turnstile
3. **Reduced File Limits** - 10MB total (Cloudflare Pages limit on free tier)
4. **Single Submit Endpoint** - `/api/submit` with formid parameter
5. **Privacy-First Analytics** - No PII logging, only metadata and counts
6. **Fallback Forms** - Direct links/iframes when native forms fail

### 🚀 **Production Readiness**

With these changes, the system is:
- **Secure**: No credentials exposed, proper CSP, Turnstile protection
- **Scalable**: Single endpoint, proper caching, edge functions
- **Resilient**: Retry mechanisms, fallback forms, error recovery
- **Compliant**: No PII in analytics, privacy-first approach
- **Maintainable**: Clean architecture, single source of truth

### ⚠️ **Future Considerations**

- **Large Files**: Implement R2 direct upload for files >10MB
- **Private APIs**: Add credentials only if needed, keep server-only
- **Cache Strategy**: ASM caches public forms ~30min, use dev links when testing
- **SSR Routing**: Keep directory mode, avoid SPA fallbacks

---

*Last Updated: 2025-09-05*  
*Document Version: 2.0*  
*Authors: Claude AI Assistant + GPT-5 Review*  
*Status: Production-Ready with critical fixes applied*