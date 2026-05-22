// Patient vignette — radiation oncology consult prep.
// Both directions read this so changes happen in one place.
// The vignette is structured as a stack of source-document blocks
// (ENT note, imaging, med-onc note, chart, encounter) so the
// physician sees it as a real pre-consult packet rather than a
// data grid or a single flowing paragraph.

const VIGNETTE = {
  patient: "58 y.o. male \u00b7 radiation oncology consult",
  chief:   "Definitive treatment discussion \u2014 left tonsillar SCC.",
  caseId:  "Case \u00b7 CVI-014-A",
  stampTop:    "Consultation",
  stampBottom: "New patient",

  sources: [
    {
      label: "ENT Referral Note",
      body:  "Biopsy-confirmed p16-positive squamous cell carcinoma, left tonsil. Clinical stage T2 N2a M0 (AJCC 8th edition). Requesting radiation oncology consultation for definitive treatment. Dental clearance completed.",
    },
    {
      label: "PET/CT Report",
      body:  "3.1 cm left tonsillar mass, SUVmax 14.2. Single 2.8 cm left level II lymph node, SUVmax 11.8. No distant metastatic disease.",
    },
    {
      label: "MRI Neck Report",
      body:  "Confirms tonsillar and nodal disease. No skull base involvement. No retropharyngeal adenopathy.",
    },
    {
      label: "Medical Oncology Note",
      body:  "Patient seen. Recommending concurrent cisplatin if proceeding with definitive radiation.",
    },
    {
      label: "Patient Chart",
      body:  "58-year-old male. High school teacher. Former smoker (15 pack-year, quit 12 years ago). PMH: type 2 diabetes (A1c 7.2, on metformin), mild GERD. ECOG 0.",
    },
    {
      label: "Your Encounter",
      body:  "Patient is anxious and well-informed. Asking detailed questions about long-term swallowing outcomes.",
      highlight: true,
    },
  ],
};

window.VIGNETTE = VIGNETTE;
