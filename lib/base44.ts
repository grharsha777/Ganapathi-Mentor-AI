/**
 * Base44 API Integration
 * Handles CRUD operations for Patient Entities
 */

const BASE44_API_KEY = process.env.BASE44_API_KEY;
const BASE44_APP_ID = process.env.BASE44_APP_ID;

export interface PatientEntity {
    _id?: string;
    patient_id?: string;
    name?: string;
    age?: number;
    sex?: string;
    phone?: string;
    email?: string;
    address?: string;
    medical_history?: string;
    current_risk_score?: number;
    current_risk_level?: string;
    risk_conditions?: string[];
    doctor_id?: string;
    [key: string]: any;
}

/**
 * Fetch all Patient entities from Base44
 */
export async function fetchPatientEntities(): Promise<PatientEntity[]> {
    if (!BASE44_API_KEY || !BASE44_APP_ID) {
        throw new Error('Base44 API Configuration is missing');
    }

    const response = await fetch(`https://app.base44.com/api/apps/${BASE44_APP_ID}/entities/Patient`, {
        method: 'GET',
        headers: {
            'api_key': BASE44_API_KEY,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Base44 Fetch Error: ${data.message || response.statusText}`);
    }

    // Base44 usually wraps data in a 'data' array or similar, we'll try to extract it
    return Array.isArray(data) ? data : data.data || [data];
}

/**
 * Update a specific Patient entity in Base44
 */
export async function updatePatientEntity(entityId: string, updateData: Partial<PatientEntity>) {
    if (!BASE44_API_KEY || !BASE44_APP_ID) {
        throw new Error('Base44 API Configuration is missing');
    }

    const response = await fetch(`https://app.base44.com/api/apps/${BASE44_APP_ID}/entities/Patient/${entityId}`, {
        method: 'PUT',
        headers: {
            'api_key': BASE44_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Base44 Update Error: ${data.message || response.statusText}`);
    }

    return data;
}

/**
 * Create a new Patient entity in Base44
 */
export async function createPatientEntity(patientData: PatientEntity) {
    if (!BASE44_API_KEY || !BASE44_APP_ID) {
        throw new Error('Base44 API Configuration is missing');
    }

    const response = await fetch(`https://app.base44.com/api/apps/${BASE44_APP_ID}/entities/Patient`, {
        method: 'POST',
        headers: {
            'api_key': BASE44_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(patientData)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Base44 Create Error: ${data.message || response.statusText}`);
    }

    return data;
}
