import wixData from 'wix-data';
import { sendSms } from 'backend/twilio.jsw';
import { sendFollowUpSms } from 'backend/followup.jsw';

$w.onReady(function () {
    checkForLeadsStatus();
});

async function checkForLeadsStatus() {
    console.log('Checking all leads for their status...');

    try {
        // Query all leads in the database
        const leads = await wixData.query('Leads')
            .find();

        // Check if there are any leads
        if (leads.items.length > 0) {
            console.log(`Found ${leads.items.length} leads. Printing their status:`);
            
            // Iterate through each lead and print their status
            for (const lead of leads.items) {
                console.log(`Lead Title: ${lead.title}, Status: ${lead.status}`);
            }
        } else {
            console.log('No leads found in the database.');
        }
    } catch (error) {
        console.error('Error in checkForLeadsStatus:', error);
    }
}

$w.onReady(function () {

    populateCountryCodes();

    $w("#sendSmsButton").onClick((event) => {
        sendMessage();
    });

    // testLeadsExistence().then(() => {
    //     console.log('Test complete, check the logs for results.');
    // }).catch((error) => {
    //     console.error('Error running testLeadsExistence:', error);
    // });
});

async function populateCountryCodes() {
    try {
        const queryResults = await wixData.query('CountriesCode').limit(1000).find();
        if (queryResults && queryResults.items.length > 0) {
            const items = queryResults.items;
            const options = items.map(item => {
                return {
                    'label': item.dial,
                    'value': item.dial,
                }
            });
            $w('#countryCodeDropdown').options = options;
        }
    } catch (err) {
        console.error('home -> initPage error ', err.message);
    }
}

async function sendMessage() {
    $w('#smsMessageText').hide();
    try {
        if ($w('#nameInput,#emailInput,#phoneInput,#messageInput').valid) {
            const name = $w('#nameInput').value;
            const email = $w('#emailInput').value;
            const phone = $w('#phoneInput').value;
            const countryCode = $w('#countryCodeDropdown').value;
            const fullPhoneNumber = `+${countryCode}${phone}`;

            // Save to collection with the correct field names
            await wixData.insert('Leads', {
                title: name,
                email: email,
                number: fullPhoneNumber,
                status : "new",
            });

            // Send SMS to the client
            const clientSmsMessage = `You have a new lead:\nName: ${name}\nEmail: ${email}\nPhone: ${fullPhoneNumber}`;
            await sendSms("Client", "client@example.com", 'Client's Number', clientSmsMessage);

            // Send SMS to the lead
            const leadSmsMessage = `Thank you for your interest, ${name}. We will get back to you shortly.`;
            const sendSmsResults = await sendSms(name, email, fullPhoneNumber, leadSmsMessage);

            if (sendSmsResults) {
                $w('#smsMessageText').text = 'Thank you for your submission. We will contact you soon.';
            } else {
                $w('#smsMessageText').text = 'Something went wrong. Please try again.';
            }
        } else {
            $w('#nameInput,#emailInput,#phoneInput,#messageInput').updateValidityIndication();
            $w('#smsMessageText').text = 'Please enter valid information for all fields';
        }
    } catch (err) {
        console.error('home -> sendMessage error ', err.message);
        $w('#smsMessageText').text = 'Something went wrong. Please try again.';
    }
    $w('#smsMessageText').show();
}

export async function testLeadsExistence() {
    console.log(`testLeadsExistence triggered at ${new Date().toISOString()}`);

    const today = new Date();
    const oneDayAgo = new Date(today);
    oneDayAgo.setDate(oneDayAgo.getDate() - 1); // Check for leads created in the last 24 hours

    try {
        const leads = await wixData.query('Leads')
            .between('_createdDate', oneDayAgo, today)
            .find();

        if (leads.items.length > 0) {
            console.log(`Test Passed: Found ${leads.items.length} leads created in the last 24 hours.`);
            leads.items.forEach(lead => {
                console.log(`Lead found:`, lead); 
                console.log(`Fields in this lead:`, Object.keys(lead)); // Log the field names in the lead
            });
        } else {
            console.log('Test Failed: No leads found for the last 24 hours.');
        }
    } catch (error) {
        console.error('Error in testLeadsExistence:', error);

    }

    const leads = await wixData.query('Leads')
        .limit(10) // Just to see some data
        .find();
    console.log(`Query result for all leads: ${JSON.stringify(leads)}`);

}

$w.onReady(function () {
    // Make sure your button has an ID, for example: #followUpButton
    $w('#followUpButton').onClick(async () => {
        try {
            console.log('Button clicked, calling sendFollowUpSms...');
            await sendFollowUpSms();
            console.log('sendFollowUpSms completed.');
        } catch (error) {
            console.error('Error calling sendFollowUpSms:', error);
        }
    });
});
