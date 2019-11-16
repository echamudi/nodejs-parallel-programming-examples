startTime = new Date();

const fs = require("fs");

function permute(input) {
    if (input.length == 1) return [input];

    let letters = input.split('');

    let splicedStrings = [];

    for(let i = 0; i < letters.length; i++) {
        let subLetters = letters.slice(0);
        subLetters.splice(i, 1);

        splicedStrings.push(subLetters.join(''));
    }

    let result = [];

    for(let i = 0; i < splicedStrings.length; i++) {
        let possibleOrdersSub = permute(splicedStrings[i]);

        for (let j = 0; j < possibleOrdersSub.length; j++) {
            result.push(input[i] + possibleOrdersSub[j]);
        }
    }

    return result;
}

if(process.argv[2].length > 11) {
    console.log("Input is too long...");
    process.exit(1);
};

let result = permute(process.argv[2]);
console.log(result);
console.log('Completed calculation, timestamp:', new Date() - startTime);
// fs.writeFileSync('./temp/permute-seq-result.json', JSON.stringify(result, null, 1));
