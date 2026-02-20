const { exec, spawn } = require('child_process');

const server = spawn('npm', ['run', 'start', '--', '-p', '3002'], { shell: true });

server.stdout.on('data', () => { });
server.stderr.on('data', () => { });

setTimeout(() => {
    console.log("Starting lighthouse...");

    const env = { ...process.env };
    env.CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

    exec('npx lighthouse http://localhost:3002 --chrome-flags="--headless" --output json --output-path ./lighthouse.json', { env }, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);

        // Kill server
        spawn('taskkill', ['/pid', server.pid, '/f', '/t'], { shell: true }).on('close', () => process.exit(error ? 1 : 0));
    });
}, 8000);
