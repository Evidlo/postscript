# Install Ghostview

    apt install gv
    gv test.ps -watch
    # adjust view settings: `1.000 > Fit to Window`

## Postscript is Stack-based

``` postscript
% some multiplications
5 3 mul 5 mul
```

- put 5 on the stack 
  - stack: [5]
- put 3 on the stack
  - stack: [5 3]
- multiply top two elements on stack and put on the stack
  - stack: [15]
- put 5 on the stack
  - stack: [15 5]
- multiply top two elements on stack and put on the stack
  - stack: [15 5 mul] -> [75]

## Functions and Variables

Functions look like this:

``` postscript
/[func_name] {[function operations]} def
```

For example, to create a function which converts from inches to pixel coordinates (72 pixels per inch)

``` postscript
% function to convert inches to pixels
/inch {72 mul} def
```

Then to use the function

``` postscript
3 inch 3 inch mul
```

- put 3 on the stack
  - stack: [3]
- put {72 mul} on the stack
  - stack: [3 72 mul] -> [216]
- put 3 on the stack
  - stack: [216 3]
- put {72 mul} on the stack
  - stack: [216 3 72 mul] -> [216 216]
- multiply top two elements on stack and put on the stack
  - stack: [216 216 mul] -> [46656]
  
Postscript makes no distinction between variables and functions

``` postscript
% braces are optional for single argument
/some_constant 123 def
/some_constant {123} def
```

## Moving and Drawing Lines

Postscript uses a coordinate system from the bottom-left of the page:

```
   +y

   ^
   |
   |
   |
   o----> +x
```


``` postscript
/inch {72 mul} def

3 inch 3 inch moveto
% this is equivalent to '216 216 moveto'

% draw a square
3 inch 0 inch rlineto  % bottom edge
0 inch 3 inch rlineto  % right edge
3 inch 0 inch rlineto  % top edge
0 inch -3 inch rlineto % left edge

% draw the stroked out path
stroke
```

We can also rotate the entire canvas to draw a square

``` postscript
/inch {72 mul} def

3 inch 3 inch moveto
% this is equivalent to '216 216 moveto'

% draw a square
3 inch 0 inch rlineto
90 rotate
3 inch 0 inch rlineto
90 rotate
3 inch 0 inch rlineto
90 rotate
3 inch 0 inch rlineto
90 rotate

% draw the stroked out path
stroke
```

Use the `repeat` command to perform repeated actions

``` postscript
/inch {72 mul} def

3 inch 3 inch moveto
% this is equivalent to '216 216 moveto'

% draw a square
4 {
3 inch 0 inch rlineto
90 rotate
} repeat

% we can also fill the square if we close the path first
closepath
fill

% draw the stroked out path
stroke
```

## Writing Text

``` postscript
/inch {72 mul} def

/Times-Roman findfont
30 scalefont         % set font size
setfont              % set the font to times new roman

3 inch 3 inch moveto
(Hello world!) show
```

## Sending Postscript data to printer

Lots of networked printers are listening on TCP 9100 for data to print.  Most accept Postscript directly (and even PDF!).

    $ nc [printer_address] 9100 < test.ps
    
Append a `showpage` as the last line to tell the printer to begin printing:

``` postscript
% some cool postscript stuff
% ...

showpage
```
    
## Other Dumb Printer Things

Printers also accept [PJL](https://en.wikipedia.org/wiki/Printer_Job_Language) commands, which can control printers jobs:

echo "@PJL ECHO INSERT TOKEN" | nc [printer_address] 9100

## More Resources

Pretty graphics: <https://pianomanfrazier.com/post/drawing-with-postscript/>

More postscript examples from me: <https://github.com/Evidlo/examples/tree/master/postscript>

Summary of other commands: <https://personal.math.ubc.ca/~cass/courses/ps.html>
