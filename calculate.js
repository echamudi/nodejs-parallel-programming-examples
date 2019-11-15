const input = Number(process.argv[2]);
let result;
let label;

if (process.env.OMPI_COMM_WORLD_RANK === '0') {

    label = 'Square root :';
    result = Math.sqrt(input);

} else if (process.env.OMPI_COMM_WORLD_RANK === '1') {

    label = 'Cube :';
    result = Math.pow(input, 3);

} else if (process.env.OMPI_COMM_WORLD_RANK === '2') {

    let factorial = function (n) {
        j = 1;
        for(i=1;i<=n;i++){
          j = j*i;
        }
        return j;
    }
      
    label = 'Factorial :';
    result = factorial(input);

} else if (process.env.OMPI_COMM_WORLD_RANK === '3') {

    let memo = {};
    function fibonacci(n) {
        if (n <= 0) return 0;
        if (n <= 2) return 1;
        if (memo[n] !== undefined) return memo[n];
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
    
    label = 'Fibonacci :';
    result = fibonacci(input);
}

console.log(label, result);
