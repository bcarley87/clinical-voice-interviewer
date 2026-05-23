export type VignetteSource = {
  label: string;
  body: string;
  highlight: boolean;
};

export const VIGNETTE = {
  patient: "58 y.o. male · radiation oncology consult",
  chief: "Definitive treatment discussion — left tonsillar SCC.",
  caseId: "Case · CVI-014-A",
  stampTop: "Consultation",
  stampBottom: "New patient",
  sources: [
    {
      label: "ENT Referral Note",
      body: "Biopsy-confirmed p16-positive squamous cell carcinoma, left tonsil. Clinical stage T2 N2a M0 (AJCC 8th edition). Requesting radiation oncology consultation for definitive treatment. Dental clearance completed.",
      highlight: false,
    },
    {
      label: "PET/CT Report",
      body: "3.1 cm left tonsillar mass, SUVmax 14.2. Single 2.8 cm left level II lymph node, SUVmax 11.8. No distant metastatic disease.",
      highlight: false,
    },
    {
      label: "MRI Neck Report",
      body: "Confirms tonsillar and nodal disease. No skull base involvement. No retropharyngeal adenopathy.",
      highlight: false,
    },
    {
      label: "Medical Oncology Note",
      body: "Patient seen. Recommending concurrent cisplatin if proceeding with definitive radiation.",
      highlight: false,
    },
    {
      label: "Patient Chart",
      body: "58-year-old male. High school teacher. Former smoker (15 pack-year, quit 12 years ago). PMH: type 2 diabetes (A1c 7.2, on metformin), mild GERD. ECOG 0.",
      highlight: false,
    },
    {
      label: "Your Encounter",
      body: "Patient is anxious and well-informed. Asking detailed questions about long-term swallowing outcomes.",
      highlight: true,
    },
  ] satisfies VignetteSource[],
} as const;
