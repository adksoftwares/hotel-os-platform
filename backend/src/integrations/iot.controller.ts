import { Controller, Post, NotImplementedException } from '@nestjs/common';

@Controller('iot/keycard')
export class IotController {
  @Post('encode')
  encodeKeycard(): never {
    // Base64 is encoding, not encryption or a provider-issued access credential.
    // Fail closed until a real keycard vendor adapter is configured.
    throw new NotImplementedException(
      'Keycard encoding is unavailable until a supported provider is configured. No key was issued.'
    );
  }
}
