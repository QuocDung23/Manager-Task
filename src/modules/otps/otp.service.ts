import { otps } from "@/models";
import { OtpRepository } from "./otp.repository";
import { Exception } from "@tsed/exceptions";
import { StatusCodes } from "http-status-codes";
import { OptionalException } from "@/common";
import { otpsConfig } from "@/configs/opts.config";

export class OtpService {
    constructor(
        private readonly otpRepository = new OtpRepository(),
    ) {}

    async generateOtp({userId}: {userId: string}): Promise<otps | Exception> {
        const otpExists = await this.otpRepository.findOtp({userId})
        if(otpExists && otpExists.expiresAt > new Date()) {
            throw new OptionalException(StatusCodes.CONFLICT, `the otp will be reissuded after ${Math.ceil((otpExists.expiresAt.getTime() - new Date().getTime()) /1000)} seconds`)
        }
        const otp = Math.floor(100000 + Math.random() * 999999).toString()
        const otpExpiresAt = new Date(Date.now() + otpsConfig.optExpires * 60 * 1000)

        if(otpExists) {
            const otpData = await this.otpRepository.updateOtp({
                otpId: otpExists.id,
                otp: {
                    otp: otp,
                    expiresAt: otpExpiresAt
                }
            })
            return otpData
        }

        const otpData = await this.otpRepository.createOtp({
            otp: {
                otp: otp,
                expiresAt: otpExpiresAt,
                user: {
                    connect: {id: userId}
                }
            },
        })
        return otpData
    }
}