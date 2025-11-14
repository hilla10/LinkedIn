import { client, sender } from '../lib/mailtrap.js';
import {
  createCommentNotificationEmailTemplate,
  createConnectionAcceptedEmailTemplate,
  createWelcomeEmailTemplate,
} from './emailTemplates.js';

export const sendWelcomeEmail = async (email, name, profileUrl) => {
  const recipient = [{ email }];

  try {
    const response = await client.send({
      from: sender,
      to: recipient,
      subject: 'Welcome to UnLinked!',
      html: createWelcomeEmailTemplate(name, profileUrl),
      category: 'welcome',
    });

    console.log('Welcome email sent successfully.', response);
  } catch (error) {
    throw new Error(error);
  }
};

export const sendCommentNotificationEmail = async (
  recipientEmail,
  recipientName,
  commenterName,
  postUrl,
  commentContent
) => {
  const recipient = [{ email: recipientEmail }];

  try {
    const response = await client.send({
      from: sender,
      to: recipient,
      subject: 'New Comment on Your Post',
      html: createCommentNotificationEmailTemplate(
        recipientName,
        commenterName,
        postUrl,
        commentContent
      ),
      category: 'comment_notification',
    });

    console.log('comment notification email sent successfully.', response);
  } catch (error) {
    throw new Error(error);
  }
};

export const sendConnectionAcceptedEmail = async (
  senderEmail,
  senderName,
  recipientName,
  profileUrl
) => {
  try {
    const recipient = [{ email: recipientEmail }];

    const response = await client.send({
      from: sender,
      to: recipient,
      subject: `${recipientName} accepted your connection request`,
      html: createConnectionAcceptedEmailTemplate(
        senderName,
        recipientName,
        profileUrl
      ),
      category: 'connection_accepted',
    });

    console.log('connection accepted email sent successfully.', response);
  } catch (error) {
    throw new Error(error);
  }
};
