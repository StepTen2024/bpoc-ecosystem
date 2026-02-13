/**
 * Staff Onboarding Document Types
 * 29 document types with AI extraction configs and points
 * 
 * Minimum 155 points to complete onboarding:
 * - Identity: 50 points
 * - TIN: 25 points
 * - SSS: 25 points
 * - PhilHealth: 25 points
 * - Pag-IBIG: 25 points
 * - Photo: 5 points
 */

export interface DocumentTypeConfig {
  id: string;
  name: string;
  category: 'identity' | 'tax' | 'sss' | 'philhealth' | 'pagibig' | 'personal' | 'employment' | 'medical' | 'photos';
  points: number;
  isPrimary: boolean; // Primary IDs worth more
  extractableFields: string[];
  aiPrompt: string;
  validationRules?: string[];
}

export const DOCUMENT_TYPES: Record<string, DocumentTypeConfig> = {
  // ============ IDENTITY (Primary IDs) ============
  philid: {
    id: 'philid',
    name: 'Philippine National ID (PhilID)',
    category: 'identity',
    points: 50,
    isPrimary: true,
    extractableFields: ['full_name', 'date_of_birth', 'sex', 'place_of_birth', 'blood_type', 'address', 'philsys_number', 'photo'],
    aiPrompt: `Extract from Philippine National ID (PhilID):
Return JSON: {"full_name": "...", "date_of_birth": "YYYY-MM-DD", "sex": "M/F", "place_of_birth": "...", "blood_type": "...", "address": "...", "philsys_number": "...", "has_photo": true/false}`,
  },

  sss_umid: {
    id: 'sss_umid',
    name: 'SSS UMID Card',
    category: 'identity',
    points: 40,
    isPrimary: true,
    extractableFields: ['full_name', 'date_of_birth', 'sss_number', 'crn', 'photo'],
    aiPrompt: `Extract from SSS UMID Card:
Return JSON: {"full_name": "...", "date_of_birth": "YYYY-MM-DD", "sss_number": "XX-XXXXXXX-X", "crn": "...", "has_photo": true/false}`,
  },

  drivers_license: {
    id: 'drivers_license',
    name: "Driver's License (LTO)",
    category: 'identity',
    points: 40,
    isPrimary: true,
    extractableFields: ['full_name', 'date_of_birth', 'address', 'license_number', 'expiry_date', 'restrictions'],
    aiPrompt: `Extract from Philippine Driver's License:
Return JSON: {"full_name": "...", "date_of_birth": "YYYY-MM-DD", "address": "...", "license_number": "...", "expiry_date": "YYYY-MM-DD", "restrictions": "...", "has_photo": true/false}`,
  },

  passport: {
    id: 'passport',
    name: 'Passport (DFA)',
    category: 'identity',
    points: 50,
    isPrimary: true,
    extractableFields: ['full_name', 'date_of_birth', 'place_of_birth', 'sex', 'passport_number', 'issue_date', 'expiry_date'],
    aiPrompt: `Extract from Philippine Passport:
Return JSON: {"full_name": "...", "date_of_birth": "YYYY-MM-DD", "place_of_birth": "...", "sex": "M/F", "passport_number": "...", "issue_date": "YYYY-MM-DD", "expiry_date": "YYYY-MM-DD", "has_photo": true/false}`,
  },

  voters_id: {
    id: 'voters_id',
    name: "Voter's ID (COMELEC)",
    category: 'identity',
    points: 30,
    isPrimary: true,
    extractableFields: ['full_name', 'date_of_birth', 'address', 'precinct_number'],
    aiPrompt: `Extract from COMELEC Voter's ID:
Return JSON: {"full_name": "...", "date_of_birth": "YYYY-MM-DD", "address": "...", "precinct_number": "...", "has_photo": true/false}`,
  },

  prc_id: {
    id: 'prc_id',
    name: 'PRC ID (Professional)',
    category: 'identity',
    points: 35,
    isPrimary: true,
    extractableFields: ['full_name', 'profession', 'prc_id_number', 'registration_date', 'expiry_date'],
    aiPrompt: `Extract from PRC Professional ID:
Return JSON: {"full_name": "...", "profession": "...", "prc_id_number": "...", "registration_date": "YYYY-MM-DD", "expiry_date": "YYYY-MM-DD", "has_photo": true/false}`,
  },

  postal_id: {
    id: 'postal_id',
    name: 'Postal ID',
    category: 'identity',
    points: 25,
    isPrimary: false,
    extractableFields: ['full_name', 'date_of_birth', 'address', 'postal_id_number'],
    aiPrompt: `Extract from Philippine Postal ID:
Return JSON: {"full_name": "...", "date_of_birth": "YYYY-MM-DD", "address": "...", "postal_id_number": "...", "has_photo": true/false}`,
  },

  nbi_clearance: {
    id: 'nbi_clearance',
    name: 'NBI Clearance',
    category: 'identity',
    points: 25,
    isPrimary: false,
    extractableFields: ['full_name', 'date_of_birth', 'address', 'nbi_status', 'issue_date', 'valid_until', 'nbi_number'],
    aiPrompt: `Extract from NBI Clearance:
Return JSON: {"full_name": "...", "date_of_birth": "YYYY-MM-DD", "address": "...", "nbi_status": "HIT/NO HIT", "issue_date": "YYYY-MM-DD", "valid_until": "YYYY-MM-DD", "nbi_number": "..."}`,
  },

  police_clearance: {
    id: 'police_clearance',
    name: 'Police Clearance',
    category: 'identity',
    points: 20,
    isPrimary: false,
    extractableFields: ['full_name', 'address', 'purpose', 'issue_date', 'validity'],
    aiPrompt: `Extract from Police Clearance:
Return JSON: {"full_name": "...", "address": "...", "purpose": "...", "issue_date": "YYYY-MM-DD", "validity": "..."}`,
  },

  // ============ TAX ============
  tin_id: {
    id: 'tin_id',
    name: 'TIN ID / TIN Card',
    category: 'tax',
    points: 30,
    isPrimary: false,
    extractableFields: ['full_name', 'tin_number', 'date_of_birth', 'address'],
    aiPrompt: `Extract from TIN ID or TIN Card:
Return JSON: {"full_name": "...", "tin_number": "XXX-XXX-XXX or XXX-XXX-XXX-XXX", "date_of_birth": "YYYY-MM-DD", "address": "..."}`,
  },

  bir_2316: {
    id: 'bir_2316',
    name: 'BIR Form 2316 (Previous Employer)',
    category: 'tax',
    points: 35,
    isPrimary: false,
    extractableFields: ['full_name', 'tin_number', 'previous_employer', 'employer_tin', 'total_compensation', 'tax_withheld', 'sss_contribution', 'philhealth_contribution', 'pagibig_contribution'],
    aiPrompt: `Extract from BIR Form 2316:
Return JSON: {"full_name": "...", "tin_number": "...", "previous_employer": "...", "employer_tin": "...", "total_compensation": 0, "tax_withheld": 0, "sss_contribution": 0, "philhealth_contribution": 0, "pagibig_contribution": 0}`,
  },

  bir_1902: {
    id: 'bir_1902',
    name: 'BIR Form 1902 (TIN Application)',
    category: 'tax',
    points: 25,
    isPrimary: false,
    extractableFields: ['full_name', 'date_of_birth', 'address', 'tin_number', 'civil_status'],
    aiPrompt: `Extract from BIR Form 1902:
Return JSON: {"full_name": "...", "date_of_birth": "YYYY-MM-DD", "address": "...", "tin_number": "...", "civil_status": "..."}`,
  },

  // ============ SSS ============
  sss_id_old: {
    id: 'sss_id_old',
    name: 'SSS ID (Old Style)',
    category: 'sss',
    points: 30,
    isPrimary: false,
    extractableFields: ['full_name', 'sss_number'],
    aiPrompt: `Extract from old-style SSS ID:
Return JSON: {"full_name": "...", "sss_number": "XX-XXXXXXX-X", "has_photo": true/false}`,
  },

  sss_e1: {
    id: 'sss_e1',
    name: 'SSS E-1 Form / Member Data',
    category: 'sss',
    points: 25,
    isPrimary: false,
    extractableFields: ['full_name', 'date_of_birth', 'sss_number', 'address', 'civil_status', 'beneficiaries'],
    aiPrompt: `Extract from SSS E-1 Form:
Return JSON: {"full_name": "...", "date_of_birth": "YYYY-MM-DD", "sss_number": "XX-XXXXXXX-X", "address": "...", "civil_status": "..."}`,
  },

  // ============ PHILHEALTH ============
  philhealth_id: {
    id: 'philhealth_id',
    name: 'PhilHealth ID',
    category: 'philhealth',
    points: 30,
    isPrimary: false,
    extractableFields: ['full_name', 'date_of_birth', 'philhealth_number', 'member_type'],
    aiPrompt: `Extract from PhilHealth ID:
Return JSON: {"full_name": "...", "date_of_birth": "YYYY-MM-DD", "philhealth_number": "XX-XXXXXXXXX-X", "member_type": "...", "has_photo": true/false}`,
  },

  philhealth_mdr: {
    id: 'philhealth_mdr',
    name: 'PhilHealth MDR (Member Data Record)',
    category: 'philhealth',
    points: 25,
    isPrimary: false,
    extractableFields: ['full_name', 'date_of_birth', 'philhealth_number', 'address', 'dependents'],
    aiPrompt: `Extract from PhilHealth MDR:
Return JSON: {"full_name": "...", "date_of_birth": "YYYY-MM-DD", "philhealth_number": "XX-XXXXXXXXX-X", "address": "...", "dependents": []}`,
  },

  // ============ PAG-IBIG ============
  pagibig_id: {
    id: 'pagibig_id',
    name: 'Pag-IBIG ID / MID Card',
    category: 'pagibig',
    points: 30,
    isPrimary: false,
    extractableFields: ['full_name', 'pagibig_number'],
    aiPrompt: `Extract from Pag-IBIG ID or MID Card:
Return JSON: {"full_name": "...", "pagibig_number": "XXXX-XXXX-XXXX", "has_photo": true/false}`,
  },

  pagibig_mdf: {
    id: 'pagibig_mdf',
    name: "Pag-IBIG Member's Data Form",
    category: 'pagibig',
    points: 25,
    isPrimary: false,
    extractableFields: ['full_name', 'date_of_birth', 'pagibig_number', 'address', 'contact_info', 'beneficiaries'],
    aiPrompt: `Extract from Pag-IBIG Member Data Form:
Return JSON: {"full_name": "...", "date_of_birth": "YYYY-MM-DD", "pagibig_number": "XXXX-XXXX-XXXX", "address": "...", "contact_info": "..."}`,
  },

  // ============ PERSONAL ============
  birth_certificate: {
    id: 'birth_certificate',
    name: 'PSA Birth Certificate',
    category: 'personal',
    points: 40,
    isPrimary: false,
    extractableFields: ['full_name', 'date_of_birth', 'place_of_birth', 'sex', 'father_name', 'mother_maiden_name', 'registry_number'],
    aiPrompt: `Extract from PSA Birth Certificate:
Return JSON: {"full_name": "...", "date_of_birth": "YYYY-MM-DD", "place_of_birth": "...", "sex": "M/F", "father_name": "...", "mother_maiden_name": "...", "registry_number": "..."}`,
  },

  marriage_certificate: {
    id: 'marriage_certificate',
    name: 'PSA Marriage Certificate',
    category: 'personal',
    points: 20,
    isPrimary: false,
    extractableFields: ['husband_name', 'wife_name', 'date_of_marriage', 'place_of_marriage'],
    aiPrompt: `Extract from PSA Marriage Certificate:
Return JSON: {"husband_name": "...", "wife_name": "...", "date_of_marriage": "YYYY-MM-DD", "place_of_marriage": "..."}`,
  },

  barangay_clearance: {
    id: 'barangay_clearance',
    name: 'Barangay Clearance / Certificate',
    category: 'personal',
    points: 15,
    isPrimary: false,
    extractableFields: ['full_name', 'address', 'purpose', 'issue_date'],
    aiPrompt: `Extract from Barangay Clearance:
Return JSON: {"full_name": "...", "address": "...", "purpose": "...", "issue_date": "YYYY-MM-DD"}`,
  },

  // ============ EMPLOYMENT ============
  resume: {
    id: 'resume',
    name: 'Resume / CV',
    category: 'employment',
    points: 10,
    isPrimary: false,
    extractableFields: ['full_name', 'contact_phone', 'contact_email', 'address', 'work_history', 'education', 'skills'],
    aiPrompt: `Extract from Resume/CV:
Return JSON: {"full_name": "...", "contact_phone": "...", "contact_email": "...", "address": "...", "years_experience": 0}`,
  },

  diploma: {
    id: 'diploma',
    name: 'Diploma / Transcript of Records',
    category: 'employment',
    points: 20,
    isPrimary: false,
    extractableFields: ['full_name', 'school_name', 'degree', 'date_graduated', 'honors'],
    aiPrompt: `Extract from Diploma or Transcript:
Return JSON: {"full_name": "...", "school_name": "...", "degree": "...", "field_of_study": "...", "date_graduated": "YYYY-MM-DD", "honors": "..."}`,
  },

  certificate_of_employment: {
    id: 'certificate_of_employment',
    name: 'Certificate of Employment (COE)',
    category: 'employment',
    points: 25,
    isPrimary: false,
    extractableFields: ['full_name', 'previous_employer', 'position', 'employment_start', 'employment_end', 'salary'],
    aiPrompt: `Extract from Certificate of Employment:
Return JSON: {"full_name": "...", "previous_employer": "...", "position": "...", "employment_start": "YYYY-MM-DD", "employment_end": "YYYY-MM-DD", "salary": 0}`,
  },

  // ============ MEDICAL ============
  medical_certificate: {
    id: 'medical_certificate',
    name: 'Pre-Employment Medical Certificate',
    category: 'medical',
    points: 15,
    isPrimary: false,
    extractableFields: ['full_name', 'exam_date', 'fit_status', 'doctor_name', 'clinic_hospital'],
    aiPrompt: `Extract from Medical Certificate:
Return JSON: {"full_name": "...", "exam_date": "YYYY-MM-DD", "fit_status": "Fit/Unfit/Conditional", "doctor_name": "...", "clinic_hospital": "..."}`,
  },

  drug_test: {
    id: 'drug_test',
    name: 'Drug Test Result',
    category: 'medical',
    points: 15,
    isPrimary: false,
    extractableFields: ['full_name', 'test_date', 'result', 'lab_name'],
    aiPrompt: `Extract from Drug Test Result:
Return JSON: {"full_name": "...", "test_date": "YYYY-MM-DD", "result": "Negative/Positive", "lab_name": "..."}`,
  },

  // ============ PHOTOS ============
  id_photo: {
    id: 'id_photo',
    name: '2x2 / ID Photo',
    category: 'photos',
    points: 5,
    isPrimary: false,
    extractableFields: ['face_detected'],
    aiPrompt: `Verify this is a valid ID photo (2x2, passport size):
Return JSON: {"face_detected": true/false, "is_valid_id_photo": true/false, "background": "white/blue/other"}`,
  },

  signature: {
    id: 'signature',
    name: 'Signature Specimen',
    category: 'photos',
    points: 5,
    isPrimary: false,
    extractableFields: ['signature_detected'],
    aiPrompt: `Verify this contains a signature:
Return JSON: {"signature_detected": true/false}`,
  },
};

// Category requirements for minimum 155 points
export const CATEGORY_REQUIREMENTS = {
  identity: { minPoints: 50, description: '1 Primary ID (PhilID, Passport, UMID) OR 2 Secondary IDs' },
  tax: { minPoints: 25, description: 'TIN ID, BIR 2316, or TIN visible on any document' },
  sss: { minPoints: 25, description: 'SSS UMID, SSS ID, SSS E-1, or SSS# on 2316' },
  philhealth: { minPoints: 25, description: 'PhilHealth ID, MDR, or PhilHealth# on 2316' },
  pagibig: { minPoints: 25, description: 'Pag-IBIG ID, MDF, or MID# on any document' },
  photos: { minPoints: 5, description: 'ID photo or 2x2' },
};

export const MINIMUM_POINTS = 155;

// Get all document types for a category
export function getDocTypesForCategory(category: string): DocumentTypeConfig[] {
  return Object.values(DOCUMENT_TYPES).filter(d => d.category === category);
}

// Classification prompt for auto-detecting document type
export const DOCUMENT_CLASSIFICATION_PROMPT = `You are a Philippine government document classifier. Analyze this document image and identify what type of document it is.

Possible document types:
- philid: Philippine National ID (PhilSys)
- sss_umid: SSS UMID Card (blue card with photo)
- drivers_license: LTO Driver's License
- passport: Philippine Passport
- voters_id: COMELEC Voter's ID
- prc_id: PRC Professional ID
- postal_id: Philippine Postal ID
- nbi_clearance: NBI Clearance certificate
- police_clearance: Police Clearance certificate
- tin_id: TIN ID or TIN Card
- bir_2316: BIR Form 2316 (tax form from employer)
- bir_1902: BIR Form 1902 (TIN application)
- sss_id_old: Old-style SSS ID
- sss_e1: SSS E-1 Form
- philhealth_id: PhilHealth ID card
- philhealth_mdr: PhilHealth Member Data Record
- pagibig_id: Pag-IBIG ID or MID Card
- pagibig_mdf: Pag-IBIG Member Data Form
- birth_certificate: PSA Birth Certificate
- marriage_certificate: PSA Marriage Certificate
- barangay_clearance: Barangay Clearance
- resume: Resume or CV
- diploma: Diploma or Transcript of Records
- certificate_of_employment: Certificate of Employment (COE)
- medical_certificate: Medical Certificate
- drug_test: Drug Test Result
- id_photo: 2x2 or passport photo
- signature: Signature specimen
- unknown: Cannot identify

Return ONLY a JSON object:
{"document_type": "...", "confidence": 0.0-1.0, "detected_text": "brief relevant text seen"}`;
