export const emailService = {
  /**
   * Simulates sending a certificate email to the participant.
   * Keeps the recipient's email completely private from the certificate output.
   */
  async sendCertificateEmail(
    email: string,
    participantName: string,
    eventName: string,
    certificateDataUrl?: string
  ): Promise<{ success: boolean; error?: string }> {
    console.log(`[EmailService] Initiating certificate delivery...`);
    console.log(`[EmailService] Recipient: ${participantName} <${email}>`);
    console.log(`[EmailService] Event: ${eventName}`);
    
    if (certificateDataUrl) {
      console.log(`[EmailService] Attachment: Certificate Image/PDF (Data URL length: ${certificateDataUrl.length})`);
    } else {
      console.log(`[EmailService] Attachment: Default Template Certificate`);
    }

    // Simulate delivery latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    console.log(`[EmailService] Certificate successfully delivered to ${email}`);
    return { success: true };
  }
}
