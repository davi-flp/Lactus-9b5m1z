// PIN service for private notes authentication
import { StorageService } from './storage';
import { STORAGE_KEYS } from '../constants/config';

export const PinService = {
  async hasPIN(): Promise<boolean> {
    const pin = await StorageService.get<string>(STORAGE_KEYS.PRIVATE_PIN);
    return !!pin;
  },

  async setPIN(pin: string): Promise<void> {
    await StorageService.set(STORAGE_KEYS.PRIVATE_PIN, pin);
  },

  async verifyPIN(pin: string): Promise<boolean> {
    const stored = await StorageService.get<string>(STORAGE_KEYS.PRIVATE_PIN);
    return stored === pin;
  },

  async clearPIN(): Promise<void> {
    await StorageService.remove(STORAGE_KEYS.PRIVATE_PIN);
  },
};
