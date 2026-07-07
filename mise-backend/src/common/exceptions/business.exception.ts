import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(
    code: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    detail?: string,
  ) {
    super({ code, detail }, status);
  }
}
