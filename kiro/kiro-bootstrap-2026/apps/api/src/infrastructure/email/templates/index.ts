import { readFileSync } from 'fs';
import { join } from 'path';
import { renderTemplate } from './render';

const TEMPLATES_DIR = __dirname;

function loadTemplate(filename: string): string {
  return readFileSync(join(TEMPLATES_DIR, filename), 'utf-8');
}

export const emailTemplates = {
  welcome(variables: { firstName: string; loginUrl: string }): string {
    return renderTemplate(loadTemplate('welcome.html'), variables);
  },

  invitation(variables: { activationUrl: string }): string {
    return renderTemplate(loadTemplate('invitation.html'), variables);
  },

  passwordReset(variables: { resetUrl: string }): string {
    return renderTemplate(loadTemplate('password-reset.html'), variables);
  },

  sermonNotification(variables: {
    sermonTitle: string;
    sermonExcerpt: string;
    sermonLink: string;
  }): string {
    return renderTemplate(loadTemplate('sermon-notification.html'), variables);
  },
};
