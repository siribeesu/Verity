export const SAMPLE_DOCUMENTS = [
  {
    id: 'lease',
    title: 'Residential Apartment Lease',
    category: 'lease',
    description: 'Standard 12-month residential apartment lease with clauses on automatic renewal, security deposit, and landlord access.',
    docType: 'lease',
    jurisdiction: 'California',
    text: `RESIDENTIAL LEASE AGREEMENT

1. PARTIES & PREMISES. This Agreement is entered into between Oakridge Properties LLC ("Landlord") and Tenant for the residential property located at 742 Evergreen Terrace, Apt 3B ("Premises").

2. TERM & AUTOMATIC RENEWAL. The lease term begins on October 1, 2024 and expires on September 30, 2025. Unless Tenant provides written notice of non-renewal at least sixty (60) days prior to the expiration date, this Agreement shall automatically renew for consecutive twelve (12) month terms with an automatic 7% rent escalation.

3. RENT & LATE FEES. Monthly rent is $2,400.00, payable on the first day of each month. If rent is not received by 11:59 PM on the 2nd day of the month, a late fee of $150.00 plus $25.00 for each additional day shall apply.

4. SECURITY DEPOSIT. Tenant shall deposit $4,800.00 (two months' rent) as security. Landlord may deduct amounts for repair of damages, routine painting, deep cleaning fees, and administrative charges at Landlord's sole discretion upon move-out. Refund shall be remitted within forty-five (45) days of surrender.

5. LANDLORD ENTRY & ACCESS. Landlord and Landlord's agents reserve the right to enter the Premises at any time without prior notice for routine inspection, maintenance, or showing to prospective buyers or tenants.

6. MAINTENANCE & REPAIRS. Tenant is solely responsible for all maintenance, plumbing clogs, appliance repairs, and HVAC servicing under $500.00 per occurrence. Any repair request requiring Landlord dispatch shall incur a $75.00 service assessment charge.

7. PETS & GUESTS. No overnight guests may stay longer than three (3) consecutive days without written Landlord authorization. Violation results in a $100.00 per day penalty.

8. INDEMNIFICATION & LIABILITY WAIVER. Tenant agrees to indemnify, defend, and hold harmless Landlord from any liability, injury, or damage occurring on the Premises, including incidents caused in whole or in part by Landlord's own negligence.`
  },
  {
    id: 'nda',
    title: 'Mutual Non-Disclosure Agreement (NDA)',
    category: 'NDA',
    description: 'Commercial mutual NDA with broad confidentiality definition, intellectual property assignments, and perpetual survival.',
    docType: 'NDA',
    jurisdiction: 'Delaware',
    text: `MUTUAL NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is made between Apex Dynamics Inc. ("Company") and Receiving Party ("Recipient").

1. PURPOSE. The parties wish to explore a potential business relationship concerning proprietary software integration ("Purpose").

2. CONFIDENTIAL INFORMATION. "Confidential Information" includes all technical, business, customer, source code, financial, and roadmap information disclosed orally or in writing, whether or not marked as confidential. It also includes any ideas, feedback, suggestions, or enhancements communicated by either party.

3. OBLIGATIONS & RESTRICTIONS. Recipient agrees to hold Confidential Information in strict confidence and not disclose it to any third party without prior written consent. Recipient shall protect such information with at least the standard of care it uses for its own most sensitive assets, but no less than reasonable care.

4. IP ASSIGNMENT OF DERIVATIVES. Any improvements, inventions, code modifications, or derivative works conceived by Recipient that relate to or arise from exposure to Company's Confidential Information shall automatically become the sole property of Company.

5. TERM & SURVIVAL. This Agreement governs disclosures made within two (2) years of the Effective Date. The confidentiality obligations regarding trade secrets, source code, and customer data shall survive perpetually until such information enters the public domain through no fault of Recipient.

6. NON-SOLICITATION. During the term and for twenty-four (24) months thereafter, Recipient shall not directly or indirectly solicit, recruit, or hire any employee, contractor, or consultant of Company.

7. GOVERNING LAW & INJUNCTIVE RELIEF. This Agreement is governed by the laws of Delaware. Recipient acknowledges that unauthorized disclosure causes irreparable harm entitling Company to immediate preliminary and permanent injunctive relief without the requirement of posting a bond.`
  },
  {
    id: 'contractor',
    title: 'Independent Contractor Service Agreement',
    category: 'independent-contractor',
    description: 'Freelance engineering agreement with milestones, intellectual property rights, non-compete clauses, and payment terms.',
    docType: 'independent-contractor',
    jurisdiction: 'New York',
    text: `INDEPENDENT CONTRACTOR SERVICES AGREEMENT

This Agreement is entered into between Horizon Media Labs ("Client") and Contractor ("Service Provider").

1. SERVICES & MILESTONES. Contractor will deliver software engineering and UX development services as outlined in Statement of Work #1. Client reserves the right to request unlimited revisions until final written acceptance is granted.

2. COMPENSATION & NET PAYMENT. Client will pay Contractor $95.00 per hour. Invoices shall be submitted monthly and paid Net-60 from Client's formal acceptance of deliverables.

3. WORK FOR HIRE & ASSIGNMENT. All deliverables, software code, algorithms, designs, documentation, and work product ("Work Product") created by Contractor under this Agreement are deemed "work made for hire." Contractor irrevocably assigns all right, title, and interest worldwide to Client.

4. NON-COMPETE & EXCLUSIVITY. During the engagement and for twelve (12) months following termination, Contractor shall not perform consulting, development, or advisory services for any company offering competing products or services within the North American market.

5. TERMINATION. Client may terminate this Agreement immediately at any time with or without cause upon written notice. Contractor may terminate only upon thirty (30) days advance written notice. Upon termination, Client owes payment only for accepted, completed milestones.

6. INDEPENDENT STATUS. Contractor is an independent contractor and not an employee. Contractor is solely responsible for all federal, state, and local income taxes, self-employment taxes, and statutory insurance.`
  }
]

export const SAMPLE_COMPARISON_PAIRS = [
  {
    id: 'nda-v1-v2',
    title: 'Standard NDA vs. One-Sided Strict NDA',
    docType: 'NDA',
    description: 'See how standard mutual protections can be shifted into aggressive IP assignment, non-solicitation, and perpetual liability.',
    docA: `CONFIDENTIALITY AGREEMENT (Standard Mutual)

1. CONFIDENTIAL INFORMATION. Confidential Information refers to non-public technical or commercial information disclosed by either party that is clearly designated in writing as "Confidential" at the time of disclosure.

2. EXCLUSIONS. Confidential Information does not include information that: (a) is or becomes publicly known without breach; (b) was already known to Recipient; (c) is independently developed without reference to the information.

3. TERM OF PROTECTION. The obligations of confidentiality shall remain in effect for a period of two (2) years from the date of disclosure.

4. OWNERSHIP. Each party retains all rights, title, and interest in its own pre-existing intellectual property. No licenses or property transfers are granted by implication.

5. REMEDIES. The parties agree that monetary damages may be inadequate in the event of a breach, and either party may seek equitable injunctive relief in a court of competent jurisdiction.`,
    docB: `CONFIDENTIALITY AGREEMENT (Strict Discloser-Biased)

1. CONFIDENTIAL INFORMATION. Confidential Information includes all technical, business, customer, and strategic data disclosed orally or in writing, regardless of whether marked confidential, as well as any derivative ideas or notes made by Recipient.

2. EXCLUSIONS. The burden of proving any exclusion rests exclusively on Recipient through clear and convincing contemporaneous written documentation.

3. TERM OF PROTECTION. The confidentiality obligations regarding all business data and trade secrets shall survive indefinitely in perpetuity.

4. OWNERSHIP & DERIVATIVES ASSIGNMENT. Any derivative works, improvements, or enhancements conceived by Recipient resulting from exposure to Discloser's Confidential Information become the exclusive property of Discloser.

5. NON-SOLICITATION & INJUNCTION. Recipient agrees not to solicit or hire any employees or clients of Discloser for 24 months. Discloser is entitled to immediate injunctive relief without the necessity of posting any bond.`
  },
  {
    id: 'lease-standard-aggressive',
    title: 'Fair Tenant Lease vs. Aggressive Landlord Lease',
    docType: 'lease',
    description: 'Notice requirements, repair cost thresholds, entry rules, and liability waivers.',
    docA: `RESIDENTIAL LEASE - STANDARD TERMS

1. NOTICE OF ENTRY: Landlord shall provide at least twenty-four (24) hours advance written notice prior to entering the rental unit, and entry shall occur only during standard business hours (9am - 5pm), except in cases of verified emergency.

2. SECURITY DEPOSIT: Deposit equals one month's rent ($2,000). Deductions are limited to actual damage beyond normal wear and tear. Itemized accounting and balance returned within 21 days.

3. REPAIRS & MAINTENANCE: Landlord is responsible for all structural, plumbing, electrical, and appliance maintenance. Tenant is responsible for basic cleanliness.

4. TERMINATION NOTICE: Either party may terminate a month-to-month tenancy by providing thirty (30) days prior written notice.`,
    docB: `RESIDENTIAL LEASE - RESTRICTIVE TERMS

1. NOTICE OF ENTRY: Landlord and Landlord's contractors reserve the right to enter the unit at any time without prior notice for inspections, maintenance, or marketing.

2. SECURITY DEPOSIT: Deposit equals two months' rent ($4,000). Landlord may deduct mandatory cleaning, re-painting, and administrative overhead fees at Landlord's discretion. Balance returned within 60 days.

3. REPAIRS & MAINTENANCE: Tenant is responsible for all repair costs under $400 per incident. A $50 dispatch fee applies to every maintenance request submitted to Landlord.

4. TERMINATION & AUTOMATIC RENEWAL: Lease automatically renews for 12 months with 8% rent escalation unless Tenant sends certified non-renewal notice at least 60 days in advance.`
  }
]
