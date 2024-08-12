import { fetch } from 'wix-fetch';
const accountSid = ' ';
const authToken = ' ';
const twilioNumber = ' ';

const client = require('twilio')(accountSid, authToken);

export async function sendSms(name, email, phone, message) {
    try {
        const smsTo = phone; // Use the full phone number with country code
        const smsMessage = message || `Name: ${name}\nEmail: ${email}\nPhone: ${phone}`;
        
        const validNumber = validateNumber(smsTo);
        if (!validNumber) {
            return false;
        }
        
        let sendResults = await client.messages
            .create({ body: smsMessage, from: twilioNumber, to: smsTo });

        if (sendResults.sid) {
            return true;
        }
        return false;
    } catch (err) {
        console.error('twilio.jsw -> sendSms error', err.message);
        return false;
    }
}

function validateNumber(number) {
    const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/g;
    return phoneRegex.test(number) ? number : false;
}
