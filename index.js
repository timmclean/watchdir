#!/usr/bin/env node

var _ = require('underscore');
var ChildProcess = require('child_process');
var Yargs = require('yargs');

var FS_EVENTS = "attrib,modify,move,move_self,create,delete,delete_self";

var argv = Yargs
	.usage("Usage: $0 [-k] [-d <DELAY>] [-w] <cmd> <path1> [path2 ...]")
	.alias('k', 'kill')
	.describe('k', "Kill subprocess if a change is detected while the command is running")
	.boolean('k')
	.alias('d', 'delay')
	.describe('d', "Number of milliseconds to wait before rerunning <cmd>")
	.default('d', 100)
	.alias('w', 'wait')
	.describe('w', "Wait for first change before running <cmd>")
	.boolean('w')
	.demand(2)
	.help('h')
	.alias('h', 'help')
	.argv;

var shouldKill = argv.k;
var delay = argv.d;
var shouldWait = argv.w;
var cmd = argv._[0];
var files = argv._.slice(1);

var cmdProc = null;
var queued = false;

function runCmd() {
	if (cmdProc) {
		if (shouldKill) {
			cmdProc.kill();
		}

		queued = true;
		return;
	}

	var p = ChildProcess.spawn('bash', ['-c', cmd], {stdio: 'inherit'});
	cmdProc = p;
	p.on('exit', function (code) {
		if (cmdProc === p) {
			cmdProc = null;
		}

		if (queued) {
			queued = false;
			process.nextTick(runCmd);
		}
	});
}

if (!shouldWait) {
	runCmd();
}

var onFileUpdate = _.debounce(runCmd, delay);

var inotifyArgs = ['--recursive', '--monitor', '--event', FS_EVENTS, '--'].concat(files);
var watchProc = ChildProcess.spawn('inotifywait', inotifyArgs);
watchProc.stdout.on('data', function (data) {
	onFileUpdate();
});
