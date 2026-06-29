export default function Privacy() {
  return (
    <div className="container narrow legal">
      <h1>Privacy Policy</h1>
      <p className="updated">Last updated: June 29, 2026</p>

      <p>
        This Privacy Policy explains how NoteJet ("we", "us", "our") collects, uses, and shares
        information when you use NoteJet (the "Service"). By using the Service, you agree to this policy.
      </p>

      <h2>1. Information we collect</h2>
      <ul>
        <li><strong>Account information:</strong> your email address.</li>
        <li><strong>Content you submit:</strong> screenshots, transcripts, text, and notes you provide to generate study material, plus the decks you save.</li>
        <li><strong>Usage data:</strong> basic information such as generation counts and credit usage, used to operate the Service.</li>
        <li><strong>Payment information:</strong> handled by Stripe. We do not store your full card details.</li>
      </ul>

      <h2>2. How we use information</h2>
      <ul>
        <li>to provide the Service and generate notes and quizzes;</li>
        <li>to manage your account, credits, and subscriptions;</li>
        <li>to send transactional emails such as sign-in codes;</li>
        <li>to maintain security, prevent abuse, and improve the Service.</li>
      </ul>

      <h2>3. Service providers</h2>
      <p>We share the minimum data necessary with providers that help us run NoteJet:</p>
      <ul>
        <li><strong>Anthropic (Claude):</strong> processes the material you submit to generate notes and quizzes.</li>
        <li><strong>Stripe:</strong> processes payments and subscriptions.</li>
        <li><strong>Cloudflare:</strong> hosting and database.</li>
        <li><strong>Resend:</strong> delivers transactional emails.</li>
      </ul>
      <p>We do not sell your personal information, and we do not use your content for advertising.</p>

      <h2>4. Data retention</h2>
      <p>
        We keep your account and saved decks until you delete them or close your account. Material you
        submit is processed to generate your output; we retain it only as needed to provide the Service.
      </p>

      <h2>5. Cookies and local storage</h2>
      <p>
        We use your browser's local storage to keep you signed in and to identify your session. We do
        not use third-party advertising trackers.
      </p>

      <h2>6. Your rights</h2>
      <p>
        You can request access to, correction of, or deletion of your data, and you can ask us to
        delete your account. Contact <a href="mailto:support@notejet.app">support@notejet.app</a> and
        we'll help.
      </p>

      <h2>7. Children</h2>
      <p>
        NoteJet is not directed to children under 13 (or under the minimum age of digital consent in
        your country). If you are a student below the age of majority, use the Service only with the
        involvement of a parent or guardian.
      </p>

      <h2>8. Security</h2>
      <p>
        We use reasonable measures to protect your information, but no method of transmission or storage
        is completely secure.
      </p>

      <h2>9. International users</h2>
      <p>
        We operate in the United States, and your information may be processed there and in the regions
        where our service providers operate.
      </p>

      <h2>10. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. We will revise the "Last updated" date above when
        we do.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about your privacy? Email{" "}
        <a href="mailto:support@notejet.app">support@notejet.app</a>.
      </p>
    </div>
  );
}
