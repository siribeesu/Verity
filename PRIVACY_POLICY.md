# LegalAssist — Privacy & Data Retention Policy

**Effective Date:** October 1, 2026  
**Last Updated:** October 1, 2026

At LegalAssist ("we", "us", or "our"), user privacy and data security are the foundational principles of our system architecture. This Privacy Policy outlines our zero-data-retention practices, automated privacy shielding, and compliance with global privacy regulations (including GDPR and CCPA).

---

## 1. Zero-Data-Retention Architecture

LegalAssist operates on an **ephemeral data processing model**:
* **No Document Storage**: User-submitted documents (PDFs, DOCX, TXT) and pasted text are parsed strictly in volatile RAM. They are **never** persisted to server disks, long-term databases, or cold storage.
* **No AI Training on User Data**: User contracts, prompts, questions, and excerpts are never used to train, fine-tune, or improve public or private AI models.
* **Ephemeral In-Memory Caching**: To minimize redundant computation, document analysis results are temporarily cached in an in-memory SHA-256 LRU cache with an automatic 1-hour Time-To-Live (TTL). Once expired or purged, the data is irreversibly removed from memory.

---

## 2. Automated Server & Client PII Shield

Before any document text or natural language question is transmitted to underlying LLM APIs, our automated Personally Identifiable Information (PII) sanitizer intercepts and redacts sensitive data:
* **Social Security Numbers (SSNs)**: Masked to `[REDACTED SSN]`
* **Payment Cards & Account Numbers**: Masked to `[REDACTED ACCOUNT/CARD]`
* **Email Addresses**: Masked to `[REDACTED EMAIL]`
* **Telephone Numbers**: Masked to `[REDACTED PHONE]`
* **Executable Code & Script Injections**: Stripped to `[REDACTED SCRIPT]` to prevent stored XSS and indirect prompt injection attacks.

---

## 3. Compliance Audit Logging & Client Anonymization

For security, compliance, and abuse prevention, LegalAssist records minimal operational metadata:
* **Hashed Identifiers**: IP addresses are irreversibly hashed using SHA-256 (`Client: 3e48ef9d...`) so no raw network addresses are stored.
* **Redacted Counts**: The system logs the number of PII items sanitized (e.g., `PII Scrubbed: 4`) without recording the underlying sensitive values.
* **Log Rotation**: Audit logs are maintained in a circular memory buffer capped at 100 entries, automatically overwriting older records.

---

## 4. User Rights: Data Deletion & Right-to-be-Forgotten (GDPR / CCPA)

Under GDPR (Article 17) and CCPA, users have the absolute right to purge their session records.
* **One-Click Purge**: Users can click **"Purge All My Data"** in the Privacy & Trust Center (or trigger `POST /api/compliance/purge`).
* **Immediate Effect**: Purging permanently erases all local client storage (`localStorage` & `sessionStorage`), purges the server-side analysis cache, and flushes the compliance audit trail.

---

## 5. Contact & Data Protection Inquiries

For questions regarding our privacy architecture or to report a compliance matter, contact:
* **Security & Privacy Desk**: `privacy@legalassist.local`
