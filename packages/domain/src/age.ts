import { productPolicy } from "./product-policy";

export const MINIMUM_ACCOUNT_AGE = productPolicy.minimumAccountAge;
export const ALCOHOL_LEGAL_AGE = 18;

export function getAgeAt(dateOfBirth: Date, at: Date): number {
  let age = at.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const birthdayHasPassed =
    at.getUTCMonth() > dateOfBirth.getUTCMonth() ||
    (at.getUTCMonth() === dateOfBirth.getUTCMonth() &&
      at.getUTCDate() >= dateOfBirth.getUTCDate());

  if (!birthdayHasPassed) {
    age -= 1;
  }

  return age;
}

export function canReceiveAlcoholRecipes(
  dateOfBirth: Date,
  at: Date = new Date(),
): boolean {
  return getAgeAt(dateOfBirth, at) >= ALCOHOL_LEGAL_AGE;
}

export function canCreateAccount(
  dateOfBirth: Date,
  at: Date = new Date(),
): boolean {
  return getAgeAt(dateOfBirth, at) >= MINIMUM_ACCOUNT_AGE;
}
