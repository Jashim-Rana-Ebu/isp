import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient Glow Effects */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full pointer-events-none"
        style={{ background: "rgba(124, 58, 237, 0.12)", filter: "blur(120px)" }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full pointer-events-none"
        style={{ background: "rgba(79, 70, 229, 0.12)", filter: "blur(120px)" }}
      />
      
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#2A2A35 1px, transparent 1px), linear-gradient(90deg, #2A2A35 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      
      <NavBar />
      <main className="max-w-4xl mx-auto px-6 md:px-8 py-16 relative z-10">
        <h1 className="font-grotesk text-4xl md:text-5xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none space-y-8 text-on-surface-variant">
          <section>
            <p className="text-sm text-on-surface-variant mb-8">
              Last updated: January 2026
            </p>
            <p className="text-lg leading-relaxed mb-6">
              Ultimate ISP ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our ISP management platform.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-2xl font-bold text-on-surface mb-4">1. Information We Collect</h2>
            <p className="mb-4">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account information (name, email address, phone number)</li>
              <li>Business information (company name, address, tax ID)</li>
              <li>Payment information (processed securely through third-party payment processors)</li>
              <li>Customer data you input into our system (client records, billing information)</li>
              <li>Technical data (IP addresses, browser type, device information)</li>
              <li>Usage data (features accessed, time spent, actions taken)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-grotesk text-2xl font-bold text-on-surface mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, prevent, and address technical issues and security threats</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="font-grotesk text-2xl font-bold text-on-surface mb-4">3. Information Sharing and Disclosure</h2>
            <p className="mb-4">We may share your information in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Providers:</strong> With third-party vendors who perform services on our behalf</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize us to share information</li>
            </ul>
            <p className="mt-4">We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="font-grotesk text-2xl font-bold text-on-surface mb-4">4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Employee training on data protection practices</li>
            </ul>
          </section>

          <section>
            <h2 className="font-grotesk text-2xl font-bold text-on-surface mb-4">5. Data Retention</h2>
            <p>
              We retain your information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-2xl font-bold text-on-surface mb-4">6. Your Rights</h2>
            <p className="mb-4">Depending on your location, you may have the following rights:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access and receive a copy of your personal information</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your information</li>
              <li>Object to or restrict certain processing activities</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us at privacy@ultimateisp.com
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-2xl font-bold text-on-surface mb-4">7. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to collect information about your browsing activities. You can control cookies through your browser settings and other tools.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-2xl font-bold text-on-surface mb-4">8. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-2xl font-bold text-on-surface mb-4">9. Children's Privacy</h2>
            <p>
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-2xl font-bold text-on-surface mb-4">10. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-2xl font-bold text-on-surface mb-4">11. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="bg-surface-container-high border border-border-muted rounded-lg p-6">
              <p className="mb-2"><strong>Email:</strong> privacy@ultimateisp.com</p>
              <p className="mb-2"><strong>Phone:</strong> 01722625256</p>
              <p><strong>Address:</strong> Bandar Shahi Mosjid, Narayanganj 1410</p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
