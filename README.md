# JavaScript Parallel Programming Examples

In this tutorial, we're going to use node.js and Open MPI to create parallel programs. We use MPI over node's cluster module to get more control over the processes that we generate.

Requirements
 - [Node.js](https://nodejs.org/en/)
 - [Open MPI](https://www.open-mpi.org)

## MPI basics

By using Open MPI's `mpiexec` command, we can execute any job/process (serial and parallel) in Open MPI.

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

We can see the mapped location of each process by using `--display-map` option.

```
$ mpiexec --display-map echo Hello
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

To make sure each process run in seperate cores, use `--bind-to core` option.

```
$ mpiexec --display-map --bind-to core echo Hello
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

Due to OS limitation, some OSes do not support `--bind-to core`. For example, this is the result
if we run the command in macOS.

```
$ mpiexec --display-map --bind-to core echo hello
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

### Running different programs

We can run different commands on each core:

```
$ mpiexec --display-map --bind-to core -np 1 echo hello : -np 1 echo this : -np 1 echo is : -np 1 echo me
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

This allows us to run processes from different programs even from different programming languanges concurrently:

```
$ gcc hello.c -o hello
$ javac Hello.java
$ mpiexec --display-map --bind-to core -np 1 ./hello : -np 1 python3 hello.py : -np 1 java Hello : -np 1 node hello.js
 Data for JOB [13304,1] offset 0

 ========================   JOB MAP   ========================

 Data for node: ubuntu  Num slots: 4    Max slots: 0    Num procs: 4
        Process OMPI jobid: [13304,1] App: 0 Process rank: 0 Bound: socket 0[core 0[hwt 0]]:[B/././.]
        Process OMPI jobid: [13304,1] App: 1 Process rank: 1 Bound: socket 0[core 1[hwt 0]]:[./B/./.]
        Process OMPI jobid: [13304,1] App: 2 Process rank: 2 Bound: socket 0[core 2[hwt 0]]:[././B/.]
        Process OMPI jobid: [13304,1] App: 3 Process rank: 3 Bound: socket 0[core 3[hwt 0]]:[./././B]

 =============================================================
Hello from C!
Hello from Python!
Hello from JavaScript!
Hello from Java!
```

Read more about `mpiexec` command and available option in the [documentation](https://www.open-mpi.org/doc/current/man1/mpiexec.1.php).

## Using MPI with node.js

Using the same concept, we can run node program in multiple cores.

```
$ mpiexec --bind-to core node basic-demo.js
Hey!
Hey!
Hey!
Hey!
```

Each process has different env variables. By accessing those variables, we can make each process doing different tasks:

```
$ mpiexec --bind-to core node basic-demo-2.js
Core 0: Alice
Core 1: Bob
Core 2: Charlie
Core 3: Dave
```

> See all environment variables dump in `process-env.json`.

## Exporting stdout into files

You can export the stdout into files by using `--output-filename`:

```
mpiexec --bind-to core --output-filename ./temp/basic-demo-2-result node basic-demo-2.js
```

## Accepting command line arguments

Now, we can actually calculate things from input argument by using the techniques learned above:

```
$ mpiexec --bind-to core node calculate.js 5
Cube : 125
Factorial : 120
Square root : 2.23606797749979
Fibonacci : 5
```
```
$ mpiexec --bind-to core node calculate.js 7
Cube : 343
Square root : 2.6457513110645907
Factorial : 5040
Fibonacci : 13
```

## Wrapping mpiexec inside js file

Using `spawn` from `child_process` module, we can instantiate the `mpiexec` command within the js file.

```
$ node basic-demo-3.js
stdout:  Data for JOB [28058,1] offset 0

 ========================   JOB MAP   ========================

 Data for node: ubuntu  Num slots: 4    Max slots: 0    Num procs: 4
        Process OMPI jobid: [28058,1] App: 0 Process rank: 0 Bound: socket 0[core 0[hwt 0]]:[B/././.]
        Process OMPI jobid: [28058,1] App: 0 Process rank: 1 Bound: socket 0[core 1[hwt 0]]:[./B/./.]
        Process OMPI jobid: [28058,1] App: 0 Process rank: 2 Bound: socket 0[core 2[hwt 0]]:[././B/.]
        Process OMPI jobid: [28058,1] App: 0 Process rank: 3 Bound: socket 0[core 3[hwt 0]]:[./././B]

 =============================================================

stdout: Core 0: Alice

stdout: Core 1: Bob

stdout: Core 2: Charlie

stdout: Core 3: Dave

mpiexec exited with code 0
```

As you can see, we no longer use `mpiexec` command, but simply `node` command to run this parallel program.

Also, by checking the existence of OMPI env variables, we can make all the codes in one file.

```
$ node calculate-wrapped.js 6
stdout:  Data for JOB [10668,1] offset 0

 ========================   JOB MAP   ========================

 Data for node: ubuntu  Num slots: 4    Max slots: 0    Num procs: 4
        Process OMPI jobid: [10668,1] App: 0 Process rank: 0 Bound: socket 0[core 0[hwt 0]]:[B/././.]
        Process OMPI jobid: [10668,1] App: 0 Process rank: 1 Bound: socket 0[core 1[hwt 0]]:[./B/./.]
        Process OMPI jobid: [10668,1] App: 0 Process rank: 2 Bound: socket 0[core 2[hwt 0]]:[././B/.]
        Process OMPI jobid: [10668,1] App: 0 Process rank: 3 Bound: socket 0[core 3[hwt 0]]:[./././B]

 =============================================================

{ core: '1', result: 216 }
{ core: '0', result: 36 }
{ core: '2', result: 1296 }
{ core: '3', result: 7776 }
The sum of results is  9324
mpiexec exited with code 0
```

## Unleash the power of parallel programming

We will try two different approaches running the same naive permutation function. 

The first one is done in sequential fashion, the second one is done concurrently. 

> Note: In this algorithm, same characters in the input string are considered different characters.

Let's start with "Orange":

```
 node permute-seq.js Orange
[
  'Orange', 'Oraneg', 'Oragne', 'Oragen', 'Oraeng', 'Oraegn',
  'Ornage', 'Ornaeg', 'Orngae', 'Orngea', 'Orneag', 'Ornega',
  'Organe', 'Orgaen', 'Orgnae', 'Orgnea', 'Orgean', 'Orgena',
  'Oreang', 'Oreagn', 'Orenag', 'Orenga', 'Oregan', 'Oregna',
  'Oarnge', 'Oarneg', 'Oargne', 'Oargen', 'Oareng', 'Oaregn',
  'Oanrge', 'Oanreg', 'Oangre', 'Oanger', 'Oanerg', 'Oanegr',
  'Oagrne', 'Oagren', 'Oagnre', 'Oagner', 'Oagern', 'Oagenr',
  'Oaerng', 'Oaergn', 'Oaenrg', 'Oaengr', 'Oaegrn', 'Oaegnr',
  'Onrage', 'Onraeg', 'Onrgae', 'Onrgea', 'Onreag', 'Onrega',
  'Onarge', 'Onareg', 'Onagre', 'Onager', 'Onaerg', 'Onaegr',
  'Ongrae', 'Ongrea', 'Ongare', 'Ongaer', 'Ongera', 'Ongear',
  'Onerag', 'Onerga', 'Onearg', 'Oneagr', 'Onegra', 'Onegar',
  'Ograne', 'Ograen', 'Ogrnae', 'Ogrnea', 'Ogrean', 'Ogrena',
  'Ogarne', 'Ogaren', 'Oganre', 'Oganer', 'Ogaern', 'Ogaenr',
  'Ognrae', 'Ognrea', 'Ognare', 'Ognaer', 'Ognera', 'Ognear',
  'Ogeran', 'Ogerna', 'Ogearn', 'Ogeanr', 'Ogenra', 'Ogenar',
  'Oerang', 'Oeragn', 'Oernag', 'Oernga',
  ... 620 more items
]
Completed calculation, timestamp: 13
```
```
$ node permute-par.js 4 Orange
Starting
Number of Cores : 4
Input text : Orange
We will permute the substrings...
The substrings: [ 'range', 'Oange', 'Ornge', 'Orage', 'Orane', 'Orang' ]
Cakes for the cores: [
  { '0': 'range', '4': 'Orane' },
  { '1': 'Oange', '5': 'Orang' },
  { '2': 'Ornge' },
  { '3': 'Orage' }
]
Executing mpiexec...
 Data for JOB [47510,1] offset 0 Total slots allocated 4

 ========================   JOB MAP   ========================

 Data for node: ezzat-mbp       Num slots: 4    Max slots: 0    Num procs: 4
        Process OMPI jobid: [47510,1] App: 0 Process rank: 0 Bound: N/A
        Process OMPI jobid: [47510,1] App: 0 Process rank: 1 Bound: N/A
        Process OMPI jobid: [47510,1] App: 0 Process rank: 2 Bound: N/A
        Process OMPI jobid: [47510,1] App: 0 Process rank: 3 Bound: N/A

 =============================================================
Core 0 is permuting range
Core 0 is permuting Orane
Core 0 completed all permutations!
Core 1 is permuting Oange
Core 1 is permuting Orang
Core 1 completed all permutations!
Core 2 is permuting Ornge
Core 2 completed all permutations!
Core 3 is permuting Orage
Master detects all cores are done with their jobs!
Final Result: [
  'Orange', 'Oraneg', 'Oragne', 'Oragen', 'Oraeng', 'Oraegn',
  'Ornage', 'Ornaeg', 'Orngae', 'Orngea', 'Orneag', 'Ornega',
  'Organe', 'Orgaen', 'Orgnae', 'Orgnea', 'Orgean', 'Orgena',
  'Oreang', 'Oreagn', 'Orenag', 'Orenga', 'Oregan', 'Oregna',
  'Oarnge', 'Oarneg', 'Oargne', 'Oargen', 'Oareng', 'Oaregn',
  'Oanrge', 'Oanreg', 'Oangre', 'Oanger', 'Oanerg', 'Oanegr',
  'Oagrne', 'Oagren', 'Oagnre', 'Oagner', 'Oagern', 'Oagenr',
  'Oaerng', 'Oaergn', 'Oaenrg', 'Oaengr', 'Oaegrn', 'Oaegnr',
  'Onrage', 'Onraeg', 'Onrgae', 'Onrgea', 'Onreag', 'Onrega',
  'Onarge', 'Onareg', 'Onagre', 'Onager', 'Onaerg', 'Onaegr',
  'Ongrae', 'Ongrea', 'Ongare', 'Ongaer', 'Ongera', 'Ongear',
  'Onerag', 'Onerga', 'Onearg', 'Oneagr', 'Onegra', 'Onegar',
  'Ograne', 'Ograen', 'Ogrnae', 'Ogrnea', 'Ogrean', 'Ogrena',
  'Ogarne', 'Ogaren', 'Oganre', 'Oganer', 'Ogaern', 'Ogaenr',
  'Ognrae', 'Ognrea', 'Ognare', 'Ognaer', 'Ognera', 'Ognear',
  'Ogeran', 'Ogerna', 'Ogearn', 'Ogeanr', 'Ogenra', 'Ogenar',
  'Oerang', 'Oeragn', 'Oernag', 'Oernga',
  ... 620 more items
]
Completed calculation, timestamp: 275
```

The parallel code (`permute-par.js`) run worse in thime than the sequential code (`permute-seq.js`) due to some overheads required by the parallel code.

Now, let's try longer input, "ThisIsTest":

```
$ node permute-seq.js ThisIsTest
[
  'ThisIsTest', 'ThisIsTets', 'ThisIsTset', 'ThisIsTste', 'ThisIsTtes',
  'ThisIsTtse', 'ThisIseTst', 'ThisIseTts', 'ThisIsesTt', 'ThisIsestT',
  'ThisIsetTs', 'ThisIsetsT', 'ThisIssTet', 'ThisIssTte', 'ThisIsseTt',
  'ThisIssetT', 'ThisIsstTe', 'ThisIssteT', 'ThisIstTes', 'ThisIstTse',
  'ThisIsteTs', 'ThisIstesT', 'ThisIstsTe', 'ThisIstseT', 'ThisITsest',
  'ThisITsets', 'ThisITsset', 'ThisITsste', 'ThisITstes', 'ThisITstse',
  'ThisITesst', 'ThisITests', 'ThisITesst', 'ThisITests', 'ThisITetss',
  'ThisITetss', 'ThisITsset', 'ThisITsste', 'ThisITsest', 'ThisITsets',
  'ThisITstse', 'ThisITstes', 'ThisITtses', 'ThisITtsse', 'ThisITtess',
  'ThisITtess', 'ThisITtsse', 'ThisITtses', 'ThisIesTst', 'ThisIesTts',
  'ThisIessTt', 'ThisIesstT', 'ThisIestTs', 'ThisIestsT', 'ThisIeTsst',
  'ThisIeTsts', 'ThisIeTsst', 'ThisIeTsts', 'ThisIeTtss', 'ThisIeTtss',
  'ThisIessTt', 'ThisIesstT', 'ThisIesTst', 'ThisIesTts', 'ThisIestsT',
  'ThisIestTs', 'ThisIetsTs', 'ThisIetssT', 'ThisIetTss', 'ThisIetTss',
  'ThisIetssT', 'ThisIetsTs', 'ThisIssTet', 'ThisIssTte', 'ThisIsseTt',
  'ThisIssetT', 'ThisIsstTe', 'ThisIssteT', 'ThisIsTset', 'ThisIsTste',
  'ThisIsTest', 'ThisIsTets', 'ThisIsTtse', 'ThisIsTtes', 'ThisIsesTt',
  'ThisIsestT', 'ThisIseTst', 'ThisIseTts', 'ThisIsetsT', 'ThisIsetTs',
  'ThisIstsTe', 'ThisIstseT', 'ThisIstTse', 'ThisIstTes', 'ThisIstesT',
  'ThisIsteTs', 'ThisItsTes', 'ThisItsTse', 'ThisItseTs', 'ThisItsesT',
  ... 3628700 more items
]
Completed calculation, timestamp: 3716
```
```
$ node permute-par.js 4 ThisIsTest
Starting
Number of Cores : 4
Input text : ThisIsTest
We will permute the substrings...
The substrings: [
  'hisIsTest', 'TisIsTest',
  'ThsIsTest', 'ThiIsTest',
  'ThissTest', 'ThisITest',
  'ThisIsest', 'ThisIsTst',
  'ThisIsTet', 'ThisIsTes'
]
Cakes for the cores: [
  { '0': 'hisIsTest', '4': 'ThissTest', '8': 'ThisIsTet' },
  { '1': 'TisIsTest', '5': 'ThisITest', '9': 'ThisIsTes' },
  { '2': 'ThsIsTest', '6': 'ThisIsest' },
  { '3': 'ThiIsTest', '7': 'ThisIsTst' }
]
Executing mpiexec...
 Data for JOB [47702,1] offset 0 Total slots allocated 4

 ========================   JOB MAP   ========================

 Data for node: ezzat-mbp       Num slots: 4    Max slots: 0    Num procs: 4
        Process OMPI jobid: [47702,1] App: 0 Process rank: 0 Bound: N/A
        Process OMPI jobid: [47702,1] App: 0 Process rank: 1 Bound: N/A
        Process OMPI jobid: [47702,1] App: 0 Process rank: 2 Bound: N/A
        Process OMPI jobid: [47702,1] App: 0 Process rank: 3 Bound: N/A

 =============================================================
Core 0 is permuting hisIsTest
Core 1 is permuting TisIsTest
Core 2 is permuting ThsIsTest
Core 3 is permuting ThiIsTest
Core 1 is permuting ThisITest
Core 3 is permuting ThisIsTst
Core 0 is permuting ThissTest
Core 2 is permuting ThisIsest
Core 1 is permuting ThisIsTes
Core 3 completed all permutations!
Core 0 is permuting ThisIsTet
Core 2 completed all permutations!
Core 1 completed all permutations!
Master detects all cores are done with their jobs!
Final Result: [
  'ThisIsTest', 'ThisIsTets', 'ThisIsTset', 'ThisIsTste', 'ThisIsTtes',
  'ThisIsTtse', 'ThisIseTst', 'ThisIseTts', 'ThisIsesTt', 'ThisIsestT',
  'ThisIsetTs', 'ThisIsetsT', 'ThisIssTet', 'ThisIssTte', 'ThisIsseTt',
  'ThisIssetT', 'ThisIsstTe', 'ThisIssteT', 'ThisIstTes', 'ThisIstTse',
  'ThisIsteTs', 'ThisIstesT', 'ThisIstsTe', 'ThisIstseT', 'ThisITsest',
  'ThisITsets', 'ThisITsset', 'ThisITsste', 'ThisITstes', 'ThisITstse',
  'ThisITesst', 'ThisITests', 'ThisITesst', 'ThisITests', 'ThisITetss',
  'ThisITetss', 'ThisITsset', 'ThisITsste', 'ThisITsest', 'ThisITsets',
  'ThisITstse', 'ThisITstes', 'ThisITtses', 'ThisITtsse', 'ThisITtess',
  'ThisITtess', 'ThisITtsse', 'ThisITtses', 'ThisIesTst', 'ThisIesTts',
  'ThisIessTt', 'ThisIesstT', 'ThisIestTs', 'ThisIestsT', 'ThisIeTsst',
  'ThisIeTsts', 'ThisIeTsst', 'ThisIeTsts', 'ThisIeTtss', 'ThisIeTtss',
  'ThisIessTt', 'ThisIesstT', 'ThisIesTst', 'ThisIesTts', 'ThisIestsT',
  'ThisIestTs', 'ThisIetsTs', 'ThisIetssT', 'ThisIetTss', 'ThisIetTss',
  'ThisIetssT', 'ThisIetsTs', 'ThisIssTet', 'ThisIssTte', 'ThisIsseTt',
  'ThisIssetT', 'ThisIsstTe', 'ThisIssteT', 'ThisIsTset', 'ThisIsTste',
  'ThisIsTest', 'ThisIsTets', 'ThisIsTtse', 'ThisIsTtes', 'ThisIsesTt',
  'ThisIsestT', 'ThisIseTst', 'ThisIseTts', 'ThisIsetsT', 'ThisIsetTs',
  'ThisIstsTe', 'ThisIstseT', 'ThisIstTse', 'ThisIstTes', 'ThisIstesT',
  'ThisIsteTs', 'ThisItsTes', 'ThisItsTse', 'ThisItseTs', 'ThisItsesT',
  ... 3628700 more items
]
Completed calculation, timestamp: 2321
```

We can already see that the parallel code generate the result faster.
Let's try one character longer text, "BigRedKnife":

```
$ node permute-seq.js BigRedKnife
[
  'BigRedKnife', 'BigRedKnief', 'BigRedKnfie', 'BigRedKnfei', 'BigRedKneif',
  'BigRedKnefi', 'BigRedKinfe', 'BigRedKinef', 'BigRedKifne', 'BigRedKifen',
  'BigRedKienf', 'BigRedKiefn', 'BigRedKfnie', 'BigRedKfnei', 'BigRedKfine',
  'BigRedKfien', 'BigRedKfeni', 'BigRedKfein', 'BigRedKenif', 'BigRedKenfi',
  'BigRedKeinf', 'BigRedKeifn', 'BigRedKefni', 'BigRedKefin', 'BigRednKife',
  'BigRednKief', 'BigRednKfie', 'BigRednKfei', 'BigRednKeif', 'BigRednKefi',
  'BigRedniKfe', 'BigRedniKef', 'BigRednifKe', 'BigRednifeK', 'BigRednieKf',
  'BigRedniefK', 'BigRednfKie', 'BigRednfKei', 'BigRednfiKe', 'BigRednfieK',
  'BigRednfeKi', 'BigRednfeiK', 'BigRedneKif', 'BigRedneKfi', 'BigRedneiKf',
  'BigRedneifK', 'BigRednefKi', 'BigRednefiK', 'BigRediKnfe', 'BigRediKnef',
  'BigRediKfne', 'BigRediKfen', 'BigRediKenf', 'BigRediKefn', 'BigRedinKfe',
  'BigRedinKef', 'BigRedinfKe', 'BigRedinfeK', 'BigRedineKf', 'BigRedinefK',
  'BigRedifKne', 'BigRedifKen', 'BigRedifnKe', 'BigRedifneK', 'BigRedifeKn',
  'BigRedifenK', 'BigRedieKnf', 'BigRedieKfn', 'BigRedienKf', 'BigRedienfK',
  'BigRediefKn', 'BigRediefnK', 'BigRedfKnie', 'BigRedfKnei', 'BigRedfKine',
  'BigRedfKien', 'BigRedfKeni', 'BigRedfKein', 'BigRedfnKie', 'BigRedfnKei',
  'BigRedfniKe', 'BigRedfnieK', 'BigRedfneKi', 'BigRedfneiK', 'BigRedfiKne',
  'BigRedfiKen', 'BigRedfinKe', 'BigRedfineK', 'BigRedfieKn', 'BigRedfienK',
  'BigRedfeKni', 'BigRedfeKin', 'BigRedfenKi', 'BigRedfeniK', 'BigRedfeiKn',
  'BigRedfeinK', 'BigRedeKnif', 'BigRedeKnfi', 'BigRedeKinf', 'BigRedeKifn',
  ... 39916700 more items
]
Completed calculation, timestamp: 166772
```
```
$ node permute-par.js 4 BigRedKnife
Starting
Number of Cores : 4
Input text : BigRedKnife
We will permute the substrings...
The substrings: [
  'igRedKnife', 'BgRedKnife',
  'BiRedKnife', 'BigedKnife',
  'BigRdKnife', 'BigReKnife',
  'BigRednife', 'BigRedKife',
  'BigRedKnfe', 'BigRedKnie',
  'BigRedKnif'
]
Cakes for the cores: [
  { '0': 'igRedKnife', '4': 'BigRdKnife', '8': 'BigRedKnfe' },
  { '1': 'BgRedKnife', '5': 'BigReKnife', '9': 'BigRedKnie' },
  { '2': 'BiRedKnife', '6': 'BigRednife', '10': 'BigRedKnif' },
  { '3': 'BigedKnife', '7': 'BigRedKife' }
]
Executing mpiexec...
 Data for JOB [47849,1] offset 0 Total slots allocated 4

 ========================   JOB MAP   ========================

 Data for node: ezzat-mbp       Num slots: 4    Max slots: 0    Num procs: 4
        Process OMPI jobid: [47849,1] App: 0 Process rank: 0 Bound: N/A
        Process OMPI jobid: [47849,1] App: 0 Process rank: 1 Bound: N/A
        Process OMPI jobid: [47849,1] App: 0 Process rank: 2 Bound: N/A
        Process OMPI jobid: [47849,1] App: 0 Process rank: 3 Bound: N/A

 =============================================================
Core 0 is permuting igRedKnife
Core 1 is permuting BgRedKnife
Core 2 is permuting BiRedKnife
Core 3 is permuting BigedKnife
Core 0 is permuting BigRdKnife
Core 1 is permuting BigReKnife
Core 3 is permuting BigRedKife
Core 2 is permuting BigRednife
Core 0 is permuting BigRedKnfe
Core 3 completed all permutations!
Core 1 is permuting BigRedKnie
Core 2 is permuting BigRedKnif
Core 0 completed all permutations!
Core 1 completed all permutations!
Core 2 completed all permutations!
Master detects all cores are done with their jobs!
Final Result: [
  'BigRedKnife', 'BigRedKnief', 'BigRedKnfie', 'BigRedKnfei', 'BigRedKneif',
  'BigRedKnefi', 'BigRedKinfe', 'BigRedKinef', 'BigRedKifne', 'BigRedKifen',
  'BigRedKienf', 'BigRedKiefn', 'BigRedKfnie', 'BigRedKfnei', 'BigRedKfine',
  'BigRedKfien', 'BigRedKfeni', 'BigRedKfein', 'BigRedKenif', 'BigRedKenfi',
  'BigRedKeinf', 'BigRedKeifn', 'BigRedKefni', 'BigRedKefin', 'BigRednKife',
  'BigRednKief', 'BigRednKfie', 'BigRednKfei', 'BigRednKeif', 'BigRednKefi',
  'BigRedniKfe', 'BigRedniKef', 'BigRednifKe', 'BigRednifeK', 'BigRednieKf',
  'BigRedniefK', 'BigRednfKie', 'BigRednfKei', 'BigRednfiKe', 'BigRednfieK',
  'BigRednfeKi', 'BigRednfeiK', 'BigRedneKif', 'BigRedneKfi', 'BigRedneiKf',
  'BigRedneifK', 'BigRednefKi', 'BigRednefiK', 'BigRediKnfe', 'BigRediKnef',
  'BigRediKfne', 'BigRediKfen', 'BigRediKenf', 'BigRediKefn', 'BigRedinKfe',
  'BigRedinKef', 'BigRedinfKe', 'BigRedinfeK', 'BigRedineKf', 'BigRedinefK',
  'BigRedifKne', 'BigRedifKen', 'BigRedifnKe', 'BigRedifneK', 'BigRedifeKn',
  'BigRedifenK', 'BigRedieKnf', 'BigRedieKfn', 'BigRedienKf', 'BigRedienfK',
  'BigRediefKn', 'BigRediefnK', 'BigRedfKnie', 'BigRedfKnei', 'BigRedfKine',
  'BigRedfKien', 'BigRedfKeni', 'BigRedfKein', 'BigRedfnKie', 'BigRedfnKei',
  'BigRedfniKe', 'BigRedfnieK', 'BigRedfneKi', 'BigRedfneiK', 'BigRedfiKne',
  'BigRedfiKen', 'BigRedfinKe', 'BigRedfineK', 'BigRedfieKn', 'BigRedfienK',
  'BigRedfeKni', 'BigRedfeKin', 'BigRedfenKi', 'BigRedfeniK', 'BigRedfeiKn',
  'BigRedfeinK', 'BigRedeKnif', 'BigRedeKnfi', 'BigRedeKinf', 'BigRedeKifn',
  ... 39916700 more items
]
Completed calculation, timestamp: 39190
```

The parallel code wins a lot. It only takes ~39 seconds compared to the sequential code that takes ~167 seconds!
