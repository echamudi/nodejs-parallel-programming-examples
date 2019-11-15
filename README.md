# JavaScript Parallel Programming Examples

Requirements
 - [Node.js](https://nodejs.org/en/)
 - [Open MPI](https://www.open-mpi.org)

## Let's Start!

### MPI basics

By using Open MPI's `mpiexec`, we can run serial or parallel jobs in multiple processors.

For example:

```
$ mpiexec echo Hello
Hello
Hello
Hello
Hello
```

The Hello is printed 4 times because I'm running on 4 cores. We can see the report by using `-display-map` optionn.

```
$ mpiexec -display-map echo Hello
 Data for JOB [3441,1] offset 0

 ========================   JOB MAP   ========================

 Data for node: ubuntu	Num slots: 4	Max slots: 0	Num procs: 4
 	Process OMPI jobid: [3441,1] App: 0 Process rank: 0 Bound: UNBOUND
 	Process OMPI jobid: [3441,1] App: 0 Process rank: 1 Bound: UNBOUND
 	Process OMPI jobid: [3441,1] App: 0 Process rank: 2 Bound: UNBOUND
 	Process OMPI jobid: [3441,1] App: 0 Process rank: 3 Bound: UNBOUND

 =============================================================
Hello
Hello
Hello
Hello
```

To make sure each process run in seperate processor, use `-bind-to core` option.

```
$ mpiexec -display-map -bind-to core echo Hello
 Data for JOB [4852,1] offset 0

 ========================   JOB MAP   ========================

 Data for node: ubuntu	Num slots: 4	Max slots: 0	Num procs: 4
 	Process OMPI jobid: [4852,1] App: 0 Process rank: 0 Bound: socket 0[core 0[hwt 0]]:[B/././.]
 	Process OMPI jobid: [4852,1] App: 0 Process rank: 1 Bound: socket 0[core 1[hwt 0]]:[./B/./.]
 	Process OMPI jobid: [4852,1] App: 0 Process rank: 2 Bound: socket 0[core 2[hwt 0]]:[././B/.]
 	Process OMPI jobid: [4852,1] App: 0 Process rank: 3 Bound: socket 0[core 3[hwt 0]]:[./././B]

 =============================================================
Hello
Hello
Hello
Hello
```

Read more about mpiexec command in the [documentation](https://www.open-mpi.org/doc/current/man1/mpiexec.1.php).