import { otps } from "@/models";
import { OtpRepository } from "./otp.repository";
import { Exception } from "@tsed/exceptions";
import { StatusCodes } from "http-status-codes";
import { OptionalException } from "@/common";
import { otpsConfig } from "@/configs/opts.config";

export class OtpService {
  constructor(private readonly otpRepository = new OtpRepository()) {}

  async generateOtp({ userId }: { userId: string }): Promise<otps | Exception> {
    const otpExists = await this.otpRepository.findOtp({ userId });
    if (otpExists && otpExists.expiresAt > new Date()) {
      throw new OptionalException(
        StatusCodes.CONFLICT,
        `the otp will be reissuded after ${Math.ceil((otpExists.expiresAt.getTime() - new Date().getTime()) / 1000)} seconds`,
      );
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(
      Date.now() + otpsConfig.optExpires * 60 * 1000,
    );

    if (otpExists) {
      const otpData = await this.otpRepository.updateOtp({
        otpId: otpExists.id,
        otp: {
          otp: otp,
          expiresAt: otpExpiresAt,
        },
      });
      return otpData;
    }

    const otpData = await this.otpRepository.createOtp({
      otp: {
        otp: otp,
        expiresAt: otpExpiresAt,
        user: {
          connect: { id: userId },
        },
      },
    });
    return otpData;
  }

  async verifyOtp({
    otp,
    userId,
    deleteOtpAfterVerify
  }: {
    otp: string;
    userId: string;
    deleteOtpAfterVerify?: boolean;
  }): Promise<boolean | Exception> {
    const otpRecord = await this.otpRepository.findOtp({
      otp: otp,
      userId: userId,
    });
    if (!otpRecord) {
      return false;
    }

    if (otpRecord.expiresAt < new Date()) {
      await this.otpRepository.deleteOtp({ otpId: otpRecord.id });
      throw new OptionalException(StatusCodes.UNAUTHORIZED, "Otp expired");
    }
    const shouldDeleteOtp = deleteOtpAfterVerify ?? true
    if(shouldDeleteOtp) {
      await this.otpRepository.deleteOtp({ otpId: otpRecord.id });
    }

    return true;
  }
}
