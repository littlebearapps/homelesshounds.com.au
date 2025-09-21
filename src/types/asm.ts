// ASM Animal Data Types
export interface ASMAnimal {
  // Basic Information
  ID: number;
  ANIMALNAME: string;
  CODE: string;
  SHELTERCODE: string;
  SHORTCODE: string;
  
  // Species & Breed
  SPECIESID: number;
  SPECIESNAME: string;
  BREEDID: number;
  BREEDNAME: string;
  BREEDNAME1: string;
  BREEDNAME2: string;
  BREED2ID: number;
  CROSSBREED: 0 | 1;
  CROSSBREEDNAME: 'Yes' | 'No';
  
  // Demographics
  SEX: number;
  SEXNAME: 'Male' | 'Female';
  AGEGROUP: 'Young' | 'Adult' | 'Senior';
  DATEOFBIRTH: string;
  SIZE: number;
  SIZENAME: 'Very Large' | 'Large' | 'Medium' | 'Small';
  WEIGHT?: number;
  
  // Status
  DAYSONSHELTER: number;
  TIMEONSHELTER: string;
  TOTALDAYSONSHELTER: number;
  TOTALTIMEONSHELTER: string;
  HASACTIVERESERVE: 0 | 1;
  HASACTIVERESERVENAME: 'Yes' | 'No';
  ARCHIVED: 0 | 1;
  
  // Health & Medical
  NEUTERED: 0 | 1;
  NEUTEREDNAME: 'Yes' | 'No';
  NEUTEREDDATE?: string;
  IDENTICHIPPED: 0 | 1;
  IDENTICHIPPEDNAME: 'Yes' | 'No';
  IDENTICHIPNUMBER?: string;
  IDENTICHIPDATE?: string;
  DECLAWED: 0 | 1;
  DECLAWEDNAME: 'Yes' | 'No';
  HEARTWORMTESTED: 0 | 1;
  HEARTWORMTESTEDNAME: 'Yes' | 'No';
  HEARTWORMTESTRESULT: 0 | 1 | 2;
  HEARTWORMTESTRESULTNAME: 'Negative' | 'Positive' | 'Unknown';
  COMBITESTED: 0 | 1;
  COMBITESTEDNAME: 'Yes' | 'No';
  FLVRESULT: 0 | 1 | 2;
  FLVRESULTNAME: 'Negative' | 'Positive' | 'Unknown';
  
  // Enhanced Medical Fields
  VACCGIVENCOUNT?: number;
  CURRENTVETNAME?: string;
  CURRENTVETPHONE?: string;
  ORIGINALOWNERPHONE?: string;
  MICROCHIPPED: 0 | 1;
  MICROCHIPPEDNAME: 'Yes' | 'No';
  
  // Compatibility
  ISGOODWITHCATS: 0 | 1 | 2;
  ISGOODWITHCATSNAME: 'Yes' | 'No' | 'Unknown';
  ISGOODWITHDOGS: 0 | 1 | 2;
  ISGOODWITHDOGSNAME: 'Yes' | 'No' | 'Unknown';
  ISGOODWITHCHILDREN: 0 | 1 | 2;
  ISGOODWITHCHILDRENNAME: 'Yes' | 'No' | 'Unknown';
  ISHOUSETRAINED: 0 | 1 | 2;
  ISHOUSETRAINEDNAME: 'Yes' | 'No' | 'Unknown';
  ISGOODWITHSMALLANIMALS: 0 | 1 | 2;
  ISGOODWITHSMALLANIMALSSNAME: 'Yes' | 'No' | 'Unknown';
  
  // Special Needs & Flags
  HASSPECIALNEEDS: 0 | 1;
  HASSPECIALNEEDSNAME: 'Yes' | 'No';
  HEALTHPROBLEMS?: string;
  CRUELTYCASE: 0 | 1;
  CRUELTYCASENAME: 'Yes' | 'No';
  ISNOTAVAILABLEFORADOPTION: 0 | 1;
  ISNOTAVAILABLEFORADOPTIONNAME: 'Yes' | 'No';
  
  // Media
  WEBSITEMEDIANAME?: string;
  WEBSITEMEDIADATE?: string;
  WEBSITEMEDIANOTES?: string;
  WEBSITEIMAGECOUNT: number;
  WEBSITEVIDEOURL?: string;
  WEBSITEVIDEONOTES?: string;
  DOCMEDIANAME?: string;
  DOCMEDIADATE?: string;
  
  // Location
  SHELTERLOCATION: number;
  SHELTERLOCATIONNAME: string;
  SHELTERLOCATIONUNIT?: string;
  DISPLAYLOCATION: string;
  DISPLAYLOCATIONNAME: string;
  
  // Enhanced Location Fields
  CURRENTOWNERADDRESS?: string;
  CURRENTOWNERPOSTCODE?: string;
  CURRENTOWNERCOUNTY?: string;
  CURRENTOWNERTOWN?: string;
  CURRENTOWNERCOUNTRY?: string;
  
  // Entry & History
  DATEBROUGHTIN: string;
  ENTRYREASONID: number;
  ENTRYREASONNAME: string;
  REASONFORENTRY?: string;
  MOSTRECENTENTRYDATE: string;
  
  // Additional Information
  ANIMALCOMMENTS?: string;
  HIDDENANIMALDETAILS?: string;
  MARKINGS?: string;
  FEE?: number;
  
  // Enhanced Information Fields
  ADOPTIONDONATION?: number; // Adoption fee
  SOURCENUMBER?: string; // Source number like RE100081
  HIDDENCOMMENTS?: string; // Internal notes
  
  // Adoption Information
  ADOPTIONCOORDINATORID?: number;
  ADOPTIONCOORDINATORNAME?: string;
  
  // Record Metadata
  CREATEDBY: string;
  CREATEDDATE: string;
  LASTCHANGEDBY: string;
  LASTCHANGEDDATE: string;
  RECORDVERSION: number;
}

// API Response Types
export interface AdoptableAnimalsResponse {
  animals: ASMAnimal[];
  total: number;
  hasMore: boolean;
  offset: number;
  limit: number;
}

export interface AnimalDetailResponse {
  animal: ASMAnimal | null;
  images: string[];
  thumbnailUrl?: string;
  error?: string;
}

// Filter Types
export interface AnimalFilters {
  species?: 'all' | 'dog' | 'cat';
  agegroup?: 'Young' | 'Adult' | 'Senior';
  size?: 'Very Large' | 'Large' | 'Medium' | 'Small';
  sex?: 'Male' | 'Female';
  goodWithCats?: boolean;
  goodWithDogs?: boolean;
  goodWithChildren?: boolean;
  goodWithSmallAnimals?: boolean;
  hasSpecialNeeds?: boolean;
  isHouseTrained?: boolean;
  hasActiveReserve?: boolean;
  location?: string;
}

// Compatibility helper types
export type CompatibilityLevel = 0 | 1 | 2;
export type CompatibilityName = 'Yes' | 'No' | 'Unknown';

// Enhanced animal profile sections
export interface AnimalProfile {
  basicInfo: {
    name: string;
    age: string;
    breed: string;
    sex: string;
    size: string;
    species: string;
    weight?: number;
    markings?: string;
  };
  compatibility: {
    cats: CompatibilityLevel;
    dogs: CompatibilityLevel;
    children: CompatibilityLevel;
    smallAnimals: CompatibilityLevel;
    houseTrained: CompatibilityLevel;
  };
  medical: {
    isNeutered: boolean;
    isMicrochipped: boolean;
    vaccinationCount?: number;
    healthNotes?: string;
    hasSpecialNeeds: boolean;
    vetName?: string;
    vetPhone?: string;
  };
  adoption: {
    fee?: number;
    location?: string;
    isReserved: boolean;
    coordinator?: string;
    sourceNumber?: string;
  };
  media: {
    imageCount: number;
    videoUrl?: string;
    mediaName?: string;
    mediaDate?: string;
  };
}

// Helper function to create slug from animal name
export function createAnimalSlug(animal: ASMAnimal): string {
  const parts = [
    animal.ANIMALNAME,
    animal.BREEDNAME,
    animal.SPECIESNAME
  ].filter(Boolean);
  
  return parts
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Helper function to transform ASM data to structured profile
export function createAnimalProfile(animal: ASMAnimal): AnimalProfile {
  return {
    basicInfo: {
      name: animal.ANIMALNAME,
      age: animal.AGEGROUP,
      breed: animal.BREEDNAME,
      sex: animal.SEXNAME,
      size: animal.SIZENAME,
      species: animal.SPECIESNAME,
      weight: animal.WEIGHT,
      markings: animal.MARKINGS
    },
    compatibility: {
      cats: animal.ISGOODWITHCATS,
      dogs: animal.ISGOODWITHDOGS,
      children: animal.ISGOODWITHCHILDREN,
      smallAnimals: animal.ISGOODWITHSMALLANIMALS,
      houseTrained: animal.ISHOUSETRAINED
    },
    medical: {
      isNeutered: animal.NEUTERED === 1,
      isMicrochipped: animal.MICROCHIPPED === 1 || animal.IDENTICHIPPED === 1,
      vaccinationCount: animal.VACCGIVENCOUNT,
      healthNotes: animal.HEALTHPROBLEMS,
      hasSpecialNeeds: animal.HASSPECIALNEEDS === 1,
      vetName: animal.CURRENTVETNAME,
      vetPhone: animal.CURRENTVETPHONE
    },
    adoption: {
      fee: animal.ADOPTIONDONATION || animal.FEE,
      location: (() => {
        // If we have town and county, use those
        if (animal.CURRENTOWNERTOWN && animal.CURRENTOWNERCOUNTY) {
          return `${animal.CURRENTOWNERTOWN}, ${animal.CURRENTOWNERCOUNTY}`;
        }

        // If we have an address, try to extract suburb, state, postcode
        if (animal.CURRENTOWNERADDRESS) {
          // Split address by newlines only (preserve commas in suburb/state)
          const lines = animal.CURRENTOWNERADDRESS.split(/\n/).map(l => l.trim()).filter(l => l);

          // Common patterns for Australian addresses:
          // Line format typically: Street, Suburb State Postcode
          // Or: Street\nSuburb, State\nPostcode
          // Or: Street\nSuburb State Postcode

          // Try to find the line with suburb, state, postcode
          for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i];

            // Check if this line contains a postcode (4 digits)
            if (line.match(/\d{4}/)) {
              // Extract everything after the street address
              // Pattern: "Suburb, STATE POSTCODE" or "Suburb STATE POSTCODE"
              const suburbStatePostcode = line.match(/([A-Za-z\s]+,?\s+[A-Z]{2,3}\s+\d{4})/);
              if (suburbStatePostcode) {
                return suburbStatePostcode[1].trim();
              }

              // If it's just a postcode, combine with previous line
              if (line.match(/^\d{4}$/)) {
                if (i > 0) {
                  const prevLine = lines[i - 1];
                  // Previous line should have suburb and state
                  if (prevLine.match(/[A-Z]{2,3}$/)) {
                    return `${prevLine} ${line}`;
                  }
                  // Or suburb, state
                  if (prevLine.match(/,\s*[A-Z]{2,3}$/)) {
                    return `${prevLine} ${line}`;
                  }
                }
              }
            }

            // Check if line has state abbreviation (might be missing postcode)
            if (line.match(/[A-Z]{2,3}$/) && i < lines.length - 1) {
              const nextLine = lines[i + 1];
              if (nextLine.match(/^\d{4}$/)) {
                return `${line} ${nextLine}`;
              }
            }
          }

          // Last resort: try to find any line with suburb pattern
          const lastLine = lines[lines.length - 1];
          if (lastLine && !lastLine.match(/^\d+\s+/)) {
            // Not a street address (doesn't start with number)
            return lastLine;
          }

          // If no pattern matched, try to get the last non-empty line
          const nonEmptyLines = lines.filter(l => l.trim()).map(l => l.trim());
          if (nonEmptyLines.length >= 2) {
            // Assume second-to-last line is suburb/state/postcode
            const lastLine = nonEmptyLines[nonEmptyLines.length - 1];
            const secondLastLine = nonEmptyLines[nonEmptyLines.length - 2];

            // Check if last line looks like suburb/state/postcode
            if (lastLine.match(/\d{4}/)) {
              return lastLine;
            } else if (secondLastLine.match(/\d{4}/)) {
              return secondLastLine;
            }
          }
        }

        // Fall back to display location or default
        if (animal.DISPLAYLOCATIONNAME && !['Foster', 'Shelter', 'foster', 'shelter'].includes(animal.DISPLAYLOCATIONNAME)) {
          return animal.DISPLAYLOCATIONNAME;
        }

        return 'Contact for details';
      })(),
      isReserved: animal.HASACTIVERESERVE === 1,
      coordinator: animal.ADOPTIONCOORDINATORNAME,
      sourceNumber: animal.SOURCENUMBER
    },
    media: {
      imageCount: animal.WEBSITEIMAGECOUNT,
      videoUrl: animal.WEBSITEVIDEOURL,
      mediaName: animal.WEBSITEMEDIANAME,
      mediaDate: animal.WEBSITEMEDIADATE
    }
  };
}

// Helper function to get compatibility icon
export function getCompatibilityIcon(level: CompatibilityLevel, type: 'cats' | 'dogs' | 'children' | 'small'): string {
  switch (level) {
    case 1: return `✅ Yes`;  // Yes - green check
    case 0: return `❌ No`;   // No - red X
    case 2:
    default: return `❓ Unknown`; // Unknown - question mark
  }
}

// Helper function to format age from date of birth
export function calculateAge(dateOfBirth: string): string {
  const birth = new Date(dateOfBirth);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - birth.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months <= 1 ? 'Young' : `${months} months`;
  }
  
  const years = Math.floor(diffDays / 365);
  return `${years} year${years !== 1 ? 's' : ''}`;
}