import { HttpException, HttpStatus } from '@nestjs/common';
export declare class BusinessException extends HttpException {
    constructor(message: string, code: string, status?: HttpStatus);
}
//# sourceMappingURL=business.exception.d.ts.map