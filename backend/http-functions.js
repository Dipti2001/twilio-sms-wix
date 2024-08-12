import { ok, badRequest } from 'wix-http-functions';
import { handleIncomingSms } from 'backend/followup.jsw';

export function post_webhook(request) {
    return request.body.text()
        .then(body => {
            console.log("Raw webhook body received:", body);
            
            
            const params = new URLSearchParams(body);
            const jsonBody = Object.fromEntries(params.entries());
            console.log("Parsed webhook body:", jsonBody); 
            
            
            console.log("Message SID:", jsonBody.MessageSid);
            console.log("From:", jsonBody.From);
            console.log("To:", jsonBody.To);
            console.log("Body:", jsonBody.Body);
            
            
            return handleIncomingSms({ body: jsonBody });
        })
        .then(() => {
            return ok({
                headers: { "Content-Type": "application/json" },
                body: { message: "Webhook received and processed successfully" }
            });
        })
        .catch(error => {
            console.error("Webhook processing error:", error);
            return badRequest({
                headers: { "Content-Type": "application/json" },
                body: { message: "There was an error processing the webhook", error: error.message }
            });
        });
}
