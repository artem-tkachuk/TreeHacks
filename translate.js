/*

curl -X POST "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=en&to=zh-Hans" -H "Ocp-Apim-Subscription-Key: 1044bfde8ae24b9284645cd164d7317b" -H "Content-Type: application/json; charset=UTF-8" -d "[{'Text':'Hello, what is your name?'}]"
?api-version=3.0&from=en&to=zh-Hans" -H "Ocp-Apim-Subscription-Key: 1044bfde8ae24b9284645cd164d7317b" -H "Content-Type: application/json; charset=UTF-8" -d "[{'Text':'Hello, what is your name?'}]"
*/

const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const rp = require('request-promise');

/**
 * Per the request limits for Microsoft Translator Text:
 * https://docs.microsoft.com/en-us/azure/cognitive-services/translator/request-limits
 * @param {string} html 
 * @param {number} maxCharPerElement
 * @return {string[]} - each array element <= 5,000 char,
 * array length <= 100
 */
function formatHTMLForMicrosoftAPI(html, maxCharPerElement) {
    let arr = [];
    let i = 0;
    // arr.push(html.substr(i, maxCharPerElement));
    while (i < html.length) {
        // console.log(i);
        const elem = html.substr(i, maxCharPerElement);
        // console.log(elem);
        
        arr.push({'text': elem});
        i += maxCharPerElement;
    }
    return arr;
}

/**
 * 
 * @param {string} str 
 * @param {string} to 
 * @param {string} from 
 */
async function translateString(str, to, from) {
    var options = {
        method: 'POST',
        uri: `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${from}&to=${to}&textType=html`,
        headers: {
            'Ocp-Apim-Subscription-Key': '1044bfde8ae24b9284645cd164d7317b'
        },
        body: [{'Text': str}],
        json: true
    };
    try {
        const response = await rp(options);
        return 0
    } catch(e) {
        console.log("Error retrieving response from Microsoft Translation API");
        return '';
    }
}

/**
 *
 */


// getTranslatedWebPage('zh-Hans', 'en');



app.get('/', async function getTranslatedWebPage(req, res) {
    const to = 'es';
    const from = 'en';
    let html = fs.readFileSync(
        './test-data/scholarshare-investment.html',
        { 'encoding': 'utf-8'}
    );
    
    // html = formatHTMLForMicrosoftAPI(html, 5000);
    console.log('length of html', html.length);
    
    let translatedString = '';

    let promises = [];
    try {
        let i = 0;
        while (i < html.length) {
            const str = html.substr(i, 5000);
            var options = {
                method: 'POST',
                uri: `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${from}&to=${to}&textType=html`,
                headers: {
                    'Ocp-Apim-Subscription-Key': '1044bfde8ae24b9284645cd164d7317b'
                },
                body: [{'Text': str}],
                json: true
            };
            const promise = rp(options);
            // console.log(promise);
            promises.push(promise);
            
            // console.log(chunk[0]['translations'][0]['text']);
            
            // translatedString += chunk[0]['translations'][0]['text'];
            
            i += 5000;
        }
        
        Promise.all(promises).then(values => {
            for (value of values) {
                translatedString += value[0]['translations'][0]['text'];
            }
            console.log('FULL STRING', translatedString.length);
            fs.writeFileSync('./test-data/output.html', translatedString);
        })
        .catch((e) => {
            console.log(`Promise error: ${e}`);
            
        })
        // console.log(JSON.stringify(obj));
    } catch(e) {
        console.log(`ERROR: ${e}`);
    }
    // console.log('REACHED HERE', translatedString.length);
    
})

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }

  console.log(`server is listening on ${port}`)
})