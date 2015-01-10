# Watchdir

A simple utility for rerunning a command when files are changed.  Most build
systems have this sort of functionality built in, but sometimes I don't want to
bother with a build system.

## Usage

```
Usage: wdir [-k] [-d <DELAY>] [-w] <cmd> <path1> [path2 ...]

Options:
  -k, --kill   Kill subprocess if a change is detected while the command is running
  -d, --delay  Number of milliseconds to wait before rerunning <cmd>                 [default: 100]
  -w, --wait   Wait for first change before running <cmd>                          
  -h, --help   Show help                                                           
```
