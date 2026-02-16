import { otps, Prisma } from "@prisma/client";
import { PrismaService } from "../data";

export class OtpRepository {
  constructor(private readonly prismaService = new PrismaService()) {}

  async findOtp({
    userId,
    email,
    otp,
  }: {
    userId: string;
    email?: string;
    otp?: string;
  }): Promise<otps | null> {
    return this.prismaService.otps.findFirst({
      where: {
        user: {
          id: userId,
          email: email,
        },
        otp: otp,
      },
    });
  }

  async createOtp({ otp }: { otp: Prisma.otpsCreateInput }): Promise<otps> {
    return this.prismaService.otps.create({
      data: otp,
    });
  }

  async updateOtp({
    otpId,
    otp,
  }: {
    otpId: string;
    otp: Prisma.otpsUpdateInput;
  }): Promise<otps> {
    return this.prismaService.otps.update({
      where: {
        id: otpId,
      },
      data: {
        otp: otp.otp,
        expiresAt: otp.expiresAt,
      },
    });
  }

  async deleteOtp(otpId: string): Promise<otps> {
    return this.prismaService.otps.delete({
      where: { id: otpId },
    });
  }
}
