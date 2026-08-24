---
title: What They Can Actually Learn About You
description: A plain-language walkthrough of what a license-plate scan becomes, from one camera on Patton Avenue to a nationwide search, a data-broker profile, and a live video feed. Built from court records, audit logs, and APD's own briefings.
aliases:
  - "What They Can Actually Learn About You"
---

Start with the number the sales pitch never mentions: when the Electronic Frontier Foundation obtained 2.5 billion license-plate scans from 200 law-enforcement agencies, **99.5% of the plates scanned belonged to people suspected of nothing**. ([EFF Data Driven dataset](https://www.eff.org/pages/automated-license-plate-reader-dataset)) These systems are not pointed at criminals. They are pointed at everyone, on the theory that a criminal will eventually drive past.

This page walks through what that means for you, concretely, using court opinions, leaked audit logs, a U.S. Senate investigation, and Asheville Police Department's own statements to council.

## A plate scan is a location record

One scan is a photo of your car. A database of scans is a diary of your life. The highest court of Massachusetts said it plainly in *Commonwealth v. McCarthy* (2020): aggregated plate-reader data can produce

> "a highly detailed profile, not simply of where we go, but by easy inference, of our associations — political, religious, amicable and amorous."

The court held that "individuals have a reasonable expectation of privacy in the whole of their physical movements", and that widespread ALPR networks "could implicate constitutional protections against unreasonable searches." ([Full opinion](https://caselaw.findlaw.com/court/spr-jud-crt-mas-bar/2060202.html) · [Harvard Law Review analysis](https://harvardlawreview.org/print/vol-134/commonwealth-v-mccarthy/))

How fast does the diary fill? In Norfolk, Virginia (about 175 Flock cameras, a network smaller than what Asheville plugs into), one plaintiff's car was photographed **475 times in four and a half months**. A federal judge upheld that system in January 2026, but went out of his way to warn that the answer was contingent: "at least in Norfolk, Virginia, the answer is: **not today**", and that "as the number and capabilities of ALPR cameras expand, the constitutional balancing could conceivably tip the other way." The Institute for Justice is appealing. ([WHRO](https://www.whro.org/business-growth/2026-02-11/a-federal-judge-ruled-norfolks-flock-surveillance-cameras-dont-invade-peoples-privacy-yet) · [Courthouse News](https://www.courthousenews.com/judge-holds-norfolks-license-plate-reader-use-constitutional/))

Your regular routes tell anyone with database access where you sleep, where you work, which church or clinic or meeting you attend, and whose driveway your car spends the night in. That isn't a side effect. It's the product.

## The network your plate joins

Here is Deputy Chief (now Interim Chief) [[Jackie Stepp]], briefing council on March 7, 2025, a briefing that only happened because a councilmember read about the cameras in the news and asked ([video, 1:14:41](https://www.youtube.com/watch?v=VYk_Gku-UaY)):

> "It's important also to note, through our Flock Safety and Axon partnerships, that we have access to **over 177,000 cameras across the Eastern US** — and we've had that access... this includes law enforcement agencies, which makes up about 97% of that number... but it also includes business partners... we have a number of Home Depot, Lowe's, various retail that have joined in."

Note the tense: *we've had that access*, before council was ever told. In the same briefing she described the reach as "cameras within a 500-mile radius of where we are." Four months later, APD told the [[The Committee|Public Safety Committee]] the network was "connected to over 19,000 cameras across a 500 mile radius." 19,000 or 177,000: the numbers move by an order of magnitude depending on the room, which tells you how precisely this is being tracked. Either figure makes "local cameras for local crime" untenable: a 500-mile radius around Asheville reaches Washington D.C., Atlanta, Nashville, and the ocean.

And the sharing runs both ways. Every plate scanned in Asheville becomes searchable by the network, which, per audit logs from around the country, includes agencies you have never heard of, in states you have never lived in. In Spokane County, Washington, records showed the database holding local plate scans was searched **2.3 million times in six months, with over 95% of those searches from outside agencies**, including Texas and Alabama. ([RANGE Media](https://www.rangemedia.co/flock-safety-cameras-spokane-county-abortion-texas/))

## How a nationwide search works

This is the part officials describe least, so let's be precise. A Flock network search is **account-based**: any logged-in officer at any participating agency can query every camera shared with the national network in one step. The system requires one thing before running the search: a "reason," typed into a free-text box by the officer, checked by no one.

We know exactly how that works in practice because of one search. In May 2025, a sheriff's deputy in Johnson County, Texas ran a nationwide Flock lookup for a woman who had self-managed an abortion. His search swept **6,809 networks and 83,345 cameras**, including cameras in states where abortion is legal. The reason he typed into the box: *"had an abortion, search for female."* ([404 Media](https://www.404media.co/a-texas-cop-searched-license-plate-cameras-nationwide-for-a-woman-who-got-an-abortion/) · [EFF's audit-log analysis](https://www.eff.org/deeplinks/2025/10/flock-safety-and-texas-sheriff-claimed-license-plate-search-was-missing-person-it)) The full story is on [[Who Gets Watched]].

After months of oversight correspondence with Flock, Senator Ron Wyden's office put the structural conclusion in writing; this is a [primary document](https://www.wyden.senate.gov/imo/media/doc/wyden_letter_to_flock.pdf), October 2025:

> "**Abuse of Flock cameras is inevitable**, and Flock has made it clear it takes no responsibility to prevent or detect that."

The letter quotes Flock's own Chief Communications Officer: "it is not Flock's job to police the police." And it documents why the "reason" box is theater: in EFF's dataset of **11.4 million nationwide searches over six months**, more than 14% of the reasons were just the word "investigation": no case number, no crime. The ACLU found officers could type "hehehe" as a reason and run the search. ([ACLU](https://www.aclu.org/news/privacy-technology/despite-new-updates-flocks-creepy-cameras-remain-major-civil-liberties-threat))

Keep that in mind when APD says, as it did in August 2026, that only 18 people can search its cameras and "you have to put the reason." ([828NewsNow](https://828newsnow.com/news/228822-flock-cameras-asheville-police-explain-use-of-11-license-plate-readers/)) The reason box is the safeguard a U.S. Senate investigation already found meaningless, and 18 local searchers says nothing about the thousands of outside agencies the network serves.

## From your plate to your name

Flock's next product closes the loop. In 2025, leaked materials showed Flock building **Nova**, a people-lookup tool designed, in the words of the leak, to let police "jump from LPR to person," connecting plate scans to people-search products, public records, and data-broker material; one contemplated source was data from the 2021 ParkMobile breach. After the reporting, Flock said Nova "will not supply any data purchased from known data breaches or stolen data." Flock's own marketing for Nova today: search "RMS, CAD, LPR, jail records, public records, and approved open sources without switching tabs." ([404 Media](https://www.404media.co/license-plate-reader-company-flock-is-building-a-massive-people-lookup-tool-leak-shows/) · [Flock's walk-back](https://www.404media.co/flock-decides-not-to-use-hacked-data-in-people-search-tool/) · [Flock's product page](https://www.flocksafety.com/products/flock-nova)) Nova is shipping, not hypothetical: San Diego PD quietly signed a Nova contract in April 2026 before pausing it under scrutiny. ([Axios San Diego](https://www.axios.com/local/san-diego/2026/04/29/san-diego-police-flock-nova-surveillance-technology-contract-review))

So the pipeline on offer is: camera reads plate → plate becomes location history → location history joins your name, records, and broker file. No step requires a warrant.

## When the machine is wrong

Everything above assumes the system works. The documented failures come in three flavors:

**Bad entry.** In Aurora, Colorado, a typo (the numeral "1" entered for the letter "I") sat in a state hotlist for roughly two years. In August 2020 it flagged Brittany Gilliam's SUV as a stolen vehicle (the actual stolen vehicle: a *motorcycle*, from *Montana*). Police held Gilliam, her 6-year-old daughter, her sister, and two nieces face-down on hot asphalt at gunpoint. The city paid a **$1.9 million settlement**. ([CNN](https://www.cnn.com/2024/02/05/us/colorado-aurora-settlement-stolen-vehicle-mixup) · [CBS News](https://www.cbsnews.com/news/license-plate-readers-alpr-mistakes/))

**Bad read.** In Española, New Mexico, a camera read a "2" as a "7", and a 12-year-old girl ended up in handcuffs. A month later in the same town, a 17-year-old honors student was held at gunpoint after another ALPR mistake. ([CBS News investigation](https://www.cbsnews.com/news/license-plate-readers-alpr-mistakes/))

**Stale entry.** A California privacy-board chair was held at gunpoint at Thanksgiving after his rental car was flagged stolen: the car had already been recovered; nobody had cleared the flag. (Same CBS investigation.)

A hotlist "hit" is not a fact. It's an automated alert built from human data entry, machine vision, and list hygiene, and every one of those has failed with guns drawn. Now scale it: every alert in a 177,000-camera network is one of these, and the RTIC's purpose is to act on them in real time.

## Beyond plates: the live-video layer

The RTIC isn't just plate readers; that's the part Asheville already had. What the [[What Axon Contracts Do|Axon contract]] adds is **Fusus**, and Axon's own marketing describes it better than any critic could: a CORE device placed on a private camera network "detects, analyzes and connects to **every camera on the building's network**," and the platform "extracts and unifies live video, data and sensor feeds from virtually any source," giving police "a live, map-based view of both public and private camera networks." ([Axon's product page](https://www.axon.com/products/axon-fusus))

Asheville's version of this was described on the record at the [[2025-03-25 City Council|March 25, 2025 council meeting]] by APD technology specialist [[Jimmy Wingo]] ([video, 42:09](https://www.youtube.com/watch?v=Bc-VVlvBx0U)): private participation comes in two tiers: "a registry, just so we know where a camera is in a city, and then there's also one where you could provide us **full viewing capability**." That includes, in his example, "the Ring camera at your home." When Councilmember [[Kim Roney|Roney]] pointed out that courts elsewhere have compelled private footage, Wingo conceded: "if the court comes to your house and has a warrant for that Ring camera footage, then you would have to give it to us." The "voluntary" in voluntary integration belongs to the camera's owner, never to the people it records. See [[Before You Plug In]] for what that means if you own the camera, and [[Watching the Poor]] for what it means if you live under one you never agreed to.

## What a scan becomes

Put the pieces in a row:

1. A camera on your commute reads your plate, along with 99.5% of plates belonging to no suspect anywhere.
2. The scan joins a searchable regional and national pool: 19,000 cameras or 177,000, depending on which APD briefing you attend.
3. Any of thousands of network agencies (or, per the audit logs, federal agencies through them) can query it with a reason no one checks.
4. A hit, right or wrong, can escalate to the RTIC's live layer: a map of public and private cameras, including homes and businesses that "opted in," tracking in real time.
5. And the vendor is building the product that turns the plate into a person.

Each step is documented above from primary sources. No step requires a warrant, a judge, or a council vote. That is what Asheville bought, and what every promise on the [[Promise Tracker]] is supposed to contain.

*Related: [[Who Gets Watched]] · [[Watching the Poor]] · [[What Is the RTIC]] · [[Getting Flock Out]] · [[The Abuse Record]] · [[Their Claims vs The Record]]*
