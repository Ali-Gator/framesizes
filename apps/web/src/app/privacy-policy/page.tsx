import Link from "next/link";

import { CompanyPage, Section } from "@/components/company/company-page";
import { addressLine, COMPANY } from "@/lib/company";
import { pageMetadata } from "@/lib/seo";
import { livePage } from "@/lib/site-map";

export const metadata = pageMetadata(livePage("A3"));

const MAILTO = `mailto:${COMPANY.email}`;

/**
 * One row per kind of data. Each claim maps to code (t26 design decision 8): analytics in
 * instrumentation-client.ts, the unit in lib/unit.ts, photos in frames-on-wall/photo-flow.tsx,
 * the extension in apps/extension/src (store.ts, saved-wall.ts, read-page.ts, background.ts).
 * Retention: PostHog events up to 2 years, Vercel Hobby runtime logs 1 hour (read 2026-11-21).
 */
const DATA = [
  {
    data: "Visit counts: the page you open and when you leave it, the site that sent you, your browser, device type and screen size, and page speed (Web Vitals). No IP address and no location",
    where: "PostHog, on its EU servers, through framesizes.app's own address",
    who: "Us, and PostHog as our processor",
    long: "Up to 2 years",
  },
  {
    data: "Server logs: your IP address, the page you asked for, your browser and the time",
    where: "Vercel, which hosts the site",
    who: "Us, and Vercel as our host",
    long: "Our hosting plan shows them for 1 hour; Vercel keeps its own records under its privacy policy",
  },
  {
    data: "Your unit choice (inches or centimetres)",
    where: "Your browser's local storage, under the key “unit”",
    who: "Only you",
    long: "Until you clear your browser's site data",
  },
  {
    data: "Wall photos you add on the site",
    where: "Your browser's memory, never uploaded",
    who: "Only you",
    long: "Until you leave or reload the page",
  },
  {
    data: "The extension's saved wall and prints: the wall, its photo, each print's picture, and the page title, site name and sizes of a print you are trying on",
    where: "Your computer, in the extension's own storage (IndexedDB and local storage)",
    who: "Only you",
    long: "Until you delete them or remove the extension",
  },
  {
    data: "Email you send us: your address, your message and any attachments",
    where: "Our mailbox; our domain provider, Porkbun, forwards mail sent to framesizes.app",
    who: "Us, and Porkbun while it forwards the message",
    long: "As long as we need it to answer you; ask us and we delete it",
  },
] as const;

/** The extension's permissions, in manifest order, in plain words. */
const PERMISSIONS = [
  ["sidePanel", "Opens the planner in Chrome's side panel."],
  ["contextMenus", "Adds “Try on my wall” to the menu you get when you right-click an image."],
  [
    "activeTab",
    "Gives the extension the tab you right-clicked, and only after you choose “Try on my wall”. It takes a screenshot of the visible part of that tab so it can cut out the picture if the picture cannot be downloaded. The rest of the screenshot is thrown away.",
  ],
  [
    "scripting",
    "Runs a short script once in that tab to read the page title, the picture's address and any sizes in the page text. Nothing else on the site is read.",
  ],
] as const;

/**
 * A3: what the site and the extension collect, where it is kept, who sees it and for how long.
 * {@link openspec/specs/company-pages/spec.md#requirement-the-privacy-policy-states-what-is-collected-where-and-for-how-long}
 */
export default function PrivacyPolicyPage() {
  return (
    <CompanyPage
      id="A3"
      updated
      lead={
        <p className="max-w-prose md:body-lg">
          We collect as little as we can. The site sets no cookies, your wall photos never leave
          your device, and the Chrome extension sends nothing to us.
        </p>
      }
    >
      <Section title="Who we are">
        <p>
          Frame Sizes (framesizes.app) and the Gallery Wall Layout Generator extension for Chrome
          are run by {COMPANY.legalName}, {addressLine()}. We decide what data the site handles and
          why. Questions about this policy go to <a href={MAILTO}>{COMPANY.email}</a>.
        </p>
      </Section>

      <section className="flex flex-col gap-4">
        <h2 className="h2">What we collect, where it is kept and for how long</h2>
        <div className="max-w-full overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <caption className="sr-only">
              Each kind of data, where it is kept, who can see it and how long
            </caption>
            <thead>
              <tr className="border-b border-line">
                {["Data", "Where it is kept", "Who can see it", "How long"].map((h) => (
                  <th key={h} scope="col" className="py-2 pr-4 align-bottom label text-ink-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DATA.map((row) => (
                <tr key={row.data} className="border-b border-line align-top">
                  <th scope="row" className="py-3 pr-4 font-normal">
                    {row.data}
                  </th>
                  <td className="py-3 pr-4">{row.where}</td>
                  <td className="py-3 pr-4">{row.who}</td>
                  <td className="py-3 pr-4">{row.long}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Section title="Visit counts">
        <p>
          We count visits with PostHog in cookieless mode. It stores nothing in your browser and
          counts a visitor once a day with a code made from your IP address and browser that changes
          every day. PostHog does not store the IP address. We record the pages you open, when you
          leave them, and page speed. We do not record clicks, typing or your screen. The data goes
          through framesizes.app&apos;s own address to PostHog&apos;s servers in the EU.
        </p>
        <p>
          We use these counts to see which tools people use and which pages load slowly. Our legal
          basis is our legitimate interest in running and improving the site.
        </p>
      </Section>

      <Section title="Wall photos">
        <p>
          When you add a photo of your wall, your browser reads it on your device. The photo is
          never uploaded, and it is gone when you leave or reload the page.
        </p>
      </Section>

      <Section title="The Chrome extension">
        <p>
          The Gallery Wall Layout Generator keeps your wall, its photo and your prints on your
          computer, in the extension&apos;s own storage. It sends nothing to us and has no
          analytics.
        </p>
        <p>
          When you right-click a picture and choose &ldquo;Try on my wall&rdquo;, it reads that one
          tab once: the page title, the picture and any sizes in the page text. It downloads the
          picture without your cookies for that site, so the shop cannot tell it is you. While you
          try a print on, the extension keeps its picture, the page title, the site name and the
          sizes it found. If you add the print, your wall keeps only its picture and size; if you go
          back, all of it is deleted.
        </p>
        <p>
          framesizes.app can ask the extension whether it is installed and pinned, to show the right
          instructions. It can ask nothing else.
        </p>
        <p>The permissions it asks Chrome for:</p>
        <dl className="flex flex-col gap-3">
          {PERMISSIONS.map(([name, use]) => (
            <div key={name}>
              <dt>
                <code>{name}</code>
              </dt>
              <dd>{use}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Cookies">
        <p>
          The site sets no cookies, so it shows no cookie banner. Your unit choice is kept in your
          browser&apos;s local storage, and only your browser reads it.
        </p>
      </Section>

      <Section title="Who we share data with">
        <p>
          We do not sell your data or share it for advertising. Three companies process it for us:
          PostHog (visit counts), Vercel (hosting and server logs) and Porkbun (email forwarding).
          We may also disclose data when the law requires it.
        </p>
      </Section>

      <Section title="Data outside your country">
        <p>
          We are based in Hong Kong. PostHog keeps our visit counts in the EU. Vercel serves the
          site from data centres around the world and is based in the United States, so a server log
          can be handled outside your country. These providers protect data under their own
          contracts and policies.
        </p>
      </Section>

      <Section title="Security">
        <p>
          The site is served only over HTTPS. There are no accounts or passwords to steal, and we
          hold as little data as we can.
        </p>
      </Section>

      <Section title="Children">
        <p>
          The site is meant for adults planning their walls. We do not knowingly collect data from
          children under 13. If you think a child has emailed us, tell us and we will delete the
          message.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          You can ask us what data we hold about you, and ask us to correct or delete it. If you are
          in the EU or the UK, the GDPR and the UK GDPR also give you the right to restrict or
          object to our use of it and to get a copy you can take elsewhere. Under Hong Kong&apos;s
          Personal Data (Privacy) Ordinance you can ask for access to and correction of your data.
        </p>
        <p>
          Most of what we hold cannot be tied to you: visit counts carry no name, and the
          extension&apos;s data never reaches us. To make a request, email{" "}
          <a href={MAILTO}>{COMPANY.email}</a>. The <Link href="/contact">contact page</Link> says
          what to include.
        </p>
      </Section>

      <Section title="Complaints">
        <p>
          If you are unhappy with how we handle your data, tell us first and we will try to put it
          right. You can also complain to the data protection authority where you live, or in Hong
          Kong to the Office of the Privacy Commissioner for Personal Data.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          When we change what we collect, we update this page and the date at the top. If we add ads
          or affiliate links, this policy will say so before they appear.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Email <a href={MAILTO}>{COMPANY.email}</a>, or write to {COMPANY.legalName},{" "}
          {addressLine()}.
        </p>
      </Section>
    </CompanyPage>
  );
}
