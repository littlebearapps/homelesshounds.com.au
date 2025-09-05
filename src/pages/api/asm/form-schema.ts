import type { APIRoute } from 'astro';
import { parseHTML } from 'linkedom';

// GET /api/asm/form-schema?formid={id} - Proxy ASM form JSON with HTML fallback
export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const formid = url.searchParams.get("formid");
  
  // Get environment variables
  const account = (locals as any)?.runtime?.env?.ASM_ACCOUNT || import.meta.env.PUBLIC_ASM_ACCOUNT || 'st3418';
  const baseUrl = (locals as any)?.runtime?.env?.ASM_BASE_URL || import.meta.env.PUBLIC_ASM_BASE || 'https://service.sheltermanager.com/asmservice';
  
  if (!account || !formid) {
    return jsonResponse({ error: "Missing ASM account or form id" }, 400);
  }
  
  // 1) Try documented JSON endpoint with formid=
  const jsonUrl = `${baseUrl}?account=${encodeURIComponent(account)}&method=online_form_json&formid=${encodeURIComponent(formid)}`;
  
  try {
    const jsonRes = await fetch(jsonUrl, { 
      headers: { 'Accept': 'application/json' }
    });

    if (jsonRes.ok) {
      const text = await jsonRes.text();
      // ASM returns JSON when available; guard against empty responses
      if (text && text.trim().length > 2) {
        return new Response(text, {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'public, s-maxage=600'
          }
        });
      }
    }

    // 2) Fallback: fetch HTML, extract fields, normalize to a JSON shape we control
    const htmlUrl = `${baseUrl}?account=${encodeURIComponent(account)}&method=online_form_html&formid=${encodeURIComponent(formid)}`;
    const htmlRes = await fetch(htmlUrl);
    
    if (!htmlRes.ok) {
      return jsonResponse({ error: 'ASM HTML form fetch failed' }, 502);
    }

    const html = await htmlRes.text();
    const { document } = parseHTML(html);

    // Extract the first <form> and derive a simple schema
    const form = document.querySelector('form');
    if (!form) {
      return jsonResponse({ error: 'No <form> found in ASM HTML' }, 502);
    }

    const fields: any[] = [];
    const pushField = (def: any) => fields.push(def);

    // Inputs
    form.querySelectorAll('input').forEach((el: any) => {
      const name = el.getAttribute('name');
      if (!name) return;
      const type = (el.getAttribute('type') || 'text').toLowerCase();
      const required = el.hasAttribute('required');
      const label = labelFor(el) || name;
      const def: any = { name, label, type, required };
      if (type === 'radio' || type === 'checkbox') {
        def.type = type;
      }
      if (type === 'file') def.accept = el.getAttribute('accept') || '';
      pushField(def);
    });

    // Textareas
    form.querySelectorAll('textarea').forEach((el: any) => {
      const name = el.getAttribute('name'); 
      if (!name) return;
      const required = el.hasAttribute('required');
      const label = labelFor(el) || name;
      pushField({ name, label, type: 'textarea', required });
    });

    // Selects with options
    form.querySelectorAll('select').forEach((el: any) => {
      const name = el.getAttribute('name'); 
      if (!name) return;
      const required = el.hasAttribute('required');
      const label = labelFor(el) || name;
      const options = Array.from(el.querySelectorAll('option')).map((o: any) => ({
        value: o.getAttribute('value') ?? o.textContent,
        label: o.textContent?.trim() ?? ''
      }));
      pushField({ name, label, type: 'select', required, options });
    });

    const schema = {
      name: form.getAttribute('name') || `asm-form-${formid}`,
      action: '/api/submit',
      method: 'POST',
      fields
    };

    return new Response(JSON.stringify(schema), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, s-maxage=600'
      }
    });
    
  } catch (error) {
    console.error('Error fetching form schema:', error);
    return jsonResponse({ error: "Failed to fetch form schema" }, 502);
  }
};

function labelFor(el: Element): string | null {
  // <label for="id"> or parent label
  const id = el.getAttribute('id');
  if (id) {
    const byFor = el.ownerDocument?.querySelector(`label[for="${CSS.escape(id)}"]`);
    if (byFor?.textContent) return byFor.textContent.trim();
  }
  const parent = el.closest('label');
  if (parent?.textContent) return parent.textContent.trim();
  return null;
}

function jsonResponse(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

export const prerender = false;

// Also export as default for compatibility
export default {
  GET
};