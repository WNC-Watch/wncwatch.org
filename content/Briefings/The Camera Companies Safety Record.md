---
title: The Camera Companies' Safety Record
aliases:
  - "The Safety Culture Test"
description: "What a safety culture is, a four-question test any reader can apply, and the dated record of the companies selling camera systems to WNC towns, with the local record run through the same test."
---

This page is built from dated public materials: the resigning Axon ethics board members' own statement, the Electronic Frontier Foundation's published investigations, news reporting named inline with its outlet and date, the Buncombe County Sheriff's Office's released access log, Asheville's released policy drafts, and the vendors' own transparency portals, which we checked in a browser on Aug 27, 2026. Where we hold the primary document, the claim stands on it; where we hold only reporting, the outlet is named in the sentence.

The subject is a question communities keep asking in these debates without a settled way to answer it: can the companies selling these systems be trusted with their defaults? "Safety culture" gives the question a checkable form. The term comes from aviation and medicine, where it has a settled meaning: an organization has a safety culture when it finds its own failures before outsiders do, reports them without being caught, and fixes the class of problem rather than the instance. Aviation became the safest way to travel by assuming machines fail and designing the whole system around that assumption: public investigations, written-down failures, protected reporting.

That meaning yields four questions, and the questions are the whole method of this page. The judgment stays with the reader.

1. Who found the problem: the company, or a journalist, researcher, auditor, or prosecutor?
2. Did the fix arrive when the weakness was known, or when it became public?
3. Did the fix address the instance, or the class?
4. What happened to the people inside who raised concerns?

## Flock Safety

Credit first, because the recent changes are real. In August 2026 Flock made case or incident numbers mandatory on every search, added auditing designed to surface improper searches, and announced a 7-day default retention (WLOS and WHKP, week of Aug 14; the retention default takes effect Jan 1, 2027). In August it also set a ten-camera minimum for system access. Each of these is a genuine safeguard, and each addresses a class of problem rather than a single case, which is what question 3 asks for.

Question 1 and question 2 are answered by the dates, so here is the record in sequence, each item with who surfaced it:

| Date | Event | Who surfaced it |
|---|---|---|
| 2025 | Leaked materials describe Nova, a people-lookup product to "jump from LPR to person," with data from a 2021 parking-app breach among its contemplated sources | Journalists, via leak |
| Aug to Sep 2025 | A state audit finds Flock gave Customs and Border Protection access to Evanston, Illinois data in violation of Illinois law; the city terminates and deactivates 19 cameras; Flock reinstalls them without authorization; the city calls the breach "material, intentional, and cannot be cured" (Evanston RoundTable, ABC7 Chicago) | A state auditor, then the city |
| Dec 2025 | Researcher Benn Jordan finds dozens of Flock Condor cameras reachable on the open internet with no password: live feeds, about 30 days of archive, settings, deletion; 404 Media reproduces the finding | An independent researcher |
| Ongoing | The Electronic Frontier Foundation reviews 11.4 million search justifications and finds more than 14 percent consist of the single word "investigation" | An advocacy group reading records |
| Jul 29 and Aug 5, 2026 | Two North Carolina officers are criminally charged for Flock misuse: Charlotte, an unauthorized search; Mooresville, 31 searches tracking an ex-wife (WLOS, ABC News) | Prosecutors and the SBI |
| Week of Aug 14, 2026 | The safeguard package above ships | The company |

Every entry in the third column is external until the last row. Each of the August safeguards was available as a product decision in any earlier year and required no new technology. A case from a neighboring state shows the gap in practice: in Colleton County, South Carolina, a new sheriff directed an audit in August 2026; the vendor's audit tool, available all along, was activated on a Tuesday, and by Wednesday it had flagged a lieutenant with more than 2,700 unauthorized searches run over about a year (ABC News 4 Charleston).

Flock cofounder Paige Todd, asked about the misuse cases, said: "Technology doesn't create misconduct. People do" (Cardinal & Pine, Aug 18, 2026). The first sentence is true, and no one in this record disputes it. The record above is about the second half of the question, which is design: a free-text reason box, a 30-day shared pool, and cross-agency lookup carried one Mooresville officer's decision into 31 logged searches of another person's movements. The company's own August changes are design changes, which reads as agreement that design was the open item.

## Axon

Credit first here too, and by name, because Axon once did the thing this test looks for. In 2019, the company created an outside AI Ethics Board, the board recommended against putting face matching on body cameras, and Axon agreed. That is a company inviting an outside check and following it, and it passed every question on this page.

What the record shows next: in June 2022 the board voted 8 to 4 against piloting taser-equipped drones; weeks later the company announced a taser-drone school product; nine of the twelve members resigned, in a public statement (Policing Project). Question 4 asks what happened to the people inside who raised concerns, and this is the clearest documented answer in the industry: they left. The company's later expansion into surveillance is a matter of record: a $21 million investment in Fusus that same year, the purchase of Fusus in February 2024 and of the drone company Dedrone in October 2024, and the launch of its own fixed plate readers after ending its partnership with Flock in 2025. The products WNC towns are being offered date from this period.

One product bears on the test's premise rather than any single question. Draft One, Axon's AI report writer, does not retain the AI's draft, so no record exists of what the machine wrote against what the officer edited. The Electronic Frontier Foundation's investigation found the design intentional and quoted Axon's senior principal product manager for generative AI on the reason: retaining drafts would "create more disclosure headaches for our customers and our attorney's offices" (EFF, July 2025). That is the company's stated reason, given as an operational concern for its customers, and it is quoted here as such. The design's effect is that the audit of machine against officer cannot be run. California has moved to require draft retention, which Draft One as designed cannot satisfy.

A precision note this page owes the reader: Axon states it does not sell personal data, and no evidence contradicts that. The documented issues are default enrollment in its customer-data program, contract control of usage metadata, and lock-in terms, covered clause by clause in [[What Axon Contracts Do]] and [[Transylvania County|the Brevard read]].

## Fusus

Fusus, the platform under Buncombe County's camera network and Asheville's planned RTIC, had a documented record before Axon bought it: EFF's 2023 analysis that the model "expands police access to personal information collected by private cameras that would otherwise require warrants and community conversation"; privacy assurances that lived in company policy rather than in any enforceable instrument; attribute search; facial-recognition compatibility; and a Nashville contract signed without the council approval the city's own code required ([[Axon]] carries the sources). The purchase resolved none of these items; they transferred with the product.

## The same test, here

The test applies to the local record with the same questions, and the record answers.

- The county's access log became public through a records request, and showed 58 percent of camera viewing on public housing and 217,506 live views against 7,052 recorded, with every timestamp withheld ([[Sheriffs Audit Log|The Sheriff's Audit Log]]).
- Asheville's released policy drafts show a ban on remote terminal access and a per-shift review of plate-reader hot lists present in the June 29 draft and absent by July 9, with no replacement language. The facial-recognition ban that council's resolution required was absent from the first two drafts, though APD's policy manager had told the working group on June 11 that the resolution requires the policy to "explicitly prohibit" it. A racial-profiling prohibition the same resolution required does not appear in any draft or the final. The drafts are public and compared line by line on [[The RTIC Policy]].
- The committee where oversight formally sits has requested zero RTIC audit reports across every recorded meeting, and the plate-reader audit reports state law already requires have not been produced ([[The Committee]]).
- The vendors' portals, checked Aug 27: every live WNC portal still shows 30-day retention; Asheville's portal now contains no data at all; no portal separates external-agency searches from internal ones, the reporting gap that hid roughly 1.5 million out-of-state searches of App State's cameras until the university pulled the log.

Run through the four questions, the local findings match the national ones: the finder was a records request, an auditor, or a reporter each time, and the scheduled checks either ran internally or did not run.

## What passing looks like

The test has been passed in this region once, and the credit belongs to the department that did it. Boone Police Chief Daniel Duckworth pulled his own audit log in August, published the results, and cut Boone's sharing list from more than 1,000 agencies to about 40; App State, on the same numbers, restricted its cameras' access, and its portal now shows 4 searches in the last 30 days, down from roughly 500,000 a month before the cut. Duckworth told the Watauga Democrat:

> "The technology was rolled out quickly, and law-enforcement agencies did not do a great job from the beginning developing comprehensive policies and procedures before allowing broad access to the system."

And: "I am very open to having a conversation with the public about what responsible use of this technology should look like." Those two sentences are question 1, asked from inside an agency, followed by the fix, and they are the only documented instance of that sequence in this record.

For a town weighing a purchase, the record above converts into three concrete items, each with a working example: safeguards in an instrument only a public vote can change, because the draft-policy record shows what happens to safeguards a signature can remove; an audit that runs on a schedule and is published, because every misuse case above was found by an audit someone finally ran; and a sharing list a resident can read, because Boone's is 40 organizations and Henderson County's runs to the thousands with the same product from the same vendor, a difference that is a setting. [[Watauga County]] documents the first of these working. The full vendor records: [[Flock Safety]], [[Axon]], [[The Abuse Record]], [[Stories That Check Out]].

*Corrections welcome; this page is meant to be checked.*
