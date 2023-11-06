const jsonData = require("./allproducts_premiumbel.json");
const fs = require("fs")

function correctDateFormat(dateString) {
    const [year, month, day] = dateString.split('-').map(part => part.padStart(2, '0'));
    return `${year}-${month}-${day}`;
  }
  
  // Loop through the JSON object and update date formats
  jsonData.forEach(item => {
    for (const key in item) {
      if (item.hasOwnProperty(key) && typeof item[key] === 'string' && /^\d{4}-\d{1,2}-\d{1,2}$/.test(item[key])) {
        item[key] = correctDateFormat(item[key]);
      }
    }
  });
  
  // Convert the updated JSON object back to JSON format
  const updatedJson = JSON.stringify(jsonData, null, 2);

  fs.writeFile('updatedData.json', updatedJson, 'utf8', (writeErr) => {
    if (writeErr) {
      console.error('Error writing JSON file:', writeErr);
      return;
    }
    console.log('Date format corrected and saved in updatedData.json');
  });
  
  console.log(updatedJson); 