import OpenAI from 'openai';
import pdfParse from 'pdf-parse';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Extract text from PDF buffer using pdf-parse
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Extract structured data from electricity bill text using OpenAI
 */
export async function extractElectricityBillData(pdfText: string) {
  const prompt = `
You are an AI that extracts structured information from electricity bills.

Extract the following information from this electricity bill text and return ONLY a valid JSON object:

PDF Text:
${pdfText}

Return JSON with this exact structure:
{
  "vendor": {
    "name": "string (utility company name)",
    "address": "string or null (company address if found)"
  },
  "amounts": {
    "subtotal": number or null,
    "tax": number or null,
    "total": number (REQUIRED - the total amount due),
    "currency": "USD"
  },
  "dates": {
    "issued": "YYYY-MM-DD" (bill date),
    "due": "YYYY-MM-DD or null" (payment due date),
    "servicePeriod": {
      "start": "YYYY-MM-DD or null",
      "end": "YYYY-MM-DD or null"
    }
  },
  "category": "Utilities",
  "documentType": "bill",
  "metadata": {
    "accountNumber": "string or null",
    "meterNumber": "string or null",
    "kwh_used": number or null
  },
  "confidenceScores": {
    "overall": number (0-100, how confident you are in the extraction),
    "perField": {
      "vendor": number (0-100),
      "total": number (0-100),
      "date": number (0-100)
    }
  }
}

Important rules:
- Extract actual values from the text
- Use null if a field is not found or unclear
- Be precise with numbers (no currency symbols in numbers)
- Dates must be in YYYY-MM-DD format
- If the total amount is unclear or you find multiple amounts, use the largest one
- Assign high confidence (>90) only if you're very certain
- Assign medium confidence (70-89) if somewhat certain
- Assign low confidence (<70) if uncertain or data is missing
- The "total" field is REQUIRED and should never be null
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Fast and cost-effective
      messages: [
        {
          role: 'system',
          content:
            'You are a precise data extraction assistant. Always return valid JSON. Never include explanations outside the JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1, // Low temperature for consistency
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const extracted = JSON.parse(content);

    // Validate that we have at least the required fields
    if (!extracted.amounts?.total) {
      throw new Error('Failed to extract total amount from document');
    }

    return extracted;
  } catch (error) {
    console.error('OpenAI extraction error:', error);
    throw new Error(
      `Failed to extract data with AI: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Complete processing pipeline for electricity bill
 */
export async function processElectricityBill(pdfBuffer: Buffer) {
  // Step 1: Extract text from PDF
  const text = await extractTextFromPDF(pdfBuffer);

  if (!text || text.trim().length === 0) {
    throw new Error('PDF appears to be empty or contains no extractable text');
  }

  // Step 2: Extract structured data using AI
  const extractedData = await extractElectricityBillData(text);

  return extractedData;
}
