const fs = require('fs');
const pdf = require('pdf-parse');

async function extractPdf() {
    try {
        let dataBuffer = fs.readFileSync('ebook-vip.pdf.pdf');
        console.log("Reading PDF...");
        const parse = pdf.default || pdf;
        const data = await parse(dataBuffer);

        console.log("Pages:", data.numpages);
        console.log("Writing extracted text to extracted-text.txt...");
        fs.writeFileSync('extracted-text.txt', data.text);
        console.log("Extraction successful.");
    } catch (error) {
        console.error("Error extracting PDF:", error);
    }
}

extractPdf();
