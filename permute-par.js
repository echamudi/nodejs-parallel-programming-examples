const startTime = new Date();

const ipc = require('node-ipc');

if (process.env.OMPI_COMM_WORLD_SIZE === undefined) {
    const { spawn } = require('child_process');

    const numOfCores = Number(process.argv[2]);
    const input = process.argv[3];
    
    if(input.length > 11) {
        console.log("Input is too long...");
        process.exit(1);
    };

    const letters = input.split('');
    let subStrings = [];

    for(let i = 0; i < letters.length; i++) {
        let subLetters = letters.slice(0);
        subLetters.splice(i, 1);
        subStrings.push(subLetters.join(''));
    }

    console.log('Input:', input);
    console.log('We will permute the substrings...');
    console.log('The substrings:', subStrings);
    
    subStrings = subStrings.reverse();
    const cakes = [];

    for (let i = 0; i < numOfCores; i++) {
        cakes.push({});
    }

    let i = 0; // index of cake
    let j = 0; // index of subString
    while (subStrings.length !== 0) {
        cakes[i][j] = subStrings.pop();

        i++;
        if (i >= numOfCores) i = 0;
        j++;
    }

    console.log('Cakes:', cakes);

    ipc.config.id = 'master';
    ipc.config.silent = true;

    let receivalCount = 0;
    let combinedResults = [];

    ipc.serve(
        function () {
            ipc.server.on(
                'ready',
                function (coreId, socket) {
                    ipc.server.emit(
                        socket,
                        'input-data',
                        {
                            input: input,
                            cake: cakes[coreId]
                        }
                    );
                }
            );

            ipc.server.on(
                'completed-subpermutation',
                function (data, socket) {
                    receivalCount++;

                    ipc.server.emit(socket, 'end');

                    if(receivalCount === numOfCores) {
                        console.log('Master detects all cores are done with their jobs!');

                        for(let i = 0; i < letters.length; i++) {
                            let sub = require('./temp/permute-par-sub-' + i + '.json');

                            for(let j = 0; j < sub.length; j++) {
                                combinedResults.push(sub[j]);
                            }
                        }

                        console.log('Final Result:', combinedResults);
                        console.log('Completed calculation, timestamp:', new Date() - startTime);

                        process.exit();
                    }
                } 
            )
        }
    );

    ipc.server.start();

    const mpiexec = spawn('mpiexec', ['--display-map', '-n', numOfCores, 'node', '--max-old-space-size=8192', 'permute-par.js']);

    mpiexec.stdout.on('data', (data) => {
        console.log(data.toString());
    });

    mpiexec.stderr.on('data', (data) => {
        console.error(data.toString());
    });

    mpiexec.on('close', (code) => {
        console.log(`mpiexec exited with code ${code}`);
    });

} else {
    const fs = require('fs');
    const coreId = process.env.OMPI_COMM_WORLD_RANK;

    ipc.config.silent = true;

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
    
    ipc.connectTo(
        'master',
        function () {
            ipc.of.master.emit('ready', coreId);

            ipc.of.master.on('input-data', function (data) {
                const input = data.input;
                const cake = data.cake;

                for (const [key, value] of Object.entries(cake)) {
                    console.log('Core', coreId, 'is permuting', value);
                    let headLetter = input[key];
                    let result = permute(value);

                    for (let i = 0; i < result.length; i++) {
                        result[i] = headLetter + result[i]; 
                    }

                    fs.writeFileSync('./temp/permute-par-sub-' + key + '.json', JSON.stringify(result));
                }

                console.log('Core', coreId, 'completed all permutations!');

                ipc.of.master.emit('completed-subpermutation', coreId);
            });

            ipc.of.master.on('end', function() {
                process.exit(0);
            });
        }
    );
}

