import type { APIRoute } from 'astro';
import { surrenderConfirmationEmail } from '../../lib/email/templates/surrender-confirmation';
import { adoptionConfirmationEmail } from '../../lib/email/templates/adoption-confirmation';
import { fosterConfirmationEmail } from '../../lib/email/templates/foster-confirmation';
import { petCourierConfirmationEmail } from '../../lib/email/templates/pet-courier-confirmation';
import { adoptionOutcomeCongratsEmail } from '../../lib/email/templates/adoption-outcome-congrats';
import { adoptionOutcomeSorryEmail } from '../../lib/email/templates/adoption-outcome-sorry';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  // Only allow in development
  if (import.meta.env.MODE !== 'development') {
    return new Response('Not available in production', { status: 403 });
  }

  const formId = url.searchParams.get('formId');
  const testData = {
    firstname: 'John',
    lastname: 'Smith',
    email: 'john.smith@example.com',
    animalname: 'Max',
    pet_name: 'Buddy',
    animal_name: 'Buddy',
    animal_photo: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=200&h=200&fit=crop&crop=face',
    species: 'Dog',
    breed: 'Golden Retriever',
    pet_breed: 'Labrador',
    pet_species: 'Dog',
    adoption_date: new Date().toISOString(),
    similar_animals_url: '/adopt/dogs'
  };

  let template;
  switch (formId) {
    case '66': // Surrender
      template = surrenderConfirmationEmail(testData);
      break;
    case '70': // Dog Adoption
    case '65': // Cat Adoption
      template = adoptionConfirmationEmail(testData);
      break;
    case '68': // Dog Foster
    case '69': // Cat Foster
      template = fosterConfirmationEmail(testData);
      break;
    case '67': // Pet Courier
      template = petCourierConfirmationEmail(testData);
      break;
    case 'adoption-congrats': // Adoption Success
      template = adoptionOutcomeCongratsEmail(testData);
      break;
    case 'adoption-sorry': // Adoption Update
      template = adoptionOutcomeSorryEmail(testData);
      break;
    default:
      return new Response('Invalid form ID', { status: 400 });
  }

  // Return the HTML content for inspection
  return new Response(template.html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
    },
  });
};