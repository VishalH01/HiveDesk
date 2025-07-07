// Simple OTP service for demo purposes
// In a real application, this would integrate with your backend API

interface OTPData {
  email: string;
  otp: string;
  expiresAt: number;
}

class OTPService {
  private otpStorage: Map<string, OTPData> = new Map();

  // Generate a 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP to email (simulated)
  async sendOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const otp = this.generateOTP();
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiry
      
      // Store OTP data
      this.otpStorage.set(email, {
        email,
        otp,
        expiresAt
      });

      // In a real app, you would send this OTP via email service
      console.log(`OTP for ${email}: ${otp}`);
      
      return {
        success: true,
        message: `OTP sent to ${email}`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send OTP'
      };
    }
  }

  // Verify OTP
  async verifyOTP(email: string, otp: string): Promise<{ success: boolean; message: string }> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const otpData = this.otpStorage.get(email);
      
      if (!otpData) {
        return {
          success: false,
          message: 'No OTP found for this email'
        };
      }

      if (Date.now() > otpData.expiresAt) {
        this.otpStorage.delete(email);
        return {
          success: false,
          message: 'OTP has expired'
        };
      }

      if (otpData.otp !== otp) {
        return {
          success: false,
          message: 'Invalid OTP'
        };
      }

      // Remove OTP after successful verification
      this.otpStorage.delete(email);
      
      return {
        success: true,
        message: 'OTP verified successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to verify OTP'
      };
    }
  }

  // Check if OTP was sent for an email
  hasOTP(email: string): boolean {
    const otpData = this.otpStorage.get(email);
    return otpData !== undefined && Date.now() <= otpData.expiresAt;
  }
}

export const otpService = new OTPService(); 