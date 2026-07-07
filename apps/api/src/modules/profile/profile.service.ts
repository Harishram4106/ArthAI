import { prisma } from '../../server';

export class ProfileService {
  async getProfile(userId: string) {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!profile) {
      return this.getDefaultProfile(userId);
    }

    return {
      app_user_id: profile.userId,
      full_name: profile.name,
      email: profile.user?.email || '',
      phone: profile.phone || '',
      date_of_birth: profile.dateOfBirth || '',
      city: profile.city || '',
      country: profile.country || '',
      occupation: profile.occupation || '',
      monthly_income_range: profile.incomeRange || '',
      investment_experience: profile.experience || '',
      preferred_currency: profile.currency || 'INR',
      preferred_language: profile.language || 'en',
      onboarding_completed: true,
    };
  }

  async updateProfile(userId: string, updates: any) {
    const name = updates.full_name || updates.name;
    const phone = updates.phone;
    const dateOfBirth = updates.date_of_birth || updates.dateOfBirth;
    const city = updates.city;
    const country = updates.country;
    const occupation = updates.occupation;
    const incomeRange = updates.monthly_income_range || updates.incomeRange;
    const experience = updates.investment_experience || updates.experience;
    const currency = updates.preferred_currency || updates.currency;
    const language = updates.preferred_language || updates.language;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (dateOfBirth !== undefined) data.dateOfBirth = dateOfBirth;
    if (city !== undefined) data.city = city;
    if (country !== undefined) data.country = country;
    if (occupation !== undefined) data.occupation = occupation;
    if (incomeRange !== undefined) data.incomeRange = incomeRange;
    if (experience !== undefined) data.experience = experience;
    if (currency !== undefined) data.currency = currency;
    if (language !== undefined) data.language = language;

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        name: name || '',
        age: 30,
        city: city || '',
        occupation: occupation || '',
        language: language || 'en',
        ...data
      },
      include: { user: true }
    });

    return {
      app_user_id: profile.userId,
      full_name: profile.name,
      email: profile.user?.email || '',
      phone: profile.phone || '',
      date_of_birth: profile.dateOfBirth || '',
      city: profile.city || '',
      country: profile.country || '',
      occupation: profile.occupation || '',
      monthly_income_range: profile.incomeRange || '',
      investment_experience: profile.experience || '',
      preferred_currency: profile.currency || 'INR',
      preferred_language: profile.language || 'en',
      onboarding_completed: true,
    };
  }

  async getSettings(userId: string) {
    const profile = await prisma.userProfile.findUnique({
      where: { userId }
    });

    if (!profile || !profile.settings) {
      return this.getDefaultSettings(userId);
    }

    try {
      return JSON.parse(profile.settings);
    } catch {
      return this.getDefaultSettings(userId);
    }
  }

  async updateSettings(userId: string, updates: any) {
    const currentSettings = await this.getSettings(userId);
    const newSettings = { ...currentSettings, ...updates };

    await prisma.userProfile.upsert({
      where: { userId },
      update: {
        settings: JSON.stringify(newSettings)
      },
      create: {
        userId,
        name: '',
        age: 30,
        city: '',
        occupation: '',
        language: updates.language_preference || 'en',
        settings: JSON.stringify(newSettings)
      }
    });

    return newSettings;
  }

  private getDefaultProfile(userId: string) {
    return {
      app_user_id: userId,
      full_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      city: '',
      country: '',
      occupation: '',
      monthly_income_range: '',
      investment_experience: '',
      preferred_currency: 'INR',
      preferred_language: 'en',
      onboarding_completed: false,
    };
  }

  private getDefaultSettings(userId: string) {
    return {
      app_user_id: userId,
      theme_preference: 'system',
      email_notifications: true,
      push_notifications: true,
      risk_review_reminders: true,
      show_planning_assumptions: true,
      advisor_contact_preference: 'in-app',
      report_export_format: 'markdown',
      language_preference: 'en',
      privacy_mode: false,
    };
  }
}
