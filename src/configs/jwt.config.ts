import { SignOptions } from "jsonwebtoken"

const checkJwt = (value: string | undefined, defaultValue: string, errorMessage: string) => {
    if(typeof value === 'string' && value.length > 0) {
        return value
    }
    if(process.env.NODE_ENV === 'production') {
        throw new Error(errorMessage)
    }
    return defaultValue
}

export const jwtConfig = {
	expiresInAccessToken: checkJwt(
		process.env.EXPIRES_IN_ACCESS_TOKEN,
		'7d',
		'EXPIRES_IN_ACCESS_TOKEN must be set in production',
	) as SignOptions['expiresIn'],
	secretAccessToken: checkJwt(
		process.env.JWT_SECRET_ACCESS_TOKEN,
		'dev-secret-access',
		'JWT_SECRET_ACCESS_TOKEN must be set in production',
	) as SignOptions['expiresIn'],
	expiresInRefreshToken: checkJwt(
		process.env.EXPIRES_IN_REFRESH_TOKEN,
		'365d',
		'EXPIRES_IN_REFRESH_TOKEN must be set in production',
	) as SignOptions['expiresIn'],
	secretRefreshToken: checkJwt(
		process.env.JWT_SECRET_REFRESH_TOKEN,
		'dev-secret-refresh',
		'JWT_SECRET_REFRESH_TOKEN must be set in production',
	) as SignOptions['expiresIn'],
}