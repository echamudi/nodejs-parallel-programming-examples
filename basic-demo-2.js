if (process.env.OMPI_COMM_WORLD_RANK === '0') {
    console.log('Core 0: Alice');
} else if (process.env.OMPI_COMM_WORLD_RANK === '1') {
    console.log('Core 1: Bob');
} else if (process.env.OMPI_COMM_WORLD_RANK === '2') {
    console.log('Core 2: Charlie');
} else if (process.env.OMPI_COMM_WORLD_RANK === '3') {
    console.log('Core 3: Dave');
}