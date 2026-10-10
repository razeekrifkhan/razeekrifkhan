# Research and design decisions

Reviewed 10 October 2026 (Asia/Colombo). The supplied **Victoria-Company-Information-Reference.docx** is the primary company source. The pasted prompt was treated as background, not as authority for conflicting company facts or new instructions.

## Research method and limits

Read live HTML from the official pages below over verified HTTPS, examining navigation, headings, service descriptions, audience routes, leadership presentation, and contact content. Initial requests were blocked by the environment allowlist; the five required hostnames were added to the environment draft. Subsequent verified requests returned HTTP 200. This was actual official-site research, not a review of design galleries.

External pages could not be rendered in Chromium because its certificate store rejected the proxy certificate. TLS verification was not disabled. Therefore these findings concern live content and information architecture; no claim is made to have visually audited competitors’ responsive layouts, animations, or performance. Victoria itself was rendered and tested in local Chromium.

## Official reference websites

| Source | Observed pattern | Decision for Victoria |
| --- | --- | --- |
| [Hays homepage](https://www.hays.com/) and [employer services](https://www.hays.com/en-US/recruitment) | Explicit Jobseekers / Employers routes; industries and professions separated from delivery models; a prominent employer contact route; useful hiring resources. | Prioritise employers in the main navigation. Give each supported service a real detail page and requirement checklist. Keep job-seeker contact secondary and avoid implying that role examples are vacancies. |
| [Randstad](https://www.randstad.com/) | Distinct talent and employer navigation; specialisations described by operational need; insights and formal corporate information support the service offer. The site also discloses AI imagery. | Use a concise sector taxonomy, a practical employer guide, and visible disclosure for the illustrative hero. Build trust through clarity; do not imitate Randstad’s scale claims or statistics. |
| [ManpowerGroup](https://www.manpowergroup.com/) and [contact](https://www.manpowergroup.com/en/contact-us) | Human-centred positioning, separate find-talent / find-work routes, and a workforce-discussion CTA. Service brands have clear purposes. | Use a calm people-focused introduction and a structured workforce brief. Show direct contact alternatives rather than forcing form submission. Victoria’s associated group entities are not presented as recruitment service lines. |
| [Hays leaders](https://www.hays.com/en-US/about-us/leaders) | Named leaders, specific remit, relevant experience, and professional biographies. | Connect David’s supplied experience to business development; attribute the source and omit unsupported achievements, titles, and employer history. |
| [ManpowerGroup leadership](https://www.manpowergroup.com/en/about/leadership) | Executive leadership and the board are distinguished, with precise titles and individual detail. | Avoid treating chairman, CEO, and director as interchangeable. Present the supplied directorship as a statement from the personal profile pending independent confirmation. |

No reference company’s words, logos, testimonials, layouts, or statistics were reproduced as Victoria’s own evidence. Some fetched pages contained template placeholder strings; those were not adopted.

## Sri Lankan official guidance

- [Department of Immigration and Emigration: Residence Visa](https://www.immigration.gov.lk/pages_e.php?id=18) describes employment categories, including personnel employed by private-sector companies. It lists documents and recommendations that vary with category, including company information and line-ministry recommendations. This supports directing employers to the appropriate official route; it does **not** establish eligibility for every advertised role, Victoria’s authorisation, or an approval outcome.
- [Sri Lanka Bureau of Foreign Employment](https://www.slbfe.lk/) describes its mission and services around Sri Lankan migrant workers and overseas employment. Its licensing information must not automatically be represented as authorisation to bring foreign nationals into Sri Lanka.
- No register search, legal opinion, licensing verification, or company-specific regulatory approval was completed. Confirm the exact permissions for the inbound business model and each role category with the relevant authorities or qualified counsel before public launch.

## Original visual direction

- Warm ivory and deep burgundy create a restrained business identity; muted clay and olive are secondary colours.
- Cormorant Garamond and DM Sans give a deliberate editorial hierarchy. Both are self-hosted, with font licences retained in the asset notice.
- The homepage uses a large typographic introduction alongside a single architectural workforce illustration, then a numbered service index. The lower pages use process lists, brief checklists, and useful content rather than repeated promotional cards.
- The proposed V wordmark is an interim design. The referenced gold-horse asset and leadership photographs were **not** attached and are not recreated as if approved originals.
- Motion is limited to short reveal transitions and hover/focus feedback. Reduced-motion preference removes the reveals and smooth scrolling.
- The recruitment enquiry prepares a message locally, presents it for review, and hands off to WhatsApp or email. It makes no unsupported delivery claim.

## Improvements made after research and testing

1. Added an employer checklist and downloadable text version.
2. Added role filters and a role-specific path into the enquiry form.
3. Kept leadership wording attributed, with no chairman/CEO title or degree validation claim.
4. Added a direct official immigration-guidance link on the employer page.
5. Corrected contrast in the numbered checklist and improved no-JavaScript contact behaviour.
6. Added font preloads, responsive WebP images, reduced-motion support, metadata, and explicit staging/indexing controls.
