import z from "zod"

export class PaginationDto {
	page: number
	limit: number

	constructor(data: Partial<PaginationDto>) {
		this.page = Number( data?.page ?? 1)
		this.limit = Number( data?.limit ?? 10)
	}
}

export const paginationSchema = {
	page: z.coerce.number().int().positive().optional().default(1),
	limit: z.coerce.number().int().positive().optional().default(10)
}