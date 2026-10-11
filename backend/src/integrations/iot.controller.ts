import { Controller, Post, Body } from '@nestjs/common';

@Controller('iot/keycard')
export class IotController {
  @Post('encode')
  encodeKeycard(@Body('reservationId') reservationId: string) {
    // Simulate generating a base64 NFC token for Assa Abloy/VingCard
    const tokenPayload = `RES:${reservationId}:${Date.now()}`;
    const tokenBase64 = Buffer.from(tokenPayload).toString('base64');
    
    return {
      message: 'Keycard encoded successfully',
      reservationId,
      provider: 'Assa Abloy/VingCard',
      nfcToken: tokenBase64
    };
  }
}
