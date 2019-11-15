const ipc = require('node-ipc');

if (process.env.OMPI_COMM_WORLD_SIZE === undefined) {
    const { spawn } = require('child_process');

    ipc.config.id = 'master';
    ipc.config.retry = 1500;
    ipc.config.silent = true;

    let totalMessages;
    let receivedMessages = [];

    ipc.serve(
        function () {
            ipc.server.on(
                'message',
                function (data, socket) {
                    console.log(data);
                    receivedMessages.push(data);

                    ipc.server.emit(
                        socket,
                        'end'
                    );

                    if (receivedMessages.length === 4) {
                        let sum = 
                        receivedMessages[0].result
                        + receivedMessages[1].result
                        + receivedMessages[2].result
                        + receivedMessages[3].result;
                        console.log('The sum of results is ', sum)

                        ipc.server.stop();
                    }
                }
            );
        }
    );

    ipc.server.start();

    const mpiexec = spawn('mpiexec', ['--display-map', '--bind-to', 'core', 'node', 'calculate-wrapped.js', process.argv[2]]);

    mpiexec.stdout.on('data', (data) => {
        console.error(`stdout: ${data}`);
    });

    mpiexec.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    mpiexec.on('close', (code) => {
        console.log(`mpiexec exited with code ${code}`);
    });

} else {
    const input = Number(process.argv[2]);
    let result;

    if (process.env.OMPI_COMM_WORLD_RANK === '0') {

        result = Math.pow(input, 2);

    } else if (process.env.OMPI_COMM_WORLD_RANK === '1') {

        result = Math.pow(input, 3);

    } else if (process.env.OMPI_COMM_WORLD_RANK === '2') {

        result = Math.pow(input, 4);

    } else if (process.env.OMPI_COMM_WORLD_RANK === '3') {

        result = Math.pow(input, 5);

    }

    ipc.config.silent = true;

    ipc.connectTo(
        'master',
        function () {
            ipc.of.master.emit('message', { 
                core: process.env.OMPI_COMM_WORLD_RANK,
                result: result 
            });

            ipc.of.master.on('end', function () {
                ipc.disconnect('master');
                process.exit();
            });
        }
    );
}

