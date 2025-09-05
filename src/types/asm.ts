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
  
  // Compatibility
  ISGOODWITHCATS: 0 | 1 | 2;
  ISGOODWITHCATSNAME: 'Yes' | 'No' | 'Unknown';
  ISGOODWITHDOGS: 0 | 1 | 2;
  ISGOODWITHDOGSNAME: 'Yes' | 'No' | 'Unknown';
  ISGOODWITHCHILDREN: 0 | 1 | 2;
  ISGOODWITHCHILDRENNAME: 'Yes' | 'No' | 'Unknown';
  ISHOUSETRAINED: 0 | 1 | 2;
  ISHOUSETRAINEDNAME: 'Yes' | 'No' | 'Unknown';
  
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
  hasSpecialNeeds?: boolean;
  location?: string;
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