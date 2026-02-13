# ShoreAgents HR Automation & Self-Service

> **CLARK'S JOB** - When we get to this, Clark will build the operational stuff for all this crap. He understands this process and what we need to do.

Created: 2026-02-14
Status: PLANNING - revisit with real/live situations

---

## CONTEXT

Shore360 currently handles HR - all manual monkey work.
We're taking it over and automating everything possible.
Goal: Replace HR person completely with software.

Source doc: `~/Desktop/Shore 360 HR Handover - What This Shit Actually Means.txt`

---

## SELF-SERVICE TOOLS (Staff App → HR Tab)

### 1. Request COE (Certificate of Employment)
- Staff clicks → system generates PDF with their data → download
- Shows: name, dates employed, job title
- Used for: bank loans, visas, new jobs, government IDs

### 2. Request Leave Certificate
- Staff clicks → PDF generated with leave balance/usage
- Used for: bank loans, some visas

### 3. Request Employment Verification Code
- Staff gets unique code → gives to bank/embassy
- Third party enters code on our portal → gets verification
- No phone calls needed

### 4. View Leave Balance
- Real-time display from system

### 5. Submit Leave Request
- Fill form → auto-approve if within balance & policy
- Manager notified

### 6. Download Payslip
- Pull from payroll data → PDF

### 7. Submit Resignation
- Fill form → acknowledgment auto-sent
- Clearance workflow triggered

### 8. View Clearance Status
- See which departments signed off
- What's pending

### 9. Update Personal Info
- Change address, emergency contact, bank details

### 10. Download My Documents (201)
- Access their own contracts, IDs, certs

---

## MANAGER/HR TOOLS (Command Center)

### 11. Issue NTE (Notice to Explain)
- Select employee + violation → system generates from template
- Manager reviews → sends
- Tracks response deadline

### 12. Issue NOD (Notice of Decision)
- After NTE response reviewed
- System generates decision letter
- Warning/suspension/termination

### 13. Process Offboarding
- Triggered by resignation
- Checklist: IT, Finance, HR, Manager sign-offs
- Final pay calculated when all cleared

### 14. Approve Leave Requests
- Queue of pending requests
- Approve/deny with one click

### 15. View Staff 201 Files
- Complete employee file
- All documents, history, reviews

---

## COMMAND CENTER VIEWS

### 16. HR Activity Log
- Audit trail of all self-service actions
- Who downloaded what, when

### 17. Pending Clearances
- Employees going through offboarding
- Status of each sign-off

### 18. Active Disciplinary Cases
- Open NTE/NODs
- Response deadlines
- Case status

---

## DATABASE TABLES NEEDED (TBD)

Options discussed:

**Option A: Track Everything**
- `hr_requests` - COE, leave certs, verification requests
- `verification_codes` - Employment verification codes + usage
- `staff_clearances` - Offboarding checklist status
- `disciplinary_cases` - NTE/NOD tracking
- Generated PDFs → `staff_documents`

**Option B: Minimal**
- Only track clearances + disciplinary
- Generate PDFs on demand, don't save

**Option C: Activity Log Only**
- Single `hr_activity_log` table
- Just log actions, no separate tables

**Decision:** TBD - need to work through with real situations

---

## WHAT CAN'T BE AUTOMATED

| Task | Why |
|------|-----|
| ATM card distribution | Physical handout |
| HMO card distribution | Physical handout |
| Government portal submissions | External websites (SSS, PhilHealth, Pag-IBIG, BIR) |
| DOLE/NLRC hearings | Physical court appearance |

---

## GOVERNMENT PORTALS (Semi-Automated)

Can pre-fill forms from our data, but still need manual submission to:

- **SSS**: https://sss.gov.ph (Employer Portal)
- **PhilHealth**: https://employer.philhealth.gov.ph
- **Pag-IBIG**: https://www.virtualpagibig.gov.ph
- **BIR eFPS**: https://efps.bir.gov.ph
- **BIR eReg**: https://ereg.bir.gov.ph (TIN registration)

Need login credentials from Shore360.

---

## TEMPLATES NEEDED FROM SHORE360

- [ ] COE template
- [ ] Certificate of Leave template
- [ ] NTE template
- [ ] NOD template
- [ ] Resignation acknowledgment template
- [ ] Clearance checklist
- [ ] Employment contract template
- [ ] Quitclaim/Release template

---

## MONTHLY DEADLINES (Finance - Not HR)

| Deadline | Agency | What |
|----------|--------|------|
| 10th | BIR | Form 1601-C (withholding tax) |
| 10th | PhilHealth | RF-1 contributions |
| 10th | Pag-IBIG | Monthly contributions |
| 15th | SSS | R-3 contributions |

---

## NEXT STEPS

1. Get templates from Shore360
2. Get portal credentials from Shore360
3. Work through real situations to finalize database design
4. Build self-service tools in Staff App
5. Build HR tools in Command Center

---

## RELATED FILES

- Shore360 handover doc: `~/Desktop/Shore 360 HR Handover - What This Shit Actually Means.txt`
- Staff tables schema: See `supabase/migrations/` for staff-related tables
