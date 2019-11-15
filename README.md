# JavaScript Parallel Programming Examples

Requirements
 - [Node.js](https://nodejs.org/en/)
 - [Open MPI](https://www.open-mpi.org)

## Let's Start!

### MPI basics

By using Open MPI's `mpiexec` command, we can run serial or parallel jobs in multiple processors.

For example:

```
$ mpiexec echo Hello
Hello
Hello
Hello
Hello
```

The Hello text is printed 4 times because the program is copied and running on 4 processes. My default setting is 4 because my current machine has 4 cores. You can set the total number of processes by `-np` option.

```
$ mpiexec -np 1 echo Hello
Hello
$ mpiexec -np 2 echo Hello
Hello
Hello
$ mpiexec -np 4 echo Hello
Hello
Hello
Hello
Hello
```

We can see the mapped location of each process by using `-display-map` option.

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

To make sure each process run in seperate cores, use `-bind-to core` option.

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

Due to OS limitation, some OSes do not support `-bind-to core`. For example, this is the result
if we run the command in macOS.

```
$ mpiexec -display-map -bind-to core echo hello
--------------------------------------------------------------------------
A request was made to bind a process, but at least one node does NOT
support binding processes to cpus.

Node: ezzat-mbp

Open MPI uses the "hwloc" library to perform process and memory
binding. This error message means that hwloc has indicated that
processor binding support is not available on this machine.

On OS X, processor and memory binding is not available at all (i.e.,
the OS does not expose this functionality).

On Linux, lack of the functionality can mean that you are on a
platform where processor and memory affinity is not supported in Linux
itself, or that hwloc was built without NUMA and/or processor affinity
support. When building hwloc (which, depending on your Open MPI
installation, may be embedded in Open MPI itself), it is important to
have the libnuma header and library files available. Different linux
distributions package these files under different names; look for
packages with the word "numa" in them. You may also need a developer
version of the package (e.g., with "dev" or "devel" in the name) to
obtain the relevant header files.

If you are getting this message on a non-OS X, non-Linux platform,
then hwloc does not support processor / memory affinity on this
platform. If the OS/platform does actually support processor / memory
affinity, then you should contact the hwloc maintainers:
https://github.com/open-mpi/hwloc.
--------------------------------------------------------------------------
```

We can run different commands on each core:

```
$ mpiexec -display-map -bind-to core -np 1 echo hello : -np 1 echo this : -np 1 echo is : -np 1 echo me
 Data for JOB [11168,1] offset 0

 ========================   JOB MAP   ========================

 Data for node: ubuntu  Num slots: 4    Max slots: 0    Num procs: 4
        Process OMPI jobid: [11168,1] App: 0 Process rank: 0 Bound: socket 0[core 0[hwt 0]]:[B/././.]
        Process OMPI jobid: [11168,1] App: 1 Process rank: 1 Bound: socket 0[core 1[hwt 0]]:[./B/./.]
        Process OMPI jobid: [11168,1] App: 2 Process rank: 2 Bound: socket 0[core 2[hwt 0]]:[././B/.]
        Process OMPI jobid: [11168,1] App: 3 Process rank: 3 Bound: socket 0[core 3[hwt 0]]:[./././B]

 =============================================================
hello
this
is
me
```

Read more about `mpiexec` command and available option in the [documentation](https://www.open-mpi.org/doc/current/man1/mpiexec.1.php).

### Using MPI with node.js
