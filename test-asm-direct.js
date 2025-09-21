// Direct test of ASM API with local credentials
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const ASM_ACCOUNT = process.env.ASM_ACCOUNT;
const ASM_BASE_URL = process.env.ASM_BASE_URL;
const ASM_USERNAME = process.env.ASM_USERNAME;
const ASM_PASSWORD = process.env.ASM_PASSWORD;

console.log('Testing ASM API with credentials:');
console.log('Account:', ASM_ACCOUNT);
console.log('Base URL:', ASM_BASE_URL);
console.log('Username:', ASM_USERNAME);
console.log('Password:', ASM_PASSWORD ? '***hidden***' : 'NOT SET');

if (!ASM_ACCOUNT || !ASM_BASE_URL || !ASM_USERNAME || !ASM_PASSWORD) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Build URL
const url = new URL(ASM_BASE_URL);
url.searchParams.set('method', 'json_adoptable_animals');
url.searchParams.set('account', ASM_ACCOUNT);
url.searchParams.set('username', ASM_USERNAME);
url.searchParams.set('password', ASM_PASSWORD);
url.searchParams.set('speciesid', '1');

console.log('\nFetching from ASM API...');
console.log('URL (password hidden):', url.toString().replace(ASM_PASSWORD, '***'));

try {
  const response = await fetch(url.toString());
  const text = await response.text();

  console.log('\nResponse status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));

  if (text.startsWith('ERROR')) {
    console.error('\nASM API Error:', text);
  } else {
    try {
      const data = JSON.parse(text);
      console.log('\nSuccess! Found', Array.isArray(data) ? data.length : 0, 'animals');
      if (Array.isArray(data) && data[0]) {
        console.log('First animal:', data[0].ANIMALNAME);
      }
    } catch (e) {
      console.log('\nResponse text (first 200 chars):', text.substring(0, 200));
    }
  }
} catch (error) {
  console.error('\nFetch error:', error.message);
}