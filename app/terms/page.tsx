import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";

export default function TermsOfServicePage() {
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
        <h1 className="font-grotesk text-4xl md:text-5xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert max-w-none space-y-8 text-on-surface-variant">
          <section>
            <p className="text-sm text-on-surface-variant mb-8">
              Last updated: January 2026
            </p>
            <p className="text-lg leading-relaxed mb-6">
              Welcome to Ultimate ISP. These Terms of Service ("Terms") govern your access to and use of our ISP management platform. By accessing or using our services, you agree to be bound by these Terms.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-2xl font-bold text-on-surface mb-4">1. Acceptance of Terms</h2>
            <p>
              By registering for, accessing, or using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not use our services.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-2xl font-bold text-on-surface mb-4">2. Description of Service</h2>
            <p className="mb-4">
              Ultimate ISP provides a comprehensive management platform for Internet Service Providers, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Client and subscriber management</li>
              <li>Automated billing and invoicing</li>
              <li>Network monitoring and management</li>
              <li>Integration with Mikrotik, payment gateways, and communication services</li>
              <li>Reporting and analytics tools</li>
              <li>Support ticket management</li>
            </ul>
          </section>

          <section>
            <h2 className="font-grotesk text-2xl font-bold text-on-surface mb-4">3. User Accounts</h2>
            <h3 className="font-semibold text-on-surface mt-4 mb-2">3.1 Registration</h3>
            <p className="mb-4">
              You must register for an account to use our services. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate and current.
            </p>
            <h3 className="font-semibold text-on-surface mt-4 mb-2">3.2 Account Security</h3>
            <p className="mb-4">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
            </p>
            <h3 className="font-semibold text-on-surface mt-4 mb-2">3.3 Account Eligibility</h3>
            <p>
              You must be at least 18 years old and capable of forming a binding contract to use our services. By using our services, you represent and warrant that you meet these requirements.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-2xl font-bold text-on-surface mb-4">4. Subscription Plans and Payments</h2>
            <h3 className="font-semibold text-on-surface mt-4 mb-2">4.1 Subscription Plans</h3>
            <p className="mb-4">
              We offer various subscription plans with different features and pricing. Current plans include Starter, Business, and Enterprise tiers.
            </p>
            <h3 className="font-semibold text-on-surface mt-4 mb-2">4.2 Billing</h3>
            <p className="mb-4">
              Subscription fees are billed monthly or annually in advance, depending on your chosen plan. All fees are non-refundable except as required by law or as explicitly stated in these Terms.
            </p>
            <h3 className="font-semibold text-on-surface mt-4 mb-2">4.3 Free Trial</h3>
            <p className="mb-4">
              We may offer a 14-day free trial for new users. At the end of the trial period, you will be automatically charged unless you cancel before the trial ends.
            </p>
            <h3 className="font-semibold text-on-surface mt-4 mb-2">4.4 Price Changes</h3>
            <p>
              We reserve the right to change our pricing at any time. We will provide notice of any price increases at least 30 days in advance.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-2xl font-bold text-on-surface mb-4">5. Acceptable Use</h2>
            <p className="mb-4">You agree not to use our services to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Transmit harmful code, viruses, or malware</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the integrity or performance of our services</li>
              <li>Collect or harvest information about other users without consent</li>
              <li>Use our services for any fraudulent or illegal purpose</li>
            </ul>
          </section>

          <section>
            <h2 className="font-grotesk text-2xl font-bold text-on-surface mb-4">6. Intellectual Property Rights</h2>
            <h3 className="font-semibold text-on-surface mt-4 mb-2">6.1 Our Rights</h3>
            <p className="mb-4">
              The services, including all content, features, and functionality, are owned by Ultimate ISP and are protected by copyright, trademark, and other intellectual property laws.
            </p>
            <h3 className="font-semibold text-on-surface mt-4 mb-2">6.2 Your Content</h3>
            <p className="mb-4">
              You retain all rights to the data and content you upload to our services. By uploading content, you grant us a license to use, store, and process that content solely to provide our services to you.
            </p>
            <h3 className="font-semibold text-on-surface mt-4 mb-2">6.3 Feedback</h3>
            <p>
              If you provide us with feedback or suggestions, we may use them without any obligation to you.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-2xl font-bold text-on-surface mb-4">7. Service Availability and Support</h2>
            <h3 className="font-semibold text-on-surface mt-4 mb-2">7.1 Uptime</h3>
            <p className="mb-4">
              We strive to maintain 99.9% uptime but do not guarantee uninterrupted access to our services. We may perform scheduled maintenance with advance notice.
            </p>
            <h3 className="font-semibold text-on-surface mt-4 mb-2">7.2 Support</h3>
            <p>
              Support levels vary by subscription plan. Enterprise customers receive priority 24/7 support, while other tiers receive email support during business hours.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-2xl font-bold text-on-surface mb-4">8. Data and Privacy</h2>
            <p>
              Our collection and use of your information is governed by our Privacy Policy. We implement industry-standard security measures to protect your data, but we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-2xl font-bold text-on-surface mb-4">9. Third-Party Services</h2>
            <p>
              Our platform integrates with third-party services (e.g., Mikrotik, payment gateways, SMS providers). Your use of these services is subject to their respective terms and conditions. We are not responsible for third-party services.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-2xl font-bold text-on-surface mb-4">10. Termination</h2>
            <h3 className="font-semibold text-on-surface mt-4 mb-2">10.1 By You</h3>
            <p className="mb-4">
              You may cancel your subscription at any time through your account settings. Cancellation will take effect at the end of your current billing period.
            </p>
            <h3 className="font-semibold text-on-surface mt-4 mb-2">10.2 By Us</h3>
            <p className="mb-4">
              We may suspend or terminate your access to our services if you violate these Terms or engage in fraudulent or illegal activities.
            </p>
            <h3 className="font-semibold text-on-surface mt-4 mb-2">10.3 Effect of Termination</h3>
            <p>
              Upon termination, your right to use the services will cease immediately. We will retain your data for 30 days after termination, after which it will be permanently deleted.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-2xl font-bold text-on-surface mb-4">11. Disclaimers and Limitations of Liability</h2>
            <h3 className="font-semibold text-on-surface mt-4 mb-2">11.1 Disclaimers</h3>
            <p className="mb-4">
              OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
            </p>
            <h3 className="font-semibold text-on-surface mt-4 mb-2">11.2 Limitation of Liability</h3>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, ULTIMATE ISP SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF OUR SERVICES.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-2xl font-bold text-on-surface mb-4">12. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Ultimate ISP from any claims, damages, losses, and expenses arising from your use of our services or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-2xl font-bold text-on-surface mb-4">13. Governing Law and Dispute Resolution</h2>
            <p className="mb-4">
              These Terms are governed by the laws of Bangladesh. Any disputes shall be resolved through arbitration in Narayanganj, Bangladesh.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-2xl font-bold text-on-surface mb-4">14. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. We will notify you of material changes via email or through our platform. Your continued use of our services after such changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="font-grotesk text-2xl font-bold text-on-surface mb-4">15. Contact Information</h2>
            <p className="mb-4">
              For questions about these Terms, please contact us:
            </p>
            <div className="bg-surface-container-high border border-border-muted rounded-lg p-6">
              <p className="mb-2"><strong>Email:</strong> legal@ultimateisp.com</p>
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
